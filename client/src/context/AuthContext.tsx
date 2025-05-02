import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, createUserDocument, getUserDocument } from '@/lib/firebase';
import { useLocation } from 'wouter';

// Console log for debugging purposes - remove in production
console.log('AuthContext file is loaded');

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
  updateUserPhotoURL: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userData = await getUserDocument(user.uid);
        setUserData(userData);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await createUserDocument(user, { displayName });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Create/update user document in Firestore
      await createUserDocument(user);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (!user) return;
    
    try {
      await updateProfile(user, { displayName });
      setUser({ ...user, displayName });
    } catch (error) {
      console.error('Update display name error:', error);
      throw error;
    }
  };

  const updateUserPhotoURL = async (photoURL: string) => {
    if (!user) return;
    
    try {
      await updateProfile(user, { photoURL });
      setUser({ ...user, photoURL });
    } catch (error) {
      console.error('Update photo URL error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    logout,
    googleLogin,
    resetPassword,
    updateUserDisplayName,
    updateUserPhotoURL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
