import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { onAuthStateChange } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom hook to manage Firebase authentication state
 * @returns AuthState object with user, isLoading, and isAuthenticated
 */
export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
  };
};
