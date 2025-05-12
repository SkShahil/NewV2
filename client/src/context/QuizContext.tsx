import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Question } from '@/lib/gemini';
import { createQuiz, createQuizAttempt, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { onAuthStateChanged, User } from 'firebase/auth';
import { nanoid } from 'nanoid';

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
  setCurrentQuestion: (question: number) => void;
}

export interface QuizData {
  id?: string;
  title: string;
  topic: string;
  quizType: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
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
    console.log("QuizContext: loadQuiz called with:", JSON.stringify(quiz, null, 2)); // Detailed log of incoming quiz
    
    if (!quiz) {
      console.error("QuizContext: Attempted to load null or undefined quiz");
      return;
    }
    
    // Create a safe copy of the quiz with default values where needed
    const safeQuiz: QuizData = {
      id: quiz.id,
      title: quiz.title || 'Untitled Quiz',
      topic: quiz.topic || 'General Knowledge',
      quizType: (quiz.quizType as 'multiple-choice' | 'true-false' | 'short-answer' | 'auto') || 'multiple-choice',
      questions: Array.isArray(quiz.questions) ? quiz.questions : [],
      timeLimit: typeof quiz.timeLimit === 'number' ? quiz.timeLimit : 10,
    };
    
    // Log the state of questions before the check
    console.log("QuizContext: Parsed quiz.questions type:", typeof quiz.questions, "Is it an array?", Array.isArray(quiz.questions));
    if (Array.isArray(quiz.questions)) {
      console.log("QuizContext: Parsed quiz.questions length:", quiz.questions.length);
    }
    console.log("QuizContext: safeQuiz.questions before check:", JSON.stringify(safeQuiz.questions, null, 2));

    if (!safeQuiz.questions.length) {
      console.error("QuizContext: Quiz has no questions or invalid questions array. Original quiz.questions:", quiz.questions, "Processed safeQuiz.questions:", safeQuiz.questions);
      toast({
        title: 'Error Loading Quiz',
        description: 'The quiz appears to be invalid or contains no questions.',
        variant: 'destructive',
      });
      return;
    }
    
    // Log detailed quiz info for debugging
    console.log("QuizContext: Setting current quiz with ID:", safeQuiz.id);
    console.log("QuizContext: Quiz topic:", safeQuiz.topic);
    console.log("QuizContext: Quiz type:", safeQuiz.quizType);
    console.log("QuizContext: First question:", safeQuiz.questions[0]);
    
    setCurrentQuiz(safeQuiz);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setIsQuizCompleted(false);
    
    console.log("QuizContext: Quiz loaded successfully with", safeQuiz.questions.length, "questions");
    
    // Set up timer if timeLimit is provided
    if (safeQuiz.timeLimit) {
      setTimeLeft(safeQuiz.timeLimit * 60); // Convert to seconds
    } else {
      setTimeLeft(null);
    }
  }, [toast]);
  
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
    if (!currentQuiz) {
      console.log("QuizContext - nextQuestion - No current quiz");
      return;
    }
    
    console.log("QuizContext - nextQuestion - Current question:", currentQuestion, "Total questions:", currentQuiz.questions.length);
    
    if (currentQuestion < currentQuiz.questions.length - 1) {
      console.log("QuizContext - Moving to next question:", currentQuestion + 1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log("QuizContext - Already at last question, not advancing");
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
    
    console.log("QuizContext - Recording answer:", answer);
    
    const question = currentQuiz.questions[currentQuestion];
    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
      : answer === question.correctAnswer;
    
    console.log("QuizContext - Answer correct:", isCorrect);
    
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
    
    // Don't automatically move to next question - let the UI handle navigation
    // This was causing the selection bug because it would immediately advance to next question
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
        console.log("QuizContext - Creating new quiz in Firestore");
        
        // Ensure no undefined values in questions
        const sanitizedQuestions = currentQuiz.questions.map(q => ({
          id: q.id || nanoid(10), // Ensure each question has an ID
          question: q.question || "",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correctAnswer || "",
          explanation: q.explanation || ""
        }));
        
        // Constructing data for Firebase
        const quizDataForFirebase = {
          userId: user.uid,
          title: currentQuiz.title || "Untitled Quiz",
          category: currentQuiz.topic || "General Knowledge",
          description: `Quiz on ${currentQuiz.topic || "General Knowledge"}`,
          quizType: currentQuiz.quizType || "multiple-choice",
          questions: sanitizedQuestions,
          // Add any other required fields with safe defaults
        };

        console.log("QuizContext - Quiz data being saved:", JSON.stringify(quizDataForFirebase));
        const savedQuiz = await createQuiz(user.uid, quizDataForFirebase);
        quizId = savedQuiz.id;
        console.log("QuizContext - Quiz saved with ID:", quizId);
      }
      
      // Ensure no undefined values in answers
      const sanitizedAnswers = userAnswers.map(a => ({
        questionId: a.questionId,
        userAnswer: a.userAnswer || "",
        isCorrect: !!a.isCorrect
      }));
      
      // Save quiz attempt
      const attemptData = {
        userId: user.uid,
        quizId: quizId,
        quizTitle: currentQuiz.title || "Untitled Quiz",
        quizCategory: currentQuiz.topic || "General Knowledge",
        score,
        totalQuestions: currentQuiz.questions.length,
        correctAnswers,
        answers: sanitizedAnswers,
        completedAt: new Date(),
        timeTaken: currentQuiz.timeLimit 
          ? (currentQuiz.timeLimit * 60) - (timeLeft || 0) 
          : 0
      };
      
      console.log("QuizContext - Attempt data being saved:", JSON.stringify(attemptData));
      const attempt = await createQuizAttempt(attemptData);
      console.log("QuizContext - Quiz attempt saved with ID:", attempt.id);
      
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
    resetQuiz,
    setCurrentQuestion,
  };
  
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
