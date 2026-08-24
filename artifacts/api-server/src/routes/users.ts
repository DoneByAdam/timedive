import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, userPreferencesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { isValidAvatar } from "../lib/avatars";

const router: IRouter = Router();

router.get("/users/me/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    ageMode: user.ageMode,
    age: user.age,
    gradeLevel: user.gradeLevel,
    onboardingComplete: user.onboardingComplete,
    recapEmailOptIn: user.recapEmailOptIn,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });
});

router.put("/users/me/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const { displayName, ageMode, age, gradeLevel, onboardingComplete, recapEmailOptIn, avatar } = req.body;

  if (avatar !== undefined && avatar !== null && !isValidAvatar(avatar)) {
    res.status(400).json({ error: "Invalid avatar selection" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (ageMode !== undefined) updates.ageMode = ageMode;
  if (age !== undefined) updates.age = age;
  if (gradeLevel !== undefined) updates.gradeLevel = gradeLevel;
  if (onboardingComplete !== undefined) updates.onboardingComplete = onboardingComplete;
  if (recapEmailOptIn !== undefined) updates.recapEmailOptIn = recapEmailOptIn;
  if (avatar !== undefined) updates.avatar = avatar;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    ageMode: user.ageMode,
    age: user.age,
    gradeLevel: user.gradeLevel,
    onboardingComplete: user.onboardingComplete,
    recapEmailOptIn: user.recapEmailOptIn,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });
});

router.get("/users/me/preferences", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  let [prefs] = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, userId)).limit(1);
  if (!prefs) {
    // Create empty prefs if not found
    [prefs] = await db.insert(userPreferencesTable).values({ userId }).returning();
  }
  res.json({
    userId: prefs.userId,
    sports: prefs.sports ?? [],
    videoGames: prefs.videoGames ?? [],
    movieGenres: prefs.movieGenres ?? [],
    hobbies: prefs.hobbies ?? [],
    books: prefs.books ?? [],
    city: prefs.city,
    country: prefs.country,
  });
});

router.put("/users/me/preferences", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const { sports, videoGames, movieGenres, hobbies, books, city, country } = req.body;

  const updates: Record<string, unknown> = {};
  if (sports !== undefined) updates.sports = sports;
  if (videoGames !== undefined) updates.videoGames = videoGames;
  if (movieGenres !== undefined) updates.movieGenres = movieGenres;
  if (hobbies !== undefined) updates.hobbies = hobbies;
  if (books !== undefined) updates.books = books;
  if (city !== undefined) updates.city = city;
  if (country !== undefined) updates.country = country;

  const existing = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, userId)).limit(1);
  let prefs;
  if (existing.length === 0) {
    [prefs] = await db.insert(userPreferencesTable).values({ userId, ...updates }).returning();
  } else {
    [prefs] = await db.update(userPreferencesTable).set(updates).where(eq(userPreferencesTable.userId, userId)).returning();
  }

  res.json({
    userId: prefs.userId,
    sports: prefs.sports ?? [],
    videoGames: prefs.videoGames ?? [],
    movieGenres: prefs.movieGenres ?? [],
    hobbies: prefs.hobbies ?? [],
    books: prefs.books ?? [],
    city: prefs.city,
    country: prefs.country,
  });
});

export default router;
