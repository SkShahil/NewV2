import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authController } from "./controllers/authController";
import { quizController } from "./controllers/quizController";
import { challengeController } from "./controllers/challengeController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/user", authController.getCurrentUser);
  
  // Quiz routes
  app.post("/api/quiz/generate", quizController.generateQuiz);
  app.get("/api/quiz/:id", quizController.getQuiz);
  app.post("/api/quiz/check-answer", quizController.checkAnswer);
  app.post("/api/quiz/submit", quizController.submitQuiz);
  
  // Challenge routes
  app.post("/api/challenge/create", challengeController.createChallenge);
  app.get("/api/challenge/:token", challengeController.getChallenge);
  app.post("/api/challenge/:id/status", challengeController.updateStatus);
  app.get("/api/challenge/user/:userId", challengeController.getUserChallenges);

  // Add leaderboard endpoint
  app.get('/api/leaderboard', (req, res) => {
    const { period } = req.query;
    // For now, return a static leaderboard
    const leaderboard = [
      { user: 'Sarah Johnson', points: 1850, quizzes: 28, avgScore: 87.3 },
      { user: 'Carlos Rodriguez', points: 1720, quizzes: 24, avgScore: 85.9 },
      { user: 'Emma Wilson', points: 1640, quizzes: 22, avgScore: 82.1 },
      { user: 'You', points: 1580, quizzes: 20, avgScore: 80.7 },
    ];
    res.json({ success: true, period, leaderboard });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
