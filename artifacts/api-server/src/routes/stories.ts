import { Router, type IRouter } from "express";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db, storiesTable, topicsTable, usersTable, userPreferencesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// List every story the user has saved — from catalog topics and the free-text
// Story Generator alike — for a "read/listen later" library view.
router.get("/stories", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;

  const rows = await db.select({
    id: storiesTable.id,
    topicId: storiesTable.topicId,
    customTopicTitle: storiesTable.customTopicTitle,
    storyText: storiesTable.storyText,
    funFacts: storiesTable.funFacts,
    generatedAt: storiesTable.generatedAt,
    shareToken: storiesTable.shareToken,
    topicEraName: topicsTable.eraName,
    topicCategory: topicsTable.category,
  })
    .from(storiesTable)
    .leftJoin(topicsTable, eq(storiesTable.topicId, topicsTable.id))
    .where(eq(storiesTable.userId, userId))
    .orderBy(storiesTable.generatedAt);

  res.json(rows.map(r => ({
    id: r.id,
    topicId: r.topicId,
    title: r.topicEraName ?? r.customTopicTitle ?? "Untitled Story",
    category: r.topicCategory ?? "Custom",
    storyText: r.storyText,
    funFacts: r.funFacts,
    generatedAt: r.generatedAt,
    isShared: !!r.shareToken,
  })));
});

router.get("/stories/:topicId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const rawId = Array.isArray(req.params.topicId) ? req.params.topicId[0] : req.params.topicId;
  const topicId = parseInt(rawId, 10);
  if (isNaN(topicId)) {
    res.status(400).json({ error: "Invalid topicId" });
    return;
  }

  const [story] = await db.select().from(storiesTable)
    .where(and(eq(storiesTable.userId, userId), eq(storiesTable.topicId, topicId)))
    .limit(1);

  if (!story) {
    res.status(404).json({ error: "Story not yet generated" });
    return;
  }

  res.json({
    id: story.id,
    topicId: story.topicId,
    storyText: story.storyText,
    funFacts: story.funFacts,
    generatedAt: story.generatedAt,
  });
});

