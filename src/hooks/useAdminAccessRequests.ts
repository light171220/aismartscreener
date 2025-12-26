import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from './useAuth';
import { PERMISSION_PRESETS, type FeatureId } from './useFeatureAccess';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TradingExperience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type UserRole = 'ADMIN' | 'TRADER' | 'VIEWER';
export type PermissionPreset = 'FULL_ACCESS' | 'DASHBOARD_ONLY' | 'SCREENING_ONLY' | 'TRADING_ONLY' | 'BASIC' | 'CUSTOM';

export interface AccessRequest {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  tradingExperience: TradingExperience;
  reason: string;
  status: AccessRequestStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveRequestInput {
  requestId: string;
  userId: string;
  email: string;
  fullName: string;
  role?: UserRole;
  permissionPreset?: PermissionPreset;
  permissions?: FeatureId[];
  notes?: string;
}

export interface RejectRequestInput {
  requestId: string;
  reviewNotes?: string;
}

export function useAdminAccessRequests() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingRequests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminAccessRequests', 'pending'],
    queryFn: async () => {
      const response = await client.models.AccessRequest.list({
        filter: { status: { eq: 'PENDING' } },
      });

      const requests = (response.data || []) as unknown as AccessRequest[];
      return requests.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    enabled: isAdmin,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const { data: allRequests = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['adminAccessRequests', 'all'],
    queryFn: async () => {
      const response = await client.models.AccessRequest.list();

      const requests = (response.data || []) as unknown as AccessRequest[];
      return requests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: isAdmin,
    staleTime: 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: async (input: ApproveRequestInput) => {
      const role = input.role || 'TRADER';
      const permissionPreset = input.permissionPreset || 'BASIC';
      const permissions = input.permissions || PERMISSION_PRESETS[permissionPreset] || PERMISSION_PRESETS.BASIC;

      const userAccessResponse = await client.models.UserAccess.create({
        ownerId: input.userId,
        email: input.email,
        fullName: input.fullName,
        role: role,
        accessStatus: 'APPROVED',
        permissions: permissions as string[],
        permissionPreset: permissionPreset,
        approvedAt: new Date().toISOString(),
        approvedBy: user?.email || 'admin',
        notes: input.notes,
      });

      if (userAccessResponse.errors) {
        throw new Error(userAccessResponse.errors[0]?.message || 'Failed to create user access');
      }

      const requestResponse = await client.models.AccessRequest.update({
        id: input.requestId,
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin',
        reviewNotes: input.notes,
      });

      if (requestResponse.errors) {
        throw new Error(requestResponse.errors[0]?.message || 'Failed to update access request');
      }

      return {
        userAccess: userAccessResponse.data,
        accessRequest: requestResponse.data,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAccessRequests'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (input: RejectRequestInput) => {
      const response = await client.models.AccessRequest.update({
        id: input.requestId,
        status: 'REJECTED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: user?.email || 'admin',
        reviewNotes: input.reviewNotes,
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to reject access request');
      }

      return response.data as unknown as AccessRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAccessRequests'] });
    },
  });

  return {
    pendingRequests,
    allRequests,
    isLoading,
    isLoadingAll,
    error,
    refetch,
    approveRequest: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    approveError: approveMutation.error,
    rejectRequest: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    rejectError: rejectMutation.error,
    pendingCount: pendingRequests.length,
  };
}
