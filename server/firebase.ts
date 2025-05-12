import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin with environment variables
// For Firebase Admin SDK, we'll use a more flexible approach to handle credentials
let app;

// Recommended initialization using a service account key file
try {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  }

  // Use require for dynamic loading of the service account file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(serviceAccountPath);

  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id, // Use project_id from the service account file
  });
  console.log('Firebase Admin SDK initialized successfully using service account.');
} catch (error) {
  console.error('Fatal error initializing Firebase Admin SDK:', error);
  console.error('Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly and the service account key file exists and is valid.');
  // Exit the process as Firebase Admin SDK is crucial for server operations
  process.exit(1);
  // Set the app to a dummy value to prevent TypeScript errors in unreachable code
  if (process.env.NODE_ENV !== 'test') { // Avoid exiting during tests
    // Set the app to a dummy value to prevent null reference errors
    app = {} as any;
  }
}

// Make sure app is always defined to avoid TypeScript errors
const firebaseApp = app as any;

// Initialize and export Firebase Auth
export const auth = getAuth(firebaseApp);

// Initialize and export Firestore
export const db = getFirestore(firebaseApp);

export const serverTimestamp = FieldValue.serverTimestamp;

/**
 * Verifies a Firebase ID token and returns the decoded token
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(idToken);
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
    const userRecord = await getAuth(firebaseApp).getUser(uid);
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
    const userRecord = await getAuth(firebaseApp).createUser({
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
    const userRef = db.collection('users').doc(uid); // Use real Firestore instance
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
    const quizRef = db.collection('quizzes').doc(); // Use real Firestore instance
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
    const quizRef = db.collection('quizzes').doc(quizId); // Use real Firestore instance
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
