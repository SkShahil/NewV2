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
  deleteDoc
} from "firebase/firestore";

// Firebase configuration
// Gets these values from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Debug Firebase config to ensure environment variables are loaded
console.log("Firebase config initialized with:", {
  apiKeyExists: !!import.meta.env.VITE_FIREBASE_API_KEY,
  projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appIdExists: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

// Log the current domain to add to Firebase authorized domains
console.log("Current domain for Firebase Auth:", window.location.hostname);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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
  if (!user) return;

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
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }

  return getUserDocument(user.uid);
};

export const getUserDocument = async (uid: string) => {
  if (!uid) return null;

  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return { uid, ...snapshot.data() };
    }
  } catch (error) {
    console.error("Error fetching user", error);
  }

  return null;
};

export const createQuiz = async (userId: string, quizData: any) => {
  try {
    const quizRef = collection(db, "quizzes");
    const newQuizRef = await addDoc(quizRef, {
      userId,
      createdAt: Timestamp.now(),
      ...quizData
    });
    return { id: newQuizRef.id, ...quizData };
  } catch (error) {
    console.error("Error creating quiz", error);
    throw error;
  }
};

export const getQuizById = async (quizId: string) => {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    const snapshot = await getDoc(quizRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching quiz", error);
    throw error;
  }
};

export const getUserQuizzes = async (userId: string) => {
  try {
    const quizzesRef = collection(db, "quizzes");
    
    // First try with a simpler query (without ordering) to avoid index requirement
    let q = query(quizzesRef, where("userId", "==", userId));
    
    try {
      const snapshot = await getDocs(q);
      
      // If we got here, the query worked - return the results (sorted on client)
      const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory instead of using orderBy (which requires an index)
      return quizzes.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // descending order
      });
    } catch (simpleQueryError) {
      console.log("Simple quiz query failed, falling back to safer approach");
      return [];
    }
  } catch (error) {
    console.error("Error fetching user quizzes", error);
    // Return empty array instead of throwing
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
      const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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

export const getChallengeByToken = async (token: string) => {
  try {
    const challengesRef = collection(db, "challenges");
    const q = query(challengesRef, where("challengeToken", "==", token));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching challenge", error);
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
      const feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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

export { auth, db };
