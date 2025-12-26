import * as React from 'react';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  GlassDialog,
  GlassDialogTrigger,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
  GlassTextarea,
  GlassSelect,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSelectContent,
  GlassSelectItem,
  PageLoader,
} from '@/components/ui';
import { useAdminAccessRequests, type ApproveRequestInput, type PermissionPreset, type UserRole } from '@/hooks/useAdminAccessRequests';
import { PERMISSION_PRESETS, FEATURE_LABELS, type FeatureId } from '@/hooks/useFeatureAccess';
import { Clock, CheckCircle2, XCircle, User, Mail, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner (< 1 year)',
  INTERMEDIATE: 'Intermediate (1-3 years)',
  ADVANCED: 'Advanced (3-5 years)',
  PROFESSIONAL: 'Professional (5+ years)',
};

const PRESET_LABELS: Record<PermissionPreset, string> = {
  FULL_ACCESS: 'Full Access - All Features',
  DASHBOARD_ONLY: 'Dashboard Only',
  SCREENING_ONLY: 'Screening Features Only',
  TRADING_ONLY: 'Trading Features Only',
  BASIC: 'Basic - Dashboard, AI Screener, Trades',
  CUSTOM: 'Custom',
};

export function AccessRequestsPage() {
  const {
    pendingRequests,
    isLoading,
    error,
    refetch,
    approveRequest,
    isApproving,
    rejectRequest,
    isRejecting,
    pendingCount,
  } = useAdminAccessRequests();

  const [selectedRequest, setSelectedRequest] = React.useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [approveForm, setApproveForm] = React.useState({
    role: 'TRADER' as UserRole,
    permissionPreset: 'BASIC' as PermissionPreset,
    notes: '',
  });

  const [rejectForm, setRejectForm] = React.useState({
    reviewNotes: '',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleApprove = async () => {
    const request = pendingRequests.find((r) => r.id === selectedRequest);
    if (!request) return;

    try {
      await approveRequest({
        requestId: request.id,
        userId: request.userId,
        email: request.email,
        fullName: request.fullName,
        role: approveForm.role,
        permissionPreset: approveForm.permissionPreset,
        notes: approveForm.notes,
      });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setApproveForm({ role: 'TRADER', permissionPreset: 'BASIC', notes: '' });
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await rejectRequest({
        requestId: selectedRequest,
        reviewNotes: rejectForm.reviewNotes,
      });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectForm({ reviewNotes: '' });
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  if (isLoading) return <PageLoader message="Loading access requests..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Clock className="w-8 h-8 text-amber-400" />
            Access Requests
          </h1>
          <p className="text-slate-400">
            Review and manage pending access requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
          <GlassBadge variant="warning" size="lg">
            {pendingCount} pending
          </GlassBadge>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Failed to load requests. Please try again.
        </div>
      )}

      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <GlassCard key={request.id}>
            <GlassCardContent>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{request.fullName}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Mail className="w-4 h-4" />
                      {request.email}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <GlassBadge variant="primary" size="sm">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {EXPERIENCE_LABELS[request.tradingExperience] || request.tradingExperience}
                      </GlassBadge>
                      <span className="text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 max-w-lg">
                      "{request.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <GlassDialog open={rejectDialogOpen && selectedRequest === request.id} onOpenChange={(open) => {
                    setRejectDialogOpen(open);
                    if (!open) setSelectedRequest(null);
                  }}>
                    <GlassDialogTrigger asChild>
                      <GlassButton
                        variant="destructive"
                        size="sm"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </GlassButton>
                    </GlassDialogTrigger>
                    <GlassDialogContent>
                      <GlassDialogHeader>
                        <GlassDialogTitle>Reject Access Request</GlassDialogTitle>
                        <GlassDialogDescription>
                          Are you sure you want to reject the request from {request.fullName}?
                        </GlassDialogDescription>
                      </GlassDialogHeader>
                      <div className="py-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          Rejection Reason (optional)
                        </label>
                        <GlassTextarea
                          placeholder="Provide a reason for rejection..."
                          rows={3}
                          value={rejectForm.reviewNotes}
                          onChange={(e) => setRejectForm({ ...rejectForm, reviewNotes: e.target.value })}
                        />
                      </div>
                      <GlassDialogFooter>
                        <GlassButton variant="ghost" onClick={() => setRejectDialogOpen(false)}>
                          Cancel
                        </GlassButton>
                        <GlassButton variant="destructive" onClick={handleReject} loading={isRejecting}>
                          Reject Request
                        </GlassButton>
                      </GlassDialogFooter>
                    </GlassDialogContent>
                  </GlassDialog>

                  <GlassDialog open={approveDialogOpen && selectedRequest === request.id} onOpenChange={(open) => {
                    setApproveDialogOpen(open);
                    if (!open) setSelectedRequest(null);
                  }}>
                    <GlassDialogTrigger asChild>
                      <GlassButton
                        variant="success"
                        size="sm"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </GlassButton>
                    </GlassDialogTrigger>
                    <GlassDialogContent className="max-w-lg">
                      <GlassDialogHeader>
                        <GlassDialogTitle>Approve Access Request</GlassDialogTitle>
                        <GlassDialogDescription>
                          Set permissions for {request.fullName}
                        </GlassDialogDescription>
                      </GlassDialogHeader>
                      <div className="py-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            User Role
                          </label>
                          <GlassSelect
                            value={approveForm.role}
                            onValueChange={(value) => setApproveForm({ ...approveForm, role: value as UserRole })}
                          >
                            <GlassSelectTrigger>
                              <GlassSelectValue placeholder="Select role" />
                            </GlassSelectTrigger>
                            <GlassSelectContent>
                              <GlassSelectItem value="TRADER">Trader</GlassSelectItem>
                              <GlassSelectItem value="VIEWER">Viewer</GlassSelectItem>
                              <GlassSelectItem value="ADMIN">Admin</GlassSelectItem>
                            </GlassSelectContent>
                          </GlassSelect>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Permission Preset
                          </label>
                          <GlassSelect
                            value={approveForm.permissionPreset}
                            onValueChange={(value) => setApproveForm({ ...approveForm, permissionPreset: value as PermissionPreset })}
                          >
                            <GlassSelectTrigger>
                              <GlassSelectValue placeholder="Select preset" />
                            </GlassSelectTrigger>
                            <GlassSelectContent>
                              {Object.entries(PRESET_LABELS).filter(([key]) => key !== 'CUSTOM').map(([key, label]) => (
                                <GlassSelectItem key={key} value={key}>
                                  {label}
                                </GlassSelectItem>
                              ))}
                            </GlassSelectContent>
                          </GlassSelect>
                          <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-slate-400 mb-2">Features included:</p>
                            <div className="flex flex-wrap gap-1">
                              {(PERMISSION_PRESETS[approveForm.permissionPreset] || []).map((feature) => (
                                <GlassBadge key={feature} variant="default" size="sm">
                                  {FEATURE_LABELS[feature as FeatureId] || feature}
                                </GlassBadge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Notes (optional)
                          </label>
                          <GlassTextarea
                            placeholder="Add any notes about this user..."
                            rows={2}
                            value={approveForm.notes}
                            onChange={(e) => setApproveForm({ ...approveForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                      <GlassDialogFooter>
                        <GlassButton variant="ghost" onClick={() => setApproveDialogOpen(false)}>
                          Cancel
                        </GlassButton>
                        <GlassButton variant="success" onClick={handleApprove} loading={isApproving}>
                          Approve & Grant Access
                        </GlassButton>
                      </GlassDialogFooter>
                    </GlassDialogContent>
                  </GlassDialog>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        ))}

        {pendingRequests.length === 0 && (
          <GlassCard className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-slate-400">No pending access requests at this time.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

export default AccessRequestsPage;
