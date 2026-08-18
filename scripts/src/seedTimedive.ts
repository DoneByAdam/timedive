import { db, topicsTable, badgesTable } from "@workspace/db";
import { TOPICS, BADGES } from "../../artifacts/api-server/src/lib/topicSeed.js";

async function seed() {
  console.log("Seeding topics...");
  for (const topic of TOPICS) {
    await db.insert(topicsTable).values(topic).onConflictDoNothing();
  }
  console.log(`Inserted ${TOPICS.length} topics`);

  console.log("Seeding badges...");
  for (const badge of BADGES) {
    await db.insert(badgesTable).values(badge).onConflictDoNothing();
  }
  console.log(`Inserted ${BADGES.length} badges`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
