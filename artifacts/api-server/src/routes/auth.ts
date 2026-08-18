import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, userPreferencesTable, passwordResetTokensTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    res.status(400).json({ error: "email, password, and displayName are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    displayName,
  }).returning();

  // Create empty preferences row
  await db.insert(userPreferencesTable).values({ userId: user.id }).onConflictDoNothing();

  req.session!.userId = user.id;
  res.status(201).json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingComplete: user.onboardingComplete,
    ageMode: user.ageMode,
    gradeLevel: user.gradeLevel,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));
  req.session!.userId = user.id;
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingComplete: user.onboardingComplete,
    ageMode: user.ageMode,
    gradeLevel: user.gradeLevel,
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  req.session!.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    onboardingComplete: user.onboardingComplete,
    ageMode: user.ageMode,
    gradeLevel: user.gradeLevel,
  });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  // Always return 200 to prevent email enumeration
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await db.insert(passwordResetTokensTable).values({ userId: user.id, token, expiresAt });

    // Email sending via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resetUrl = `${process.env.APP_URL || "https://your-app.replit.app"}/reset-password?token=${token}`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TimeDive <noreply@timedive.app>",
            to: user.email,
            subject: "Reset your TimeDive password",
            html: `<p>Hi ${user.displayName},</p><p>Click below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`,
          }),
        });
      } catch (err) {
        logger.error({ err }, "Failed to send password reset email");
      }
    } else {
      logger.warn({ token }, "RESEND_API_KEY not set — password reset token generated but not emailed");
    }
  }
  res.json({ message: "If an account with that email exists, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    res.status(400).json({ error: "Valid token and password (min 8 chars) required" });
    return;
  }

  const [resetToken] = await db.select().from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token)).limit(1);

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, resetToken.userId));
  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, resetToken.id));

  res.json({ message: "Password reset successfully" });
});

export default router;
