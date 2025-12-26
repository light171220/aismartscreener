import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { useAdminAccessRequests } from '@/hooks/useAdminAccessRequests';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Shield, Users, Clock, Activity, Settings, ArrowRight, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export function AdminDashboardPage() {
  const {
    pendingRequests,
    allRequests,
    isLoading: requestsLoading,
    pendingCount,
    refetch: refetchRequests,
  } = useAdminAccessRequests();

  const {
    users,
    activeCount,
    revokedCount,
    totalCount,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useAdminUsers();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRequests(), refetchUsers()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const recentActivity = React.useMemo(() => {
    const activities: Array<{
      icon: React.ElementType;
      iconColor: string;
      text: string;
      time: string;
    }> = [];

    const approvedRequests = allRequests
      .filter((r) => r.status === 'APPROVED' && r.reviewedAt)
      .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())
      .slice(0, 3);

    const rejectedRequests = allRequests
      .filter((r) => r.status === 'REJECTED' && r.reviewedAt)
      .sort((a, b) => new Date(b.reviewedAt!).getTime() - new Date(a.reviewedAt!).getTime())
      .slice(0, 2);

    const revokedUsers = users
      .filter((u) => u.accessStatus === 'REVOKED' && u.revokedAt)
      .sort((a, b) => new Date(b.revokedAt!).getTime() - new Date(a.revokedAt!).getTime())
      .slice(0, 2);

    approvedRequests.forEach((r) => {
      activities.push({
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
        text: `Access approved for ${r.email}`,
        time: formatRelativeTime(r.reviewedAt!),
      });
    });

    rejectedRequests.forEach((r) => {
      activities.push({
        icon: XCircle,
        iconColor: 'text-red-400',
        text: `Access rejected for ${r.email}`,
        time: formatRelativeTime(r.reviewedAt!),
      });
    });

    revokedUsers.forEach((u) => {
      activities.push({
        icon: XCircle,
        iconColor: 'text-amber-400',
        text: `Access revoked for ${u.email}`,
        time: formatRelativeTime(u.revokedAt!),
      });
    });

    return activities
      .sort((a, b) => {
        const timeA = parseRelativeTime(a.time);
        const timeB = parseRelativeTime(b.time);
        return timeA - timeB;
      })
      .slice(0, 5);
  }, [allRequests, users]);

  if (requestsLoading || usersLoading) {
    return <PageLoader message="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-400" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Manage users, access requests, and system settings
          </p>
        </div>
        <GlassButton variant="ghost" size="sm" onClick={handleRefresh} loading={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="py-4 px-6 border-l-4 border-l-amber-500">
          <p className="text-sm text-slate-400">Pending Requests</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6 border-l-4 border-l-blue-500">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6 border-l-4 border-l-emerald-500">
          <p className="text-sm text-slate-400">Active Users</p>
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6 border-l-4 border-l-purple-500">
          <p className="text-sm text-slate-400">System Status</p>
          <p className="text-lg font-bold text-emerald-400">Healthy</p>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/access-requests">
          <GlassCard hover className="h-full">
            <GlassCardContent className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Access Requests</h3>
              <p className="text-slate-400 mb-4">Review and approve pending access requests</p>
              <GlassBadge variant={pendingCount > 0 ? 'warning' : 'success'}>
                {pendingCount > 0 ? `${pendingCount} pending` : 'All caught up!'}
              </GlassBadge>
            </GlassCardContent>
          </GlassCard>
        </Link>

        <Link to="/admin/users">
          <GlassCard hover className="h-full">
            <GlassCardContent className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
              <p className="text-slate-400 mb-4">Manage user permissions and access levels</p>
              <GlassBadge variant="primary">{totalCount} users</GlassBadge>
            </GlassCardContent>
          </GlassCard>
        </Link>

        <Link to="/admin/parameters">
          <GlassCard hover className="h-full">
            <GlassCardContent className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Screening Parameters</h3>
              <p className="text-slate-400 mb-4">Configure AI screening thresholds</p>
              <GlassBadge variant="default">12 parameters</GlassBadge>
            </GlassCardContent>
          </GlassCard>
        </Link>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <GlassCardTitle>Recent Activity</GlassCardTitle>
            <Link to="/admin/access-requests">
              <GlassButton variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  iconColor={activity.iconColor}
                  text={activity.text}
                  time={activity.time}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No recent activity</p>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {pendingCount > 0 && (
        <GlassCard className="border border-amber-500/30 bg-amber-500/5">
          <GlassCardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">Pending Access Requests</p>
              <p className="text-sm text-slate-400">
                You have {pendingCount} access request{pendingCount > 1 ? 's' : ''} waiting for review.
              </p>
            </div>
            <Link to="/admin/access-requests">
              <GlassButton variant="warning" size="sm">
                Review Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </GlassButton>
            </Link>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  iconColor,
  text,
  time,
}: {
  icon: React.ElementType;
  iconColor: string;
  text: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <p className="flex-1 text-sm text-slate-300">{text}</p>
      <p className="text-xs text-slate-500">{time}</p>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function parseRelativeTime(relativeTime: string): number {
  if (relativeTime === 'Just now') return 0;
  const match = relativeTime.match(/(\d+)/);
  if (!match) return Infinity;
  const num = parseInt(match[1], 10);
  if (relativeTime.includes('minute')) return num;
  if (relativeTime.includes('hour')) return num * 60;
  if (relativeTime.includes('day')) return num * 1440;
  return Infinity;
}

export default AdminDashboardPage;
