import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing users table (kept)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ===== 5-min exercises =====
export const subjectEnum = pgEnum("exercise_subject", [
  "matemaatika",
  "loogika",
  "emotsionaalne_soojendus",
]);

export const difficultyEnum = pgEnum("exercise_difficulty", [
  "baas",
  "raskem",
]);

export type Subject = (typeof subjectEnum.enumValues)[number];
export type Difficulty = (typeof difficultyEnum.enumValues)[number];

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  grade: text("grade").notNull(), // "1" | "2" | "3" | "4"
  subject: subjectEnum("subject").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  theme: text("theme"),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  // Optional teacher hints / answer checks depending on task
  expectedAnswer: text("expected_answer"),
  teacherTip: text("teacher_tip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const generateExerciseRequestSchema = z.object({
  grade: z.enum(["1", "2", "3", "4"]),
  subject: z.enum(["matemaatika", "loogika", "emotsionaalne_soojendus"]),
  difficulty: z.enum(["baas", "raskem"]),
  theme: z.string().optional(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type GenerateExerciseRequest = z.infer<
  typeof generateExerciseRequestSchema
>;

export type ExerciseResponse = Exercise;
export type ExerciseHistoryResponse = Exercise[];

// ===== Replit AI integration chat/audio module schema export (kept available) =====
// Some integration files expect these to exist. We re-export them from shared/models/chat.
export * from "./models/chat";
