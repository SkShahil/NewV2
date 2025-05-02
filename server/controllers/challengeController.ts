import { Request, Response } from 'express';
import { 
  verifyIdToken, 
  createChallengeDocument, 
  getChallengeByToken, 
  updateChallengeStatus,
  getQuizDocument
} from '../firebase';
import { nanoid } from 'nanoid';

export const challengeController = {
  /**
   * Create a new challenge
   */
  createChallenge: async (req: Request, res: Response) => {
    try {
      // Authenticate user
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);
      const senderId = decodedToken.uid;
      
      const { quizId, receiverEmail, timeLimit, showResultsImmediately, message } = req.body;
      
      if (!quizId || !receiverEmail) {
        return res.status(400).json({
          message: 'Quiz ID and receiver email are required',
        });
      }
      
      // Generate a unique token for the challenge
      const challengeToken = nanoid(12);
      
      // Set expiration date (default 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create challenge document in Firestore
      const challengeData = {
        senderId,
        receiverEmail,
        quizId,
        challengeToken,
        status: 'pending',
        timeLimit: timeLimit || 0, // 0 means no time limit
        showResultsImmediately: !!showResultsImmediately,
        message: message || '',
        expiresAt,
      };
      
      const challenge = await createChallengeDocument(challengeData);
      
      return res.status(201).json({
        message: 'Challenge created successfully',
        challengeId: challenge.id,
        challengeToken,
      });
    } catch (error: any) {
      console.error('Create challenge error:', error);
      return res.status(500).json({
        message: 'Failed to create challenge',
        error: error.message,
      });
    }
  },
  
  /**
   * Get a challenge by token
   */
  getChallenge: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: 'Challenge token is required' });
      }
      
      // Get the challenge from Firestore
      const challenge = await getChallengeByToken(token);
      
      // Get quiz details
      const quizData = await getQuizDocument(challenge.quizId as string);
      
      // Check if challenge is expired
      const now = new Date();
      const challengeData = challenge as any; // Type assertion to avoid TypeScript errors
      const expiresAt = challengeData.expiresAt?.toDate ? 
        new Date(challengeData.expiresAt.toDate()) : challengeData.expiresAt;
      const isExpired = expiresAt && now > expiresAt;
      
      return res.status(200).json({
        ...challenge,
        quiz: {
          id: quizData.id,
          title: quizData.title,
          topic: quizData.topic,
          quizType: quizData.quizType,
          questionCount: quizData.questions?.length || 0,
        },
        isExpired,
      });
    } catch (error: any) {
      console.error('Get challenge error:', error);
      
      if (error.message === 'Challenge not found') {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      return res.status(500).json({
        message: 'Failed to retrieve challenge',
        error: error.message,
      });
    }
  },
  
  /**
   * Update challenge status
   */
  updateStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({
          message: 'Challenge ID and status are required',
        });
      }
      
      // Validate status
      const validStatuses = ['accepted', 'declined', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: 'Invalid status. Must be one of: accepted, declined, completed',
        });
      }
      
      // Update challenge status in Firestore
      await updateChallengeStatus(id, status);
      
      return res.status(200).json({
        message: `Challenge status updated to ${status}`,
      });
    } catch (error: any) {
      console.error('Update challenge status error:', error);
      return res.status(500).json({
        message: 'Failed to update challenge status',
        error: error.message,
      });
    }
  },
  
  /**
   * Get challenges for a user
   */
  getUserChallenges: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Authenticate user
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);
      
      // Ensure the user is requesting their own challenges
      if (decodedToken.uid !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to challenges' });
      }
      
      // Get user's challenges from Firestore
      const challenges = await getChallengesForUser(userId);
      
      return res.status(200).json(challenges);
    } catch (error: any) {
      console.error('Get user challenges error:', error);
      return res.status(500).json({
        message: 'Failed to retrieve user challenges',
        error: error.message,
      });
    }
  },
};

// Helper function to get challenges for a user
async function getChallengesForUser(userId: string) {
  // This function would query Firestore for challenges
  // Instead of implementing it fully, we'll return a placeholder
  // In a real implementation, this would query both sent and received challenges
  return [];
}