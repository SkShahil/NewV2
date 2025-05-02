import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  birthdate: text("birthdate"),
  joinedDate: timestamp("joined_date").defaultNow(),
  linkedinUrl: text("linkedin_url"),
  instagramUrl: text("instagram_url"),
  role: text("role").default("user").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  quizType: text("quiz_type").notNull(), // "multiple-choice", "true-false", "short-answer"
  questions: json("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isPublic: boolean("is_public").default(true),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  timeTaken: integer("time_taken"), // in seconds
  completedAt: timestamp("completed_at"),
  answers: json("answers")
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  challengeToken: text("challenge_token").notNull().unique(),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  receiverEmail: text("receiver_email"),
  quizId: integer("quiz_id").references(() => quizzes.id),
  status: text("status").default("pending"), // "pending", "accepted", "completed"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  timeLimit: integer("time_limit"), // in minutes
  showResultsImmediately: boolean("show_results_immediately").default(true)
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  category: text("category").notNull(), // "bug", "feature", "general"
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"), // "new", "reviewed", "resolved"
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, completedAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true, status: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type User = typeof users.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;

// Extended schemas for the frontend forms
export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
});

export type Question = z.infer<typeof questionSchema>;

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean(),
});

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
