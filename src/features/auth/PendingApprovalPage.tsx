import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import {
  GlassCard,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { Clock, ArrowLeft, Mail, RefreshCw, CheckCircle2, XCircle, AlertCircle, LogOut } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { accessRequest, isPending, isApproved, isRejected, hasRequest, isLoading, refetch } = useAccessRequest();
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  React.useEffect(() => {
    if (!isLoading && isApproved) {
      navigate('/app');
    }
  }, [isLoading, isApproved, navigate]);

  React.useEffect(() => {
    if (!isLoading && !hasRequest && isAuthenticated) {
      navigate('/request-access');
    }
  }, [isLoading, hasRequest, isAuthenticated, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return <PageLoader message="Loading your request status..." fullScreen />;
  }

  if (isRejected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md text-center">
          <GlassCardContent className="py-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>

            <GlassBadge variant="destructive" className="mb-4">
              Request Rejected
            </GlassBadge>

            <h2 className="text-2xl font-bold text-white mb-2">Access Request Declined</h2>
            <p className="text-slate-400 mb-6">
              Unfortunately, your access request was not approved at this time.
            </p>

            {accessRequest?.reviewNotes && (
              <div className="glass-subtle rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Review Notes</span>
                </div>
                <p className="text-white text-sm">{accessRequest.reviewNotes}</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
              <p className="text-sm text-amber-300">
                You may reapply after 30 days or contact support for more information.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link to="/?rejected=true" className="w-full">
                <GlassButton variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </GlassButton>
              </Link>
              <GlassButton variant="ghost" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  const submittedAt = accessRequest?.createdAt
    ? new Date(accessRequest.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md text-center">
        <GlassCardContent className="py-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>

          <GlassBadge variant="warning" className="mb-4">
            Under Review
          </GlassBadge>

          <h2 className="text-2xl font-bold text-white mb-2">Pending Approval</h2>
          <p className="text-slate-400 mb-6">
            Your access request is currently being reviewed by our team.
          </p>

          <div className="glass-subtle rounded-lg p-4 mb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Email</span>
            </div>
            <p className="text-white">{user?.email || accessRequest?.email}</p>
          </div>

          <div className="glass-subtle rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Submitted</span>
            </div>
            <p className="text-white">{submittedAt}</p>
          </div>

          {accessRequest?.tradingExperience && (
            <div className="glass-subtle rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-400">Experience Level</span>
              </div>
              <p className="text-white capitalize">{accessRequest.tradingExperience.toLowerCase().replace('_', ' ')}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
            <p className="text-sm text-blue-300">
              <strong>Expected Review Time:</strong> 24-48 hours
            </p>
            <p className="text-xs text-blue-400/70 mt-1">
              You'll receive an email notification once your request is reviewed.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <GlassButton
              variant="outline"
              className="w-full"
              onClick={handleRefresh}
              loading={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Check Status
            </GlassButton>
            <Link to="/" className="w-full">
              <GlassButton variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </GlassButton>
            </Link>
            <GlassButton variant="ghost" className="w-full text-slate-500" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </GlassButton>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default PendingApprovalPage;
