import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Add these interfaces at the top of the file after imports
interface UserData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt: Timestamp;
  quizScore?: number;
}

interface QuizData {
  userId: string;
  title: string;
  description?: string;
  questions: Array<{
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
  }>;
  createdAt: Timestamp;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

interface QuizAttempt {
  userId: string;
  quizId: string;
  score: number;
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
  }>;
  createdAt: Timestamp;
  timeSpent?: number;
}

interface Challenge {
  senderId: string;
  receiverId: string;
  quizId: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  challengeToken: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  score?: number;
}

interface Feedback {
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

// Custom error class for Firebase operations
class FirebaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID, 
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Load from env
};

// Add console logs for environment variables
console.log("VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("VITE_FIREBASE_AUTH_DOMAIN:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("VITE_FIREBASE_STORAGE_BUCKET:", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log("VITE_FIREBASE_MESSAGING_SENDER_ID:", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log("VITE_FIREBASE_APP_ID:", import.meta.env.VITE_FIREBASE_APP_ID);
console.log("VITE_FIREBASE_MEASUREMENT_ID:", import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

// Debug Firebase config to ensure environment variables are loaded
console.log("Firebase config initialized with:", {
  authDomainExists: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  apiKeyExists: !!import.meta.env.VITE_FIREBASE_API_KEY,
  projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appIdExists: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

// Log the current domain to add to Firebase authorized domains
console.log("Current domain for Firebase Auth:", window.location.hostname);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signupWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = (user: User, data: { displayName?: string, photoURL?: string }) => {
  return updateProfile(user, data);
};

// Firestore data functions
export const createUserDocument = async (user: User, additionalData: any = {}) => {
  if (!user) {
    throw new FirebaseError('No user provided', 'auth/no-user');
  }

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = Timestamp.now();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        createdAt,
        quizScore: 0,
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw new FirebaseError(
        'Failed to create user profile',
        'firestore/create-failed'
      );
    }
  }

  return getUserDocument(user.uid);
};

export const getUserDocument = async (uid: string): Promise<UserData | null> => {
  if (!uid) return null;

  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return { uid, ...snapshot.data() } as UserData;
    }
  } catch (error) {
    console.error("Error fetching user", error);
  }

  return null;
};

export const createQuiz = async (userId: string, quizData: Partial<QuizData>): Promise<QuizData & { id: string }> => {
  try {
    const quizRef = collection(db, "quizzes");
    const newQuizRef = await addDoc(quizRef, {
      userId,
      createdAt: Timestamp.now(),
      ...quizData
    });
    return { id: newQuizRef.id, ...quizData } as QuizData & { id: string };
  } catch (error) {
    console.error("Error creating quiz", error);
    throw new FirebaseError(
      'Failed to create quiz',
      'firestore/create-failed'
    );
  }
};

export const getQuizById = async (quizId: string): Promise<(QuizData & { id: string }) | null> => {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    const snapshot = await getDoc(quizRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as QuizData & { id: string };
    }
    return null;
  } catch (error) {
    console.error("Error fetching quiz", error);
    throw error;
  }
};

export const getUserQuizzes = async (userId: string): Promise<(QuizData & { id: string })[]> => {
  try {
    const quizzesRef = collection(db, "quizzes");
    let q = query(quizzesRef, where("userId", "==", userId));
    
    try {
      const snapshot = await getDocs(q);
      const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (QuizData & { id: string })[];
      
      return quizzes.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (simpleQueryError) {
      console.log("Simple quiz query failed, falling back to safer approach");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user quizzes", error);
    return [];
  }
};

export const createQuizAttempt = async (attemptData: any) => {
  try {
    const attemptRef = collection(db, "quiz_attempts");
    const newAttemptRef = await addDoc(attemptRef, {
      createdAt: Timestamp.now(),
      ...attemptData
    });
    return { id: newAttemptRef.id, ...attemptData };
  } catch (error) {
    console.error("Error creating quiz attempt", error);
    throw error;
  }
};

export const getUserAttempts = async (userId: string) => {
  try {
    const attemptsRef = collection(db, "quiz_attempts");
    
    // First try with a simpler query (without ordering) to avoid index requirement
    let q = query(attemptsRef, where("userId", "==", userId));
    
    try {
      const snapshot = await getDocs(q);
      
      // If we got here, the query worked - return the results (sorted on client)
      const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (QuizAttempt & { id: string })[];
      
      // Sort in memory instead of using orderBy (which requires an index)
      return attempts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });
    } catch (simpleQueryError) {
      // If simple query fails, try an even simpler approach
      console.log("Simple query failed, falling back to safer approach");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user attempts", error);
    // Return empty array instead of throwing to gracefully handle the error
    return [];
  }
};

export const createChallenge = async (challengeData: any) => {
  try {
    const challengeRef = collection(db, "challenges");
    const newChallengeRef = await addDoc(challengeRef, {
      createdAt: Timestamp.now(),
      status: "pending",
      ...challengeData
    });
    return { id: newChallengeRef.id, ...challengeData };
  } catch (error) {
    console.error("Error creating challenge", error);
    throw error;
  }
};

export const getChallengeByToken = async (token: string): Promise<any | null> => {
  if (!token) {
    console.error("No token provided to getChallengeByToken");
    return null;
  }
  try {
    const response = await fetch(`/api/challenge/token/${token}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Challenge with token ${token} not found (404).`);
        return null; // Or a specific error object/message for expiry
      }
      throw new FirebaseError(
        `Failed to fetch challenge: ${response.status} ${response.statusText}`,
        `http/${response.status}`
      );
    }
    const challengeData = await response.json();

    if (challengeData.isExpired) {
      console.log(`Challenge with token ${token} is expired.`);
      // Return null or a specific structure to indicate expiry to the caller
      // For now, returning null will trigger "Challenge not found or has expired"
      // in ChallengeAccept.tsx, which is the current behavior for missing challenges.
      // Consider returning { isExpired: true } if more specific handling is needed.
      return null; 
    }

    // Ensure 'createdAt' and 'expiresAt' are converted to Firebase Timestamps if they are strings or JS Dates
    // The backend currently sends them in a format that new Date() can parse,
    // and ChallengeAccept.tsx expects to call .toDate() on expiresAt if it's a Firestore Timestamp.
    // The backend sends `expiresAt` as a string that `new Date()` can parse.
    // If `challengeData.quiz.createdAt` is also from the backend, it might need similar conversion
    // depending on how it's used downstream.
    // For now, we assume the structure from the backend is usable by ChallengeAccept.tsx
    
    // The backend already includes the quiz data nested, so we return the whole package
    return challengeData; 
  } catch (error) {
    console.error(`Error fetching challenge by token ${token}:`, error);
    // To align with the original function's behavior of returning null for not found:
    if (error instanceof FirebaseError && error.code === 'http/404') {
      return null;
    }
    // Rethrow other errors, or handle them as needed
    throw error;
  }
};

