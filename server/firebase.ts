import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin with environment variables
// For Firebase Admin SDK, we'll use a more flexible approach to handle credentials
let firebaseConfig;

// Check if we have all the required credentials
if (process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY) {
      
  // Try to parse the private key properly
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    // If the key doesn't contain the expected format, try to fix it
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/"/g, '');
      
      // Ensure it has the proper PEM format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
    }
    
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };
    
    console.log('Firebase Admin SDK credentials loaded successfully');
  } catch (error) {
    console.error('Error formatting Firebase private key:', error);
    // Fall back to using the project ID only for development
    firebaseConfig = { projectId: process.env.FIREBASE_PROJECT_ID };
  }
} else {
  console.error('Missing Firebase Admin SDK credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
  
  // Use a minimal config for development to prevent startup crashes
  firebaseConfig = { projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project' };
}

// Initialize the Firebase Admin SDK
let app;
try {
  app = initializeApp({
    credential: cert(firebaseConfig as any),
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  
  // Try alternative initialization for development
  try {
    app = initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'
    });
    console.log('Firebase Admin SDK initialized in limited mode');
  } catch (fallbackError) {
    console.error('Fatal error initializing Firebase:', fallbackError);
    throw new Error('Could not initialize Firebase. Check your credentials.');
  }
}

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const serverTimestamp = FieldValue.serverTimestamp;

/**
 * Verifies a Firebase ID token and returns the decoded token
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}

/**
 * Get a user record from Firebase Auth by their UID
 */
export async function getUser(uid: string) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error fetching user record:', error);
    throw new Error('User not found');
  }
}

/**
 * Create a new user in Firebase Auth
 */
export async function createUser(email: string, password: string, displayName?: string) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating new user:', error);
    throw error;
  }
}

/**
 * Create a Firestore document for a new user
 */
export async function createUserDocument(uid: string, userData: any) {
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      ...userData,
      createdAt: serverTimestamp(),
    });
    return { id: userRef.id };
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

/**
 * Create a new quiz document in Firestore
 */
export async function createQuizDocument(quizData: any) {
  try {
    const quizRef = db.collection('quizzes').doc();
    await quizRef.set({
      ...quizData,
      createdAt: serverTimestamp(),
    });
    return { id: quizRef.id };
  } catch (error) {
    console.error('Error creating quiz document:', error);
    throw error;
  }
}

/**
 * Get a quiz document from Firestore by ID
 */
export async function getQuizDocument(quizId: string) {
  try {
    const quizRef = db.collection('quizzes').doc(quizId);
    const quizDoc = await quizRef.get();
    
    if (!quizDoc.exists) {
      throw new Error('Quiz not found');
    }
    
    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    console.error('Error fetching quiz document:', error);
    throw error;
  }
}

/**
 * Create a new challenge document in Firestore
 */
export async function createChallengeDocument(challengeData: any) {
  try {
    const challengeRef = db.collection('challenges').doc();
    await challengeRef.set({
      ...challengeData,
      createdAt: serverTimestamp(),
    });
    return { id: challengeRef.id };
  } catch (error) {
    console.error('Error creating challenge document:', error);
    throw error;
  }
}

/**
 * Get a challenge document from Firestore by token
 */
export async function getChallengeByToken(token: string) {
  try {
    const challengeQuery = db.collection('challenges').where('challengeToken', '==', token).limit(1);
    const querySnapshot = await challengeQuery.get();
    
    if (querySnapshot.empty) {
      throw new Error('Challenge not found');
    }
    
    const challengeDoc = querySnapshot.docs[0];
    return { id: challengeDoc.id, ...challengeDoc.data() };
  } catch (error) {
    console.error('Error fetching challenge document:', error);
    throw error;
  }
}

/**
 * Update challenge status in Firestore
 */
export async function updateChallengeStatus(challengeId: string, status: string) {
  try {
    const challengeRef = db.collection('challenges').doc(challengeId);
    await challengeRef.update({ status });
    return { success: true };
  } catch (error) {
    console.error('Error updating challenge status:', error);
    throw error;
  }
}

/**
 * Create a new quiz attempt document in Firestore
 */
export async function createQuizAttempt(attemptData: any) {
  try {
    const attemptRef = db.collection('quiz_attempts').doc();
    await attemptRef.set({
      ...attemptData,
      completedAt: serverTimestamp(),
    });
    return { id: attemptRef.id };
  } catch (error) {
    console.error('Error creating quiz attempt:', error);
    throw error;
  }
}
