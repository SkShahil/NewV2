import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // If auth is loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;