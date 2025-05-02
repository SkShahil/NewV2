import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute mounted, checking auth state...");
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        console.log("No user, redirecting to login");
        navigate('/login');
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  // If auth is loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect happens in useEffect
  // Just return null here to avoid any flash of protected content
  if (!user) {
    return null;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;