import { useState, useEffect, useCallback } from 'react';
import { fetchAuthSession, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  groups?: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

const ADMIN_GROUPS = ['admin', 'admins', 'Admin', 'Admins', 'ADMIN', 'ADMINS'];

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      
      if (session.tokens) {
        const currentUser = await getCurrentUser();
        const payload = session.tokens.accessToken.payload;
        const groups = payload['cognito:groups'] as string[] || [];
        
        setState({
          user: {
            id: currentUser.userId,
            email: currentUser.signInDetails?.loginId || '',
            name: currentUser.username,
            groups,
          },
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error as Error,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await signIn({ username: email, password });
      await checkAuth();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const isAdmin = state.user?.groups?.some(group => ADMIN_GROUPS.includes(group)) || false;

  return {
    ...state,
    login,
    logout,
    isAdmin,
    refetch: checkAuth,
  };
}
