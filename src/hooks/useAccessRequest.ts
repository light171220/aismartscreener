import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { useAuth } from './useAuth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TradingExperience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';

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

export interface CreateAccessRequestInput {
  fullName: string;
  tradingExperience: TradingExperience;
  reason: string;
}

export function useAccessRequest() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: accessRequest, isLoading, error, refetch } = useQuery({
    queryKey: ['accessRequest', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const response = await client.models.AccessRequest.list({
          filter: { userId: { eq: user.id } },
        });

        const requests = response.data || [];
        if (requests.length === 0) return null;

        const sortedRequests = requests.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return sortedRequests[0] as unknown as AccessRequest;
      } catch (err) {
        console.error('Error fetching access request:', err);
        return null;
      }
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (input: CreateAccessRequestInput) => {
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      const response = await client.models.AccessRequest.create({
        userId: user.id,
        email: user.email,
        fullName: input.fullName,
        tradingExperience: input.tradingExperience,
        reason: input.reason,
        status: 'PENDING',
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to create access request');
      }

      return response.data as unknown as AccessRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRequest', user?.id] });
    },
  });

  const isPending = accessRequest?.status === 'PENDING';
  const isApproved = accessRequest?.status === 'APPROVED';
  const isRejected = accessRequest?.status === 'REJECTED';
  const hasRequest = !!accessRequest;

  return {
    accessRequest,
    isLoading,
    error,
    refetch,
    createRequest: createRequestMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
    createError: createRequestMutation.error,
    isPending,
    isApproved,
    isRejected,
    hasRequest,
  };
}
