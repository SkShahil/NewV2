import { Request, Response } from 'express';
import { auth, verifyIdToken, getUser, createUser, createUserDocument, db } from '../firebase';

export const authController = {
  /**
   * Register a new user
   */
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, displayName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Create the user in Firebase Auth
      const userRecord = await createUser(email, password, displayName);
      
      // Create a document for the user in Firestore
      await createUserDocument(userRecord.uid, {
        firebaseId: userRecord.uid,
        email: userRecord.email,
        username: displayName || email.split('@')[0],
        displayName: displayName || '',
        role: 'user',
      });
      
      // Return success response
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ message: 'Email already in use' });
      } else if (error.code === 'auth/invalid-email') {
        return res.status(400).json({ message: 'Invalid email format' });
      } else if (error.code === 'auth/weak-password') {
        return res.status(400).json({ message: 'Password is too weak' });
      }
      
      return res.status(500).json({ message: 'Registration failed' });
    }
  },
  
  /**
   * Log in an existing user
   */
  login: async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }
      
      // Verify the ID token
      const decodedToken = await verifyIdToken(idToken);
      
      // Get the user's details
      const userRecord = await getUser(decodedToken.uid);
      
      // Check if user document exists in Firestore
      const userRef = db.collection('users').doc(userRecord.uid);
      const userDoc = await userRef.get();
      
      // Create user document if it doesn't exist
      if (!userDoc.exists) {
        await createUserDocument(userRecord.uid, {
          firebaseId: userRecord.uid,
          email: userRecord.email,
          username: userRecord.displayName || userRecord.email?.split('@')[0] || '',
          displayName: userRecord.displayName || '',
          role: 'user',
        });
      } else {
        // Update last login timestamp
        await userRef.update({ lastLogin: new Date() });
      }
      
      // Return user details
      return res.status(200).json({
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  },
  
  /**
   * Log out a user
   */
  logout: async (req: Request, res: Response) => {
    // Firebase Auth doesn't have a server-side logout functionality
    // Client is responsible for clearing tokens, but we can respond to confirm
    return res.status(200).json({ message: 'Logout successful' });
  },
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      const idToken = authHeader.split('Bearer ')[1];
      
      // Verify the ID token
      const decodedToken = await verifyIdToken(idToken);
      
      // Get the user's details
      const userRecord = await getUser(decodedToken.uid);
      
      // Get additional user data from Firestore
      const userRef = db.collection('users').doc(userRecord.uid);
      const userDoc = await userRef.get();
      
      let userData = {};
      if (userDoc.exists) {
        userData = userDoc.data() || {};
      }
      
      // Return user details
      return res.status(200).json({
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          ...userData,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  },
};
