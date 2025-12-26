import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  GlassSearchInput,
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
import { useAdminUsers, type UserAccess, type UserRole, type PermissionPreset } from '@/hooks/useAdminUsers';
import { PERMISSION_PRESETS, FEATURE_LABELS, FEATURE_IDS, type FeatureId } from '@/hooks/useFeatureAccess';
import { Users, Edit2, Shield, Ban, CheckCircle2, RefreshCw, AlertCircle, Trash2, RotateCcw } from 'lucide-react';

const PRESET_LABELS: Record<PermissionPreset, string> = {
  FULL_ACCESS: 'Full Access',
  DASHBOARD_ONLY: 'Dashboard Only',
  SCREENING_ONLY: 'Screening Only',
  TRADING_ONLY: 'Trading Only',
  BASIC: 'Basic',
  CUSTOM: 'Custom',
};

export function UserManagementPage() {
  const {
    users,
    activeUsers,
    revokedUsers,
    isLoading,
    error,
    refetch,
    updateUser,
    isUpdating,
    revokeUser,
    isRevoking,
    restoreUser,
    isRestoring,
    deleteUser,
    isDeleting,
    totalCount,
    activeCount,
    revokedCount,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<UserAccess | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const [editForm, setEditForm] = React.useState({
    role: 'TRADER' as UserRole,
    permissionPreset: 'BASIC' as PermissionPreset,
    permissions: [] as FeatureId[],
    notes: '',
  });

  const [revokeReason, setRevokeReason] = React.useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        (u.fullName?.toLowerCase().includes(query) ?? false)
    );
  }, [users, searchQuery]);

  const openEditDialog = (user: UserAccess) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      permissionPreset: (user.permissionPreset as PermissionPreset) || 'CUSTOM',
      permissions: (user.permissions as FeatureId[]) || [],
      notes: user.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        id: selectedUser.id,
        role: editForm.role,
        permissionPreset: editForm.permissionPreset,
        permissions: editForm.permissionPreset === 'CUSTOM' ? editForm.permissions : undefined,
        notes: editForm.notes,
      });
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleRevokeUser = async () => {
    if (!selectedUser) return;

    try {
      await revokeUser({
        id: selectedUser.id,
        reason: revokeReason,
      });
      setRevokeDialogOpen(false);
      setSelectedUser(null);
      setRevokeReason('');
    } catch (err) {
      console.error('Failed to revoke user:', err);
    }
  };

  const handleRestoreUser = async () => {
    if (!selectedUser) return;

    try {
      await restoreUser({
        id: selectedUser.id,
      });
      setRestoreDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to restore user:', err);
    }
  };

  const togglePermission = (feature: FeatureId) => {
    setEditForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(feature)
        ? prev.permissions.filter((p) => p !== feature)
        : [...prev.permissions, feature],
      permissionPreset: 'CUSTOM',
    }));
  };

  if (isLoading) return <PageLoader message="Loading users..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-400" />
            User Management
          </h1>
          <p className="text-slate-400">
            Manage user permissions and access levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
          <div className="w-full md:w-64">
            <GlassSearchInput
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Failed to load users. Please try again.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Revoked</p>
          <p className="text-2xl font-bold text-red-400">{revokedCount}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>All Users</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Permissions</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Approved</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{user.fullName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="py-3 px-4">
                        <GlassBadge variant="default" size="sm">
                          {PRESET_LABELS[(user.permissionPreset as PermissionPreset)] || 'Custom'}
                        </GlassBadge>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={user.accessStatus} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {user.approvedAt
                          ? new Date(user.approvedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <GlassButton
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditDialog(user)}
                            title="Edit permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </GlassButton>
                          {user.accessStatus === 'APPROVED' ? (
                            <GlassButton
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => {
                                setSelectedUser(user);
                                setRevokeDialogOpen(true);
                              }}
                              title="Revoke access"
                            >
                              <Ban className="w-4 h-4" />
                            </GlassButton>
                          ) : (
                            <GlassButton
                              variant="ghost"
                              size="icon-sm"
                              className="text-emerald-400 hover:text-emerald-300"
                              onClick={() => {
                                setSelectedUser(user);
                                setRestoreDialogOpen(true);
                              }}
                              title="Restore access"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </GlassButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Edit User Dialog */}
      <GlassDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <GlassDialogContent className="max-w-lg">
          <GlassDialogHeader>
            <GlassDialogTitle>Edit User Permissions</GlassDialogTitle>
            <GlassDialogDescription>
              Update permissions for {selectedUser?.fullName || selectedUser?.email}
            </GlassDialogDescription>
          </GlassDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Role</label>
              <GlassSelect
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value as UserRole })}
              >
                <GlassSelectTrigger>
                  <GlassSelectValue />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  <GlassSelectItem value="TRADER">Trader</GlassSelectItem>
                  <GlassSelectItem value="VIEWER">Viewer</GlassSelectItem>
                  <GlassSelectItem value="ADMIN">Admin</GlassSelectItem>
                </GlassSelectContent>
              </GlassSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Permission Preset</label>
              <GlassSelect
                value={editForm.permissionPreset}
                onValueChange={(value) => {
                  const preset = value as PermissionPreset;
                  setEditForm({
                    ...editForm,
                    permissionPreset: preset,
                    permissions: preset !== 'CUSTOM' ? (PERMISSION_PRESETS[preset] as FeatureId[]) : editForm.permissions,
                  });
                }}
              >
                <GlassSelectTrigger>
                  <GlassSelectValue />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  {Object.entries(PRESET_LABELS).map(([key, label]) => (
                    <GlassSelectItem key={key} value={key}>
                      {label}
                    </GlassSelectItem>
                  ))}
                </GlassSelectContent>
              </GlassSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Features</label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-white/5 border border-white/10 max-h-48 overflow-y-auto">
                {FEATURE_IDS.map((feature) => (
                  <label key={feature} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.permissions.includes(feature)}
                      onChange={() => togglePermission(feature)}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <span className="text-slate-300">{FEATURE_LABELS[feature]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Notes</label>
              <GlassTextarea
                placeholder="Add any notes..."
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <GlassDialogFooter>
            <GlassButton variant="ghost" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleUpdateUser} loading={isUpdating}>
              Save Changes
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      {/* Revoke Dialog */}
      <GlassDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <GlassDialogContent>
          <GlassDialogHeader>
            <GlassDialogTitle>Revoke User Access</GlassDialogTitle>
            <GlassDialogDescription>
              Are you sure you want to revoke access for {selectedUser?.fullName || selectedUser?.email}?
            </GlassDialogDescription>
          </GlassDialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-white mb-2">Reason (optional)</label>
            <GlassTextarea
              placeholder="Provide a reason for revoking access..."
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />
          </div>
          <GlassDialogFooter>
            <GlassButton variant="ghost" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="destructive" onClick={handleRevokeUser} loading={isRevoking}>
              Revoke Access
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      {/* Restore Dialog */}
      <GlassDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <GlassDialogContent>
          <GlassDialogHeader>
            <GlassDialogTitle>Restore User Access</GlassDialogTitle>
            <GlassDialogDescription>
              Are you sure you want to restore access for {selectedUser?.fullName || selectedUser?.email}?
            </GlassDialogDescription>
          </GlassDialogHeader>
          <GlassDialogFooter>
            <GlassButton variant="ghost" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="success" onClick={handleRestoreUser} loading={isRestoring}>
              Restore Access
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { variant: 'warning' | 'primary' | 'default'; icon: React.ReactNode }> = {
    ADMIN: { variant: 'warning', icon: <Shield className="w-3 h-3 mr-1" /> },
    TRADER: { variant: 'primary', icon: null },
    VIEWER: { variant: 'default', icon: null },
  };

  const { variant, icon } = config[role] || config.VIEWER;

  return (
    <GlassBadge variant={variant} size="sm">
      {icon}
      {role}
    </GlassBadge>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <GlassBadge
      variant={status === 'APPROVED' ? 'success' : 'destructive'}
      size="sm"
    >
      {status}
    </GlassBadge>
  );
}

export default UserManagementPage;
