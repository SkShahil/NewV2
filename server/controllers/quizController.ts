import { Request, Response } from 'express';
import { verifyIdToken, createQuizDocument, getQuizDocument, createQuizAttempt } from '../firebase';
import { generateQuiz, checkShortAnswer } from '../gemini';
import { v4 as uuidv4 } from 'uuid';

export const quizController = {
  /**
   * Generate a new quiz using Gemini API
   */
  generateQuiz: async (req: Request, res: Response) => {
    try {
      // Authenticate user
      const authHeader = req.headers.authorization;
      let userId = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyIdToken(idToken).catch(() => null);
        userId = decodedToken?.uid;
      }
      
      // Get quiz parameters from request
      const { topic, quizType, numQuestions } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: 'Topic is required' });
      }
      
      // Generate quiz with Gemini API
      const questions = await generateQuiz({
        topic,
        quizType: quizType || 'auto',
        numQuestions: numQuestions || 10,
      });
      
      // Save the quiz to Firestore if user is authenticated
      let quizId = null;
      if (userId) {
        const quizData = {
          userId,
          title: `${topic} Quiz`,
          topic,
          quizType: quizType !== 'auto' ? quizType : (
            questions[0].options ? 'multiple-choice' : 
            typeof questions[0].correctAnswer === 'boolean' ? 'true-false' : 
            'short-answer'
          ),
          questions,
          isPublic: true,
        };
        
        const savedQuiz = await createQuizDocument(quizData);
        quizId = savedQuiz.id;
      }
      
      return res.status(200).json({
        message: 'Quiz generated successfully',
        quizId,
        questions,
      });
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      return res.status(500).json({
        message: 'Failed to generate quiz',
        error: error.message,
      });
    }
  },
  
  /**
   * Get a quiz by ID
   */
  getQuiz: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Quiz ID is required' });
      }
      
      // Get the quiz from Firestore
      const quiz = await getQuizDocument(id);
      
      return res.status(200).json(quiz);
    } catch (error: any) {
      console.error('Get quiz error:', error);
      
      if (error.message === 'Quiz not found') {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      return res.status(500).json({
        message: 'Failed to retrieve quiz',
        error: error.message,
      });
    }
  },
  
  /**
   * Check a short answer for correctness
   */
  checkAnswer: async (req: Request, res: Response) => {
    try {
      const { userAnswer, correctAnswer, questionContext } = req.body;
      
      if (!userAnswer || !correctAnswer || !questionContext) {
        return res.status(400).json({
          message: 'User answer, correct answer, and question context are required',
        });
      }
      
      // Check the answer using Gemini
      const result = await checkShortAnswer(
        userAnswer,
        correctAnswer,
        questionContext
      );
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Check answer error:', error);
      return res.status(500).json({
        message: 'Failed to check answer',
        error: error.message,
      });
    }
  },
  
  /**
   * Submit a completed quiz
   */
  submitQuiz: async (req: Request, res: Response) => {
    try {
      // Authenticate user
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);
      const userId = decodedToken.uid;
      
      const { quizId, answers, timeTaken, totalQuestions } = req.body;
      
      if (!quizId || !answers || !totalQuestions) {
        return res.status(400).json({
          message: 'Quiz ID, answers, and total questions are required',
        });
      }
      
      // Calculate score
      const correctAnswers = answers.filter((answer: any) => answer.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Create quiz attempt record in Firestore
      const attemptData = {
        userId,
        quizId,
        score,
        totalQuestions,
        correctAnswers,
        answers,
        timeTaken: timeTaken || null,
      };
      
      const attempt = await createQuizAttempt(attemptData);
      
      return res.status(200).json({
        message: 'Quiz submitted successfully',
        attemptId: attempt.id,
        score,
        correctAnswers,
      });
    } catch (error: any) {
      console.error('Submit quiz error:', error);
      return res.status(500).json({
        message: 'Failed to submit quiz',
        error: error.message,
      });
    }
  },
};
