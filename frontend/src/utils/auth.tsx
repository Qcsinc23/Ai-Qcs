import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Types for auth state
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

// Protected route wrapper
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = false; // TODO: Replace with Clerk's useAuth hook
  const isLoading = false; // TODO: Replace with Clerk's loading state

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/sign-in');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}

// Auth provider placeholder (will be replaced with ClerkProvider)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
