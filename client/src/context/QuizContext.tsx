import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Question } from '@/lib/gemini';
import { createQuiz, createQuizAttempt, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { onAuthStateChanged, User } from 'firebase/auth';

interface QuizContextType {
  currentQuiz: QuizData | null;
  currentQuestion: number;
  userAnswers: Answer[];
  timeLeft: number | null;
  isQuizCompleted: boolean;
  loadQuiz: (quiz: QuizData) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  answerQuestion: (answer: string | string[]) => void;
  completeQuiz: () => Promise<string | null>;
  resetQuiz: () => void;
}

export interface QuizData {
  id?: string;
  title: string;
  topic: string;
  quizType: 'multiple-choice' | 'true-false' | 'short-answer';
  questions: Question[];
  timeLimit?: number; // in minutes
}

interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
}

const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load a quiz
  const loadQuiz = useCallback((quiz: QuizData) => {
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setIsQuizCompleted(false);
    
    // Set up timer if timeLimit is provided
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60); // Convert to seconds
    } else {
      setTimeLeft(null);
    }
  }, []);
  
  // Start the quiz and timer
  const startQuiz = useCallback(() => {
    if (!currentQuiz) return;
    
    // Set up timer if timeLimit is provided
    if (currentQuiz.timeLimit && timeLeft !== null) {
      // Clear existing interval if any
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Set new interval
      const interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-submit when time is up
            completeQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
    }
  }, [currentQuiz, timeLeft, timerInterval]);
  
  // Navigate to next question
  const nextQuestion = useCallback(() => {
    if (!currentQuiz) return;
    
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuiz, currentQuestion]);
  
  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);
  
  // Record an answer
  const answerQuestion = useCallback((answer: string | string[]) => {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions[currentQuestion];
    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
      : answer === question.correctAnswer;
    
    setUserAnswers((prev) => {
      // Find if this question has been answered before
      const existingAnswerIndex = prev.findIndex(a => a.questionId === question.id);
      
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        const newAnswers = [...prev];
        newAnswers[existingAnswerIndex] = {
          questionId: question.id,
          userAnswer: answer,
          isCorrect
        };
        return newAnswers;
      } else {
        // Add new answer
        return [...prev, {
          questionId: question.id,
          userAnswer: answer,
          isCorrect
        }];
      }
    });
    
    // Automatically move to next question if not the last one
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuiz, currentQuestion]);
  
  // Complete the quiz and save results
  const completeQuiz = useCallback(async () => {
    if (!currentQuiz || !user) return null;
    
    // Clear timer if active
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setIsQuizCompleted(true);
    
    // Calculate score
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    try {
      // Save quiz if it doesn't have an ID (newly generated)
      let quizId = currentQuiz.id;
      
      if (!quizId) {
        const savedQuiz = await createQuiz(user.uid, {
          title: currentQuiz.title,
          topic: currentQuiz.topic,
          quizType: currentQuiz.quizType,
          questions: currentQuiz.questions,
          isPublic: true
        });
        quizId = savedQuiz.id;
      }
      
      // Save quiz attempt
      const attemptData = {
        userId: user.uid,
        quizId,
        score,
        totalQuestions: currentQuiz.questions.length,
        correctAnswers,
        answers: userAnswers,
        completedAt: new Date().toISOString(),
        timeTaken: currentQuiz.timeLimit 
          ? (currentQuiz.timeLimit * 60) - (timeLeft || 0) 
          : null
      };
      
      const attempt = await createQuizAttempt(attemptData);
      
      toast({
        title: "Quiz Completed!",
        description: `Your score: ${score}%`,
      });
      
      return attempt.id;
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [currentQuiz, user, userAnswers, timeLeft, timerInterval, toast]);
  
  // Reset quiz state
  const resetQuiz = useCallback(() => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setTimeLeft(null);
    setIsQuizCompleted(false);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval]);
  
  // Cleanup timer on unmount
  useCallback(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);
  
  const value = {
    currentQuiz,
    currentQuestion,
    userAnswers,
    timeLeft,
    isQuizCompleted,
    loadQuiz,
    startQuiz,
    nextQuestion,
    previousQuestion,
    answerQuestion,
    completeQuiz,
    resetQuiz
  };
  
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
