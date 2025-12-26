import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  preferredUsername?: string;
  role: 'ADMIN' | 'TRADER' | 'VIEWER';
  groups: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isAdmin: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.groups?.includes('admin') || false,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsAdmin = (state: AuthState) => state.isAdmin;
export const selectIsLoading = (state: AuthState) => state.isLoading;
