// User Types
export interface User {
  id: string;
  firebaseId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  birthdate?: string;
  joinedDate: Date;
  linkedinUrl?: string;
  instagramUrl?: string;
  role: 'user' | 'admin';
}

// Quiz Types
export interface Quiz {
  id: string;
  firebaseId: string;
  userId: number;
  title: string;
  topic: string;
  quizType: 'multiple-choice' | 'true-false' | 'short-answer';
  questions: Question[];
  createdAt: Date;
  isPublic: boolean;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// Quiz Attempt Types
export interface QuizAttempt {
  id: string;
  firebaseId: string;
  userId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  timeTaken?: number; // in seconds
  completedAt: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
}

// Challenge Types
export interface Challenge {
  id: string;
  firebaseId: string;
  challengeToken: string;
  senderId: number;
  receiverId?: number;
  receiverEmail?: string;
  quizId: number;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
  timeLimit: number; // in minutes
  showResultsImmediately: boolean;
}

// Feedback Types
export interface Feedback {
  id: string;
  firebaseId: string;
  userId: number;
  category: 'bug' | 'feature' | 'general';
  title: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: Date;
}
