import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  ottoman: text("ottoman").notNull(),
  pronunciation: text("pronunciation").notNull(),
  turkish: text("turkish").notNull(),
  example: text("example"),
  category: text("category"),
  additionalMeanings: text("additional_meanings").array().default([]),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").notNull(),
  difficulty: integer("difficulty").notNull().default(0), // 0=new, 1=easy, 2=medium, 3=hard
  repetitions: integer("repetitions").notNull().default(0),
  interval: integer("interval").notNull().default(1), // days
  easeFactor: real("ease_factor").notNull().default(2.5),
  nextReviewDate: timestamp("next_review_date").notNull(),
  lastStudied: timestamp("last_studied"),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalAnswers: integer("total_answers").notNull().default(0),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  wordsStudied: integer("words_studied").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalAnswers: integer("total_answers").notNull(),
  duration: integer("duration").notNull(), // in minutes
});

export const insertWordSchema = createInsertSchema(words).pick({
  ottoman: true,
  pronunciation: true,
  turkish: true,
  example: true,
  category: true,
  additionalMeanings: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  wordId: true,
  difficulty: true,
  repetitions: true,
  interval: true,
  easeFactor: true,
  nextReviewDate: true,
  lastStudied: true,
  correctAnswers: true,
  totalAnswers: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  date: true,
  wordsStudied: true,
  correctAnswers: true,
  totalAnswers: true,
  duration: true,
});

export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

// API response types
export type WordWithProgress = Word & {
  progress?: UserProgress;
  nextReview?: Date;
  isNew?: boolean;
};

export type DashboardStats = {
  learnedWords: number;
  todayStudyTime: number;
  accuracy: number;
  streak: number;
  pendingFlashcards: number;
  pendingReviews: number;
  totalWords: number;
};

export type FlashcardSession = {
  words: WordWithProgress[];
  currentIndex: number;
  totalWords: number;
  sessionId: string;
};