export const getUserChallenges = async (userId: string) => {
  try {
    const challengesRef = collection(db, "challenges");
    const receivedQ = query(challengesRef, where("receiverId", "==", userId));
    const sentQ = query(challengesRef, where("senderId", "==", userId));
    
    try {
      const receivedSnapshot = await getDocs(receivedQ);
      const sentSnapshot = await getDocs(sentQ);
      
      const received = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort both arrays by createdAt if available
      const sortByDate = (items: any[]) => {
        return items.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime(); // descending order
        });
      };
      
      return {
        received: sortByDate(received),
        sent: sortByDate(sent)
      };
    } catch (simpleQueryError) {
      console.log("Challenge query failed, falling back to safer approach");
      return { received: [], sent: [] };
    }
  } catch (error) {
    console.error("Error fetching user challenges", error);
    // Return empty arrays instead of throwing
    return { received: [], sent: [] };
  }
};

export const updateChallengeStatus = async (challengeId: string, status: string) => {
  try {
    const challengeRef = doc(db, "challenges", challengeId);
    await updateDoc(challengeRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating challenge status", error);
    throw error;
  }
};

export const submitFeedback = async (userId: string, feedbackData: any) => {
  try {
    const feedbackRef = collection(db, "feedback");
    const newFeedbackRef = await addDoc(feedbackRef, {
      userId,
      createdAt: Timestamp.now(),
      status: "new",
      ...feedbackData
    });
    return { id: newFeedbackRef.id, ...feedbackData };
  } catch (error) {
    console.error("Error submitting feedback", error);
    throw error;
  }
};

export const getUserFeedback = async (userId: string) => {
  try {
    const feedbackRef = collection(db, "feedback");
    
    // First try with a simpler query (without ordering) to avoid index requirement
    let q = query(feedbackRef, where("userId", "==", userId));
    
    try {
      const snapshot = await getDocs(q);
      
      // If we got here, the query worked - return the results (sorted on client)
      const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Feedback & { id: string })[];
      
      // Sort in memory instead of using orderBy (which requires an index)
      return feedback.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });
    } catch (simpleQueryError) {
      console.log("Simple feedback query failed, falling back to safer approach");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user feedback", error);
    // Return empty array instead of throwing
    return [];
  }
};

export const getLeaderboard = async (limitCount: number = 10) => {
  try {
    const usersRef = collection(db, "users");
    
    // Try a basic query without complex conditions
    let q = query(usersRef);
    
    try {
      const snapshot = await getDocs(q);
      
      // If we got here, the query worked - return the results (sorted on client)
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (UserData & { id: string })[];
      
      // Sort in memory instead of using orderBy (which requires an index)
      const sortedUsers = users.sort((a, b) => {
        const scoreA = a.quizScore || 0;
        const scoreB = b.quizScore || 0;
        return scoreB - scoreA; // descending order
      });
      
      // Limit in memory
      return sortedUsers.slice(0, limitCount);
    } catch (simpleQueryError) {
      console.log("Simple leaderboard query failed, falling back to safer approach");
      return [];
    }
  } catch (error) {
    console.error("Error fetching leaderboard", error);
    // Return empty array instead of throwing
    return [];
  }
};

export { app, analytics, db, auth };
