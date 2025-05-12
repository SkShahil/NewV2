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
      console.log('Quiz generation request received:', { 
        body: req.body,
        headers: {
          authorization: req.headers.authorization ? 'Bearer [present]' : '[missing]',
          'content-type': req.headers['content-type']
        }
      });
      
      // Authenticate user
      const authHeader = req.headers.authorization;
      let userId = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        console.log('Auth verification called with token length:', idToken.length);
        
        try {
          const decodedToken = await verifyIdToken(idToken);
          userId = decodedToken?.uid;
          console.log('Extracted user ID from token:', userId);
        } catch (authError) {
          console.error('Token verification error:', authError);
        }
      } else {
        console.log('No authentication token provided');
      }
      
      // Get quiz parameters from request
      const { topic, quizType, numQuestions } = req.body;
      
      if (!topic) {
        console.log('Bad request: Topic is missing');
        return res.status(400).json({ message: 'Topic is required' });
      }
      
      console.log('Generating quiz with params:', { topic, quizType, numQuestions, userId });
      
      // Generate quiz with Gemini API
      const questions = await generateQuiz({
        topic,
        quizType: quizType || 'auto',
        numQuestions: numQuestions || 10,
      });
      
      console.log(`Quiz generated successfully with ${questions.length} questions`);
      
      // Save the quiz to Firestore if user is authenticated
      let quizId = null;
      if (userId) {
        try {
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
          
          console.log('Saving quiz to Firestore');
          const savedQuiz = await createQuizDocument(quizData);
          quizId = savedQuiz.id;
          console.log('Quiz saved to Firestore with ID:', quizId);
        } catch (firestoreError) {
          console.warn('Failed to save quiz to Firestore but continuing:', firestoreError);
          // Continue with the quiz but don't save to Firestore
        }
      } else {
        console.log('Skipping Firestore save as user is not authenticated');
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
   * Create a new quiz document directly
   */
  createQuiz: async (req: Request, res: Response) => {
    try {
      const { topic, questionType, numQuestions, questions } = req.body;

      if (!topic || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          message: 'Topic and questions array are required',
        });
      }

      const quizData = {
        title: `${topic} Quiz`,
        topic,
        questionType: questionType || 'auto',
        numQuestions: numQuestions || questions.length,
        questions,
        isPublic: false, // Assuming quizzes created this way are private initially
      };

      const newQuiz = await createQuizDocument(quizData);

 return res.status(201).json({ message: 'Quiz created successfully', quizId: newQuiz.id });
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      return res.status(500).json({ message: 'Failed to create quiz', error: error.message });
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
      
      try {
        // Get the quiz from Firestore
        const quiz = await getQuizDocument(id);
        return res.status(200).json(quiz);
      } catch (firestoreError: any) {
        console.error('Firestore error:', firestoreError);
        
        if (firestoreError.message === 'Quiz not found') {
          return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Return a placeholder quiz with an error message if Firestore is not available
        return res.status(500).json({
          message: 'Failed to retrieve quiz from database',
          error: firestoreError.message,
        });
      }
    } catch (error: any) {
      console.error('Get quiz error:', error);
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
      
      let attemptId = null;
      try {
        const attempt = await createQuizAttempt(attemptData);
        attemptId = attempt.id;
      } catch (firestoreError) {
        console.warn('Failed to save quiz attempt to Firestore but continuing:', firestoreError);
        // Continue without saving to Firestore
      }
      
      return res.status(200).json({
        message: 'Quiz submitted successfully',
        attemptId,
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
