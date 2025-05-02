import { 
  users, quizzes, quizAttempts, challenges, feedback,
  type User, type InsertUser, 
  type Quiz, type InsertQuiz,
  type QuizAttempt, type InsertQuizAttempt,
  type Challenge, type InsertChallenge,
  type Feedback, type InsertFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Quiz operations
  createQuiz(quizData: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizByFirebaseId(firebaseId: string): Promise<Quiz | undefined>;
  getQuizzesByUser(userId: number): Promise<Quiz[]>;
  getPublicQuizzes(limit?: number): Promise<Quiz[]>;
  
  // Quiz Attempt operations
  createQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]>;
  getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]>;
  
  // Challenge operations
  createChallenge(challengeData: InsertChallenge): Promise<Challenge>;
  getChallengeByToken(token: string): Promise<Challenge | undefined>;
  updateChallengeStatus(id: number, status: string): Promise<Challenge | undefined>;
  getChallengesByUser(userId: number): Promise<{sent: Challenge[], received: Challenge[]}>;
  
  // Feedback operations
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedbackByUser(userId: number): Promise<Feedback[]>;
  getAllFeedback(status?: string): Promise<Feedback[]>;
  updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseId, firebaseId));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Quiz operations
  async createQuiz(quizData: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values(quizData).returning();
    return quiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizByFirebaseId(firebaseId: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.firebaseId, firebaseId));
    return quiz;
  }

  async getQuizzesByUser(userId: number): Promise<Quiz[]> {
    return db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async getPublicQuizzes(limit: number = 20): Promise<Quiz[]> {
    return db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isPublic, true))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit);
  }

  // Quiz Attempt operations
  async createQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    const [attempt] = await db.insert(quizAttempts).values(attemptData).returning();
    return attempt;
  }

  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return attempt;
  }

  async getQuizAttemptsByUser(userId: number): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  // Challenge operations
  async createChallenge(challengeData: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values(challengeData).returning();
    return challenge;
  }

  async getChallengeByToken(token: string): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.challengeToken, token));
    return challenge;
  }

  async updateChallengeStatus(id: number, status: string): Promise<Challenge | undefined> {
    const [updated] = await db
      .update(challenges)
      .set({ status })
      .where(eq(challenges.id, id))
      .returning();
    return updated;
  }

  async getChallengesByUser(userId: number): Promise<{ sent: Challenge[]; received: Challenge[] }> {
    const sent = await db
      .select()
      .from(challenges)
      .where(eq(challenges.senderId, userId))
      .orderBy(desc(challenges.createdAt));
    
    const received = await db
      .select()
      .from(challenges)
      .where(eq(challenges.receiverId, userId))
      .orderBy(desc(challenges.createdAt));
    
    return { sent, received };
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getFeedbackByUser(userId: number): Promise<Feedback[]> {
    return db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async getAllFeedback(status?: string): Promise<Feedback[]> {
    const query = status 
      ? db.select().from(feedback).where(eq(feedback.status, status))
      : db.select().from(feedback);
    
    return query.orderBy(asc(feedback.status), desc(feedback.createdAt));
  }

  async updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ status })
      .where(eq(feedback.id, id))
      .returning();
    return updated;
  }
}

// Export an instance of the database storage
export const storage = new DatabaseStorage();
