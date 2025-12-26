import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from './useAuth';
import { PERMISSION_PRESETS, type FeatureId } from './useFeatureAccess';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type AccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
export type UserRole = 'ADMIN' | 'TRADER' | 'VIEWER';
export type PermissionPreset = 'FULL_ACCESS' | 'DASHBOARD_ONLY' | 'SCREENING_ONLY' | 'TRADING_ONLY' | 'BASIC' | 'CUSTOM';

export interface UserAccess {
  id: string;
  ownerId: string;
  email: string;
  fullName?: string;
  role: UserRole;
  accessStatus: AccessStatus;
  permissions: string[];
  permissionPreset?: PermissionPreset;
  approvedAt?: string;
  approvedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  id: string;
  role?: UserRole;
  permissions?: FeatureId[];
  permissionPreset?: PermissionPreset;
  notes?: string;
}

export interface RevokeUserInput {
  id: string;
  reason?: string;
}

export interface RestoreUserInput {
  id: string;
  notes?: string;
}

export function useAdminUsers() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await client.models.UserAccess.list();

      const userList = (response.data || []) as unknown as UserAccess[];
      return userList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: isAdmin,
    staleTime: 60 * 1000,
  });

  const activeUsers = users.filter((u) => u.accessStatus === 'APPROVED');
  const revokedUsers = users.filter((u) => u.accessStatus === 'REVOKED');
  const admins = users.filter((u) => u.role === 'ADMIN');
  const traders = users.filter((u) => u.role === 'TRADER');
  const viewers = users.filter((u) => u.role === 'VIEWER');

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const updateData: {
        id: string;
        role?: UserRole;
        permissionPreset?: PermissionPreset;
        permissions?: string[];
        notes?: string;
      } = {
        id: input.id,
      };

      if (input.role) {
        updateData.role = input.role;
      }

      if (input.permissionPreset) {
        updateData.permissionPreset = input.permissionPreset;
        if (input.permissionPreset !== 'CUSTOM') {
          updateData.permissions = PERMISSION_PRESETS[input.permissionPreset] as string[];
        }
      }

      if (input.permissions) {
        updateData.permissions = input.permissions as string[];
        updateData.permissionPreset = 'CUSTOM';
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes;
      }

      const response = await client.models.UserAccess.update(updateData);

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to update user');
      }

      return response.data as unknown as UserAccess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (input: RevokeUserInput) => {
      const response = await client.models.UserAccess.update({
        id: input.id,
        accessStatus: 'REVOKED',
        revokedAt: new Date().toISOString(),
        revokedBy: user?.email || 'admin',
        revokeReason: input.reason,
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to revoke user access');
      }

      return response.data as unknown as UserAccess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (input: RestoreUserInput) => {
      const response = await client.models.UserAccess.update({
        id: input.id,
        accessStatus: 'APPROVED',
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        approvedAt: new Date().toISOString(),
        approvedBy: user?.email || 'admin',
        notes: input.notes,
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to restore user access');
      }

      return response.data as unknown as UserAccess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.models.UserAccess.delete({ id });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to delete user');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  return {
    users,
    activeUsers,
    revokedUsers,
    admins,
    traders,
    viewers,
    isLoading,
    error,
    refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    revokeUser: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    revokeError: revokeMutation.error,
    restoreUser: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    restoreError: restoreMutation.error,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    totalCount: users.length,
    activeCount: activeUsers.length,
    revokedCount: revokedUsers.length,
  };
}
