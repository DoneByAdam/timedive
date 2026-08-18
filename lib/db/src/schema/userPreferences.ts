import { pgTable, serial, integer, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const userPreferencesTable = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  sports: jsonb("sports").$type<string[]>().default([]),
  videoGames: jsonb("video_games").$type<string[]>().default([]),
  movieGenres: jsonb("movie_genres").$type<string[]>().default([]),
  hobbies: jsonb("hobbies").$type<string[]>().default([]),
  books: jsonb("books").$type<string[]>().default([]),
  city: text("city"),
  country: text("country"),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferencesTable).omit({ id: true });
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferencesTable.$inferSelect;
