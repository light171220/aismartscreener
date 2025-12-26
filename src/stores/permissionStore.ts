import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FeatureId } from '@/hooks/useFeatureAccess';

interface PermissionState {
  permissions: FeatureId[];
  role: 'ADMIN' | 'TRADER' | 'VIEWER' | null;
  isLoading: boolean;
  lastFetched: number | null;

  setPermissions: (permissions: FeatureId[]) => void;
  setRole: (role: 'ADMIN' | 'TRADER' | 'VIEWER' | null) => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (feature: FeatureId) => boolean;
  hasAnyPermission: (features: FeatureId[]) => boolean;
  hasAllPermissions: (features: FeatureId[]) => boolean;
  isAdmin: () => boolean;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      permissions: [],
      role: null,
      isLoading: true,
      lastFetched: null,

      setPermissions: (permissions) => set({
        permissions,
        lastFetched: Date.now(),
      }),

      setRole: (role) => set({ role }),

      setLoading: (isLoading) => set({ isLoading }),

      hasPermission: (feature) => {
        const { permissions, role } = get();
        if (role === 'ADMIN') return true;
        if (feature === 'dashboard') return true;
        return permissions.includes(feature);
      },

      hasAnyPermission: (features) => {
        const { hasPermission } = get();
        return features.some((f) => hasPermission(f));
      },

      hasAllPermissions: (features) => {
        const { hasPermission } = get();
        return features.every((f) => hasPermission(f));
      },

      isAdmin: () => get().role === 'ADMIN',

      reset: () => set({
        permissions: [],
        role: null,
        isLoading: true,
        lastFetched: null,
      }),
    }),
    { name: 'permission-store' }
  )
);
