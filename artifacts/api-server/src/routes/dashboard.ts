import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, topicsTable, progressTable, userBadgesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  const allTopics = await db.select().from(topicsTable);
  const userProgress = await db.select({
    topicId: progressTable.topicId,
    completedAt: progressTable.completedAt,
    eraName: topicsTable.eraName,
  })
    .from(progressTable)
    .innerJoin(topicsTable, eq(progressTable.topicId, topicsTable.id))
    .where(eq(progressTable.userId, userId))
    .orderBy(desc(progressTable.completedAt));

  const completedTopicIds = new Set(userProgress.map(p => p.topicId));
  const [badgeCount] = await db.select({ count: userBadgesTable.id })
    .from(userBadgesTable)
    .where(eq(userBadgesTable.userId, userId));

  // Suggested next topics — not completed, up to 3
  const suggested = allTopics
    .filter(t => !completedTopicIds.has(t.id))
    .slice(0, 3)
    .map(t => ({
      id: t.id,
      eraName: t.eraName,
      category: t.category,
      depthLevel: t.depthLevel,
      description: t.description,
      gradeRangeMin: t.gradeRangeMin,
      gradeRangeMax: t.gradeRangeMax,
      isCompleted: false,
    }));

  res.json({
    totalTopics: allTopics.length,
    completedTopics: completedTopicIds.size,
    recentTopics: userProgress.slice(0, 3).map(r => ({
      topicId: r.topicId,
      eraName: r.eraName,
      completedAt: r.completedAt,
    })),
    suggestedNext: suggested,
    badgeCount: badgeCount?.count ? 1 : 0,
    lastLoginAt: user?.lastLoginAt ?? null,
  });
});

export default router;
