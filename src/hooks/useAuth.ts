import { useState, useEffect, useCallback } from 'react';
import { fetchAuthSession, signIn, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

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
        
        let displayName: string | undefined;
        let email = currentUser.signInDetails?.loginId || '';
        
        try {
          const attributes = await fetchUserAttributes();
          
          if (attributes.email) {
            email = attributes.email;
          }
          
          if (attributes.preferred_username) {
            displayName = attributes.preferred_username;
          } else if (attributes.given_name && attributes.family_name) {
            displayName = `${attributes.given_name} ${attributes.family_name}`;
          } else if (attributes.given_name) {
            displayName = attributes.given_name;
          } else if (attributes.name) {
            displayName = attributes.name;
          } else if (attributes.nickname) {
            displayName = attributes.nickname;
          }
        } catch (attrError) {
          console.warn('Could not fetch user attributes:', attrError);
        }
        
        const finalName = displayName || (email ? email.split('@')[0] : 'User');
        
        setState({
          user: {
            id: currentUser.userId,
            email,
            name: finalName,
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
