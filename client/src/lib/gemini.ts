import { apiRequest } from "./queryClient";

// Interface for quiz generation parameters
export interface QuizGenerationParams {
  topic: string;
  quizType: 'multiple-choice' | 'true-false' | 'short-answer' | 'auto';
  numQuestions?: number;
}

// Interface for question structure
export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// Generate a quiz using the Gemini Flash API via our backend
export const generateQuiz = async (params: QuizGenerationParams): Promise<Question[]> => {
  try {
    const response = await apiRequest('POST', '/api/quiz/generate', params);
    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

// Check if a short answer is correct by comparing with the answer key
export const checkShortAnswer = async (
  userAnswer: string, 
  correctAnswer: string,
  questionContext: string
): Promise<{ isCorrect: boolean; explanation: string }> => {
  try {
    const response = await apiRequest('POST', '/api/quiz/check-answer', {
      userAnswer,
      correctAnswer,
      questionContext
    });
    return await response.json();
  } catch (error) {
    console.error('Error checking answer:', error);
    throw error;
  }
};
