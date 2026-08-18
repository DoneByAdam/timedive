import { Router, type IRouter } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db, progressTable, topicsTable, badgesTable, userBadgesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/progress", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;

  const allTopics = await db.select().from(topicsTable);
  const userProgress = await db.select({
    topicId: progressTable.topicId,
    completedAt: progressTable.completedAt,
  }).from(progressTable).where(eq(progressTable.userId, userId));

  const completedIds = new Set(userProgress.map(p => p.topicId));
  const totalTopics = allTopics.length;
  const completedTopics = completedIds.size;

  // Group by category
  const categoryMap = new Map<string, { total: number; completed: number }>();
  for (const topic of allTopics) {
    const existing = categoryMap.get(topic.category) ?? { total: 0, completed: 0 };
    existing.total++;
    if (completedIds.has(topic.id)) existing.completed++;
    categoryMap.set(topic.category, existing);
  }
  const completedByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));

  // Recent completions with era names
  const recentProgressRows = await db.select({
    topicId: progressTable.topicId,
    completedAt: progressTable.completedAt,
    eraName: topicsTable.eraName,
  })
    .from(progressTable)
    .innerJoin(topicsTable, eq(progressTable.topicId, topicsTable.id))
    .where(eq(progressTable.userId, userId))
    .orderBy(desc(progressTable.completedAt))
    .limit(5);

  res.json({
    totalTopics,
    completedTopics,
    completedByCategory,
    recentCompletions: recentProgressRows.map(r => ({
      topicId: r.topicId,
      eraName: r.eraName,
      completedAt: r.completedAt,
    })),
  });
});

router.post("/progress/complete", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const { topicId } = req.body;
  if (!topicId) {
    res.status(400).json({ error: "topicId is required" });
    return;
  }

  // Idempotent — only record once
  const existing = await db.select().from(progressTable)
    .where(and(eq(progressTable.userId, userId), eq(progressTable.topicId, topicId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(progressTable).values({ userId, topicId });
  }

  // Check for new badges
  const allProgress = await db.select().from(progressTable).where(eq(progressTable.userId, userId));
  const completedTopicIds = new Set(allProgress.map(p => p.topicId));
  const totalCompleted = completedTopicIds.size;

  const allTopics = await db.select().from(topicsTable);
  const allBadges = await db.select().from(badgesTable);
  const userBadgeRows = await db.select({ badgeId: userBadgesTable.badgeId })
    .from(userBadgesTable).where(eq(userBadgesTable.userId, userId));
  const earnedBadgeIds = new Set(userBadgeRows.map(r => r.badgeId));

  const newBadgesEarned: typeof allBadges = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let earned = false;

    if (badge.name === "First Dive" && totalCompleted >= 1) {
      earned = true;
    } else if (badge.name === "Deep Diver" && totalCompleted >= 5) {
      earned = true;
    } else if (badge.name === "History Buff" && totalCompleted >= 10) {
      earned = true;
    } else if (badge.name === "Time Traveler" && totalCompleted >= 25) {
      earned = true;
    } else {
      // Category completion badges
      const categoryTopics = allTopics.filter(t => t.category === badge.category);
      if (categoryTopics.length > 0 && categoryTopics.every(t => completedTopicIds.has(t.id))) {
        earned = true;
      }
    }

    if (earned) {
      await db.insert(userBadgesTable).values({ userId, badgeId: badge.id });
      newBadgesEarned.push(badge);
    }
  }

  const now = new Date();
  res.json({
    totalCompleted,
    newBadges: newBadgesEarned.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      category: b.category,
      icon: b.icon,
      earnedAt: now,
    })),
  });
});

router.get("/progress/badges", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;

  const earned = await db.select({
    id: badgesTable.id,
    name: badgesTable.name,
    description: badgesTable.description,
    category: badgesTable.category,
    icon: badgesTable.icon,
    earnedAt: userBadgesTable.earnedAt,
  })
    .from(userBadgesTable)
    .innerJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
    .where(eq(userBadgesTable.userId, userId))
    .orderBy(desc(userBadgesTable.earnedAt));

  res.json(earned);
});

export default router;
