import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  ageMode: text("age_mode"), // kid | teen | adult
  age: integer("age"),
  gradeLevel: integer("grade_level"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  recapEmailOptIn: boolean("recap_email_opt_in").notNull().default(false),
  // A preset key (e.g. "submarine") rather than an uploaded image — see
  // AVATAR_OPTIONS on the frontend for the full set.
  avatar: text("avatar"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
