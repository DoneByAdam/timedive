import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, topicsTable, progressTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/topics", async (req, res): Promise<void> => {
  const topics = await db.select().from(topicsTable).orderBy(topicsTable.depthLevel);

  // If authenticated, mark which are completed
  const userId = req.session?.userId as number | undefined;
  let completedTopicIds = new Set<number>();
  if (userId) {
    const userProgress = await db.select({ topicId: progressTable.topicId })
      .from(progressTable)
      .where(eq(progressTable.userId, userId));
    completedTopicIds = new Set(userProgress.map(p => p.topicId));
  }

  res.json(topics.map(t => ({
    id: t.id,
    eraName: t.eraName,
    category: t.category,
    depthLevel: t.depthLevel,
    description: t.description,
    gradeRangeMin: t.gradeRangeMin,
    gradeRangeMax: t.gradeRangeMax,
    isCompleted: completedTopicIds.has(t.id),
  })));
});

router.get("/topics/suggested", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;

  // Import here to avoid circular
  const { usersTable } = await import("@workspace/db");
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  const allTopics = await db.select().from(topicsTable).orderBy(topicsTable.depthLevel);
  const userProgress = await db.select({ topicId: progressTable.topicId })
    .from(progressTable)
    .where(eq(progressTable.userId, userId));
  const completedIds = new Set(userProgress.map(p => p.topicId));

  let suggested = allTopics.filter(t => !completedIds.has(t.id));

  // Filter by grade if user has one
  if (user?.gradeLevel) {
    const gradeFiltered = suggested.filter(t =>
      (t.gradeRangeMin == null || t.gradeRangeMin <= user.gradeLevel!) &&
      (t.gradeRangeMax == null || t.gradeRangeMax >= user.gradeLevel!)
    );
    if (gradeFiltered.length >= 3) suggested = gradeFiltered;
  }

  res.json(suggested.slice(0, 6).map(t => ({
    id: t.id,
    eraName: t.eraName,
    category: t.category,
    depthLevel: t.depthLevel,
    description: t.description,
    gradeRangeMin: t.gradeRangeMin,
    gradeRangeMax: t.gradeRangeMax,
    isCompleted: false,
  })));
});

router.get("/topics/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid topic id" });
    return;
  }

  const [topic] = await db.select().from(topicsTable).where(eq(topicsTable.id, id)).limit(1);
  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const userId = req.session?.userId as number | undefined;
  let isCompleted = false;
  let hasStory = false;
  if (userId) {
    const { storiesTable } = await import("@workspace/db");
    const [prog] = await db.select().from(progressTable)
      .where(eq(progressTable.userId, userId))
      .limit(1);
    isCompleted = !!prog;

    const [story] = await db.select({ id: storiesTable.id }).from(storiesTable)
      .where(eq(storiesTable.userId, userId))
      .limit(1);
    hasStory = !!story;
  }

  res.json({
    id: topic.id,
    eraName: topic.eraName,
    category: topic.category,
    depthLevel: topic.depthLevel,
    description: topic.description,
    coreFacts: topic.coreFacts ?? [],
    gradeRangeMin: topic.gradeRangeMin,
    gradeRangeMax: topic.gradeRangeMax,
    isCompleted,
    hasStory,
  });
});

export default router;