router.post("/stories/:topicId/generate", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const rawId = Array.isArray(req.params.topicId) ? req.params.topicId[0] : req.params.topicId;
  const topicId = parseInt(rawId, 10);
  if (isNaN(topicId)) {
    res.status(400).json({ error: "Invalid topicId" });
    return;
  }

  const { forceRegenerate } = req.body ?? {};

  // Check if cached story exists
  if (!forceRegenerate) {
    const [existing] = await db.select().from(storiesTable)
      .where(and(eq(storiesTable.userId, userId), eq(storiesTable.topicId, topicId)))
      .limit(1);
    if (existing) {
      res.json({
        id: existing.id,
        topicId: existing.topicId,
        storyText: existing.storyText,
        funFacts: existing.funFacts,
        generatedAt: existing.generatedAt,
      });
      return;
    }
  }

  // Fetch topic and user data for generation
  const [topic] = await db.select().from(topicsTable).where(eq(topicsTable.id, topicId)).limit(1);
  if (!topic) {
    res.status(404).json({ error: "Topic not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [prefs] = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, userId)).limit(1);

  // Build prompt
  const ageMode = user?.ageMode ?? "adult";
  const interests: string[] = [
    ...(prefs?.sports ?? []),
    ...(prefs?.videoGames ?? []),
    ...(prefs?.movieGenres ?? []),
    ...(prefs?.hobbies ?? []),
    ...(prefs?.books ?? []),
  ];
  const interestsStr = interests.length > 0
    ? `The user's interests include: ${interests.join(", ")}.`
    : "";
  const locationStr = prefs?.city ? `The user is from ${prefs.city}${prefs.country ? `, ${prefs.country}` : ""}.` : "";

  const readingLevel = ageMode === "kid"
    ? "Write for a child (ages 6-10): very simple vocabulary, short sentences, lots of fun comparisons to things kids love."
    : ageMode === "teen"
    ? "Write for a teenager (ages 11-17): engaging and conversational, not too simple but not overly academic."
    : "Write for an adult: rich language, nuanced, still fun and conversational — never textbook-dry.";

  const coreFacts = (topic.coreFacts ?? []).join("\n- ");

  const prompt = `You are TimeDive, a history storyteller who makes history vivid and personal.

Write a short, engaging story (300-500 words) about: ${topic.eraName} — ${topic.description}

Core historical facts to weave in accurately:
- ${coreFacts}

${readingLevel}

${interestsStr}
${locationStr}

${interestsStr ? "Naturally weave the user's interests into the story as comparisons, character analogies, or modern parallels. Make it feel personally written for them." : ""}

FORMATTING RULES (strictly follow):
- Write in plain prose paragraphs only.
- Do NOT use any markdown — no asterisks (* or **), no underscores (_ or __), no pound signs (#), no backticks.
- Do not bold or italicise any words. Just clean, readable sentences.

After the main story, add a section titled exactly "Fun Facts 🎉" with exactly 3-5 short, surprising or funny TRUE facts as a bulleted list using •.

Format your response as:
[story paragraphs — plain text, no markdown]

Fun Facts 🎉
• [fact 1]
• [fact 2]
• [fact 3]
• [fact 4 optional]
• [fact 5 optional]`;

  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

  let storyText: string;
  let funFacts: string;

  if (apiKey) {
    try {
      const anthropicBaseUrl = baseUrl || "https://api.anthropic.com";
      const response = await fetch(`${anthropicBaseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        req.log.error({ status: response.status, body: errText }, "Claude API error");
        throw new Error(`Claude API returned ${response.status}`);
      }

      const data = await response.json() as { content: Array<{ type: string; text: string }> };
      const fullText = data.content.find(b => b.type === "text")?.text ?? "";

      // Split story from fun facts
      const funFactsIndex = fullText.indexOf("Fun Facts");
      if (funFactsIndex > -1) {
        storyText = fullText.substring(0, funFactsIndex).trim();
        funFacts = fullText.substring(funFactsIndex).trim();
      } else {
        storyText = fullText.trim();
        funFacts = "Fun Facts 🎉\n• History was never boring — it was lived by real people just like you!";
      }
    } catch (err) {
      req.log.error({ err }, "Story generation failed");
      // Fallback story
      storyText = `Imagine traveling back to the time of ${topic.eraName}...\n\n${topic.description}\n\n${(topic.coreFacts ?? []).join(" ")}`;
      funFacts = "Fun Facts 🎉\n• Story generation requires an Anthropic API key. Set ANTHROPIC_API_KEY to enable AI-powered stories.";
    }
  } else {
    logger.warn("ANTHROPIC_API_KEY not set — generating placeholder story");
    storyText = `Welcome to ${topic.eraName}!\n\n${topic.description}\n\nHere are some amazing facts about this era:\n\n${(topic.coreFacts ?? []).map(f => `• ${f}`).join("\n")}`;
    funFacts = "Fun Facts 🎉\n• To unlock AI-powered personalized stories, set your ANTHROPIC_API_KEY in the environment settings.\n• Once set, every story will be personally tailored to your interests!\n• Stories will reference your hobbies, games, and favorite things.";
  }

  // Upsert story
  const existingStories = await db.select().from(storiesTable)
    .where(and(eq(storiesTable.userId, userId), eq(storiesTable.topicId, topicId)))
    .limit(1);

  let story;
  if (existingStories.length > 0 && forceRegenerate) {
    [story] = await db.update(storiesTable)
      .set({ storyText, funFacts, generatedAt: new Date() })
      .where(and(eq(storiesTable.userId, userId), eq(storiesTable.topicId, topicId)))
      .returning();
  } else {
    [story] = await db.insert(storiesTable)
      .values({ userId, topicId, storyText, funFacts })
      .returning();
  }

  res.json({
    id: story.id,
    topicId: story.topicId,
    storyText: story.storyText,
    funFacts: story.funFacts,
    generatedAt: story.generatedAt,
  });
});

// Generate (or return the existing) public share link for one of the user's
// own stories. Sharing is opt-in and per-story — nothing is public until
// this is called.
router.post("/stories/:id/share", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid story id" });
    return;
  }

  const [story] = await db.select().from(storiesTable)
    .where(and(eq(storiesTable.id, id), eq(storiesTable.userId, userId)))
    .limit(1);
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const shareToken = story.shareToken ?? crypto.randomBytes(12).toString("hex");
  if (!story.shareToken) {
    await db.update(storiesTable).set({ shareToken }).where(eq(storiesTable.id, id));
  }

  res.json({ shareToken });
});

router.delete("/stories/:id/share", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid story id" });
    return;
  }

  await db.update(storiesTable).set({ shareToken: null })
    .where(and(eq(storiesTable.id, id), eq(storiesTable.userId, userId)));
  res.json({ message: "Story is no longer shared" });
});

// Public — no auth. Anyone with the link can read a shared story.
router.get("/public/stories/:token", async (req, res): Promise<void> => {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

  const [story] = await db.select({
    storyText: storiesTable.storyText,
    funFacts: storiesTable.funFacts,
    topicId: storiesTable.topicId,
    customTopicTitle: storiesTable.customTopicTitle,
    topicEraName: topicsTable.eraName,
  })
    .from(storiesTable)
    .leftJoin(topicsTable, eq(storiesTable.topicId, topicsTable.id))
    .where(eq(storiesTable.shareToken, token))
    .limit(1);

  if (!story) {
    res.status(404).json({ error: "This shared story doesn't exist or is no longer shared" });
    return;
  }

  res.json({
    title: story.topicEraName ?? story.customTopicTitle ?? "Untitled Story",
    storyText: story.storyText,
    funFacts: story.funFacts,
  });
});

// POST /stories/custom — generate a story for any free-text historical topic
router.post("/stories/custom", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session!.userId as number;
  const { customTopic, age: bodyAge, hobbies: bodyHobbies } = req.body ?? {};

  if (!customTopic || typeof customTopic !== "string" || customTopic.trim().length < 2) {
    res.status(400).json({ error: "customTopic is required (min 2 characters)" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [prefs] = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.userId, userId)).limit(1);

  // Use request-supplied age/hobbies first; fall back to stored profile
  const ageNum: number | undefined = (typeof bodyAge === "number" && bodyAge > 0) ? bodyAge : (user?.age ?? undefined);
  const ageMode = ageNum
    ? (ageNum <= 12 ? "kid" : ageNum <= 17 ? "teen" : "adult")
    : (user?.ageMode ?? "adult");

  const ageStr = ageNum ? `The reader is ${ageNum} years old.` : "";

  // Merge body hobbies with stored preferences; body hobbies take priority
  const storedInterests: string[] = [
    ...(prefs?.sports ?? []),
    ...(prefs?.videoGames ?? []),
    ...(prefs?.movieGenres ?? []),
    ...(prefs?.hobbies ?? []).filter((h: string) => !h.startsWith("History interest:")),
    ...(prefs?.books ?? []),
  ];
  const interests: string[] = Array.isArray(bodyHobbies) && bodyHobbies.length > 0
    ? bodyHobbies
    : storedInterests;

  const interestsStr = interests.length > 0
    ? `The reader's hobbies and interests: ${interests.join(", ")}.`
    : "";

  const readingLevel = ageMode === "kid"
    ? "Write for a child: very simple vocabulary, short sentences, vivid imagery and fun comparisons to everyday things."
    : ageMode === "teen"
    ? "Write for a teenager: engaging and conversational, not too simple but not overly academic. Use relatable references."
    : "Write for an adult: rich language, nuanced analysis, still fun and conversational — never textbook-dry.";

  const prompt = `You are TimeDive, an expert history storyteller who makes the past vivid and personal.

The reader wants to learn about: "${customTopic.trim()}"

Write a short, engaging, historically accurate story (350–550 words) about this topic.

ACCURACY REQUIREMENTS:
- Every claim must be grounded in documented historical facts (encyclopedias, academic consensus, primary sources).
- For a specific person: include real biographical details — dates, places, key achievements.
- For an era or event: include verified dates, causes, key figures, lasting consequences.
- Never invent facts. If something is uncertain, say "historians believe" or "according to records".

${readingLevel}
${ageStr}
${interestsStr}
${interests.length > 0 ? "Naturally weave the reader's interests into the story as comparisons, character analogies, or modern parallels — make it feel personally written for them." : ""}

FORMATTING RULES (strictly follow):
- Write in plain prose paragraphs only.
- Do NOT use any markdown formatting — no asterisks (* or **), no underscores (_ or __), no pound signs (#), no backticks, no hyphens as bullets in the main story.
- Do not bold or italicise any words. Just write clean sentences.

After the main story, add a section titled exactly "Fun Facts 🎉" followed by 3–5 short surprising TRUE facts as a bulleted list using the bullet character •.

Your full response format:
[story paragraphs here — plain text, no markdown]

Fun Facts 🎉
• [fact 1]
• [fact 2]
• [fact 3]`;

  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

  if (!apiKey) {
    res.status(503).json({ error: "Story generation is not configured. Please set ANTHROPIC_API_KEY." });
    return;
  }

  try {
    const anthropicBaseUrl = baseUrl || "https://api.anthropic.com";
    const response = await fetch(`${anthropicBaseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "Claude API error");
      throw new Error(`Claude API returned ${response.status}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const fullText = data.content.find(b => b.type === "text")?.text ?? "";

    let storyText: string;
    let funFacts: string;
    const funFactsIndex = fullText.indexOf("Fun Facts");
    if (funFactsIndex > -1) {
      storyText = fullText.substring(0, funFactsIndex).trim();
      funFacts = fullText.substring(funFactsIndex).trim();
    } else {
      storyText = fullText.trim();
      funFacts = "Fun Facts 🎉\n• This topic has a rich history waiting to be explored!";
    }

    const [story] = await db.insert(storiesTable)
      .values({ userId, customTopicTitle: customTopic.trim(), storyText, funFacts })
      .returning();

    res.json({ id: story.id, customTopic: customTopic.trim(), storyText, funFacts });
  } catch (err) {
    req.log.error({ err }, "Custom story generation failed");
    res.status(500).json({ error: "Story generation failed. Please try again." });
  }
});

export default router;
