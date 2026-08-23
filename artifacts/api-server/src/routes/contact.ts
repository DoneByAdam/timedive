import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CONTACT_INBOX = "contact@mytimedive.com";

router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, message } = req.body ?? {};

  if (!name || typeof name !== "string" || !email || typeof email !== "string" || !message || typeof message !== "string") {
    res.status(400).json({ error: "name, email, and message are required" });
    return;
  }
  if (message.trim().length < 5) {
    res.status(400).json({ error: "Message is too short" });
    return;
  }

  const userId = req.session?.userId as number | undefined;

  await db.insert(contactMessagesTable).values({
    userId: userId ?? null,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TimeDive Contact Form <noreply@mytimedive.com>",
          to: CONTACT_INBOX,
          reply_to: email.trim(),
          subject: `New contact form message from ${name.trim()}`,
          html: `<p><strong>From:</strong> ${name.trim()} (${email.trim()})</p><p>${message.trim().replace(/\n/g, "<br>")}</p>`,
        }),
      });
    } catch (err) {
      // Don't fail the request — the message is already saved in contactMessagesTable.
      logger.error({ err }, "Failed to email contact form submission");
    }
  } else {
    logger.warn({ name, email }, "RESEND_API_KEY not set — contact message saved to DB only, not emailed");
  }

  res.json({ message: "Thanks for reaching out! We'll get back to you soon." });
});

export default router;
