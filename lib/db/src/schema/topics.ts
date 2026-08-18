import { pgTable, serial, text, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const topicsTable = pgTable("topics", {
  id: serial("id").primaryKey(),
  eraName: text("era_name").notNull(),
  category: text("category").notNull(),
  depthLevel: integer("depth_level").notNull(), // 1=shallow/recent, 10=deep/ancient
  description: text("description").notNull(),
  coreFacts: jsonb("core_facts").$type<string[]>().notNull().default([]),
  gradeRangeMin: integer("grade_range_min"),
  gradeRangeMax: integer("grade_range_max"),
});

export const insertTopicSchema = createInsertSchema(topicsTable).omit({ id: true });
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topicsTable.$inferSelect;
