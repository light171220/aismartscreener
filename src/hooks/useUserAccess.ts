import { useQuery } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from './useAuth';
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

export function useUserAccess() {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userAccess', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      try {
        const response = await client.models.UserAccess.list({
          filter: { ownerId: { eq: user.id } },
        });

        const accessRecords = response.data || [];
        if (accessRecords.length === 0) {
          return null;
        }

        const sortedRecords = accessRecords.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return sortedRecords[0] as unknown as UserAccess;
      } catch (err) {
        console.error('Error fetching user access:', err);
        return null;
      }
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const isApproved = data?.accessStatus === 'APPROVED';
  const isPending = data?.accessStatus === 'PENDING';
  const isRevoked = data?.accessStatus === 'REVOKED';
  const isRejected = data?.accessStatus === 'REJECTED';

  return {
    userAccess: data,
    isLoading,
    error,
    refetch,
    isApproved,
    isPending,
    isRevoked,
    isRejected,
    hasAccess: isApproved,
  };
}
