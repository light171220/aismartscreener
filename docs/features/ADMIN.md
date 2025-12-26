# Admin System Documentation

## 1. Overview

The Admin System provides administrative controls for managing users, access requests, screening parameters, and **granular feature access control**. Only users in the `admin` Cognito group have access to these features.

### Admin Capabilities
1. **User Management** - View, approve, revoke user access
2. **Access Requests** - Review and process new access requests
3. **Feature Permissions** - Control which pages/features each user can access
4. **Screening Parameters** - Configure Method 1 & Method 2 filter values
5. **System Monitoring** - View system health and statistics

---

## 2. Access Control Architecture

### User Access States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ACCESS STATE MACHINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              ┌─────────────┐                                 │
│                              │   VISITOR   │                                 │
│                              │ (no account)│                                 │
│                              └──────┬──────┘                                 │
│                                     │                                        │
│                              Submit Request                                  │
│                                     │                                        │
│                                     ▼                                        │
│                              ┌─────────────┐                                 │
│                              │   PENDING   │◄───────────────────┐           │
│                              │  (waiting)  │                     │           │
│                              └──────┬──────┘                     │           │
│                                     │                            │           │
│                    ┌────────────────┼────────────────┐          │           │
│                    │                │                │          │           │
│                Approve            Reject         Ignore          │           │
│                    │                │                │          │           │
│                    ▼                ▼                │          │           │
│             ┌─────────────┐  ┌─────────────┐        │          │           │
│             │  APPROVED   │  │  REJECTED   │────────┘          │           │
│             │  (active)   │  │  (denied)   │  Can reapply      │           │
│             └──────┬──────┘  └─────────────┘  after 30 days    │           │
│                    │                                            │           │
│                    │                                            │           │
│                 Revoke                                          │           │
│                    │                                            │           │
│                    ▼                                            │           │
│             ┌─────────────┐                                     │           │
│             │   REVOKED   │─────────────────────────────────────┘           │
│             │  (blocked)  │  Admin can re-approve                           │
│             └─────────────┘                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Access Levels

| Role | Access |
|------|--------|
| **Visitor** | Landing page only |
| **Pending** | Landing page + Pending approval page |
| **User** | Platform access based on granted permissions |
| **Admin** | Full platform + Admin panel |

---

## 3. Feature Permission System

### Available Features/Pages

```typescript
// types/permissions.ts
export const FEATURES = {
  // Core
  DASHBOARD: 'dashboard',
  
  // AI Screening
  AI_SCREENER: 'ai_screener',
  AI_SCREENER_PIPELINE: 'ai_screener_pipeline',
  
  // Filter Screening
  FILTER_SCREENER: 'filter_screener',
  FILTER_HIGH_UPSIDE: 'filter_high_upside',
  FILTER_UNDERVALUED: 'filter_undervalued',
  
  // Trading
  SUGGESTIONS: 'suggestions',
  OPEN_TRADES: 'open_trades',
  TRADE_HISTORY: 'trade_history',
  
  // AI Assistant
  TRADE_ASSISTANT: 'trade_assistant',
  TRADE_REVIEWER: 'trade_reviewer',
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

// Feature metadata for UI
export const FEATURE_CONFIG: Record<Feature, FeatureInfo> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with portfolio overview',
    icon: 'LayoutDashboard',
    category: 'Core',
    route: '/app',
  },
  ai_screener: {
    id: 'ai_screener',
    name: 'AI Screener Results',
    description: 'View AI-generated stock picks',
    icon: 'Sparkles',
    category: 'AI Screening',
    route: '/app/ai-screener',
  },
  ai_screener_pipeline: {
    id: 'ai_screener_pipeline',
    name: 'AI Pipeline View',
    description: 'View screening pipeline stages',
    icon: 'GitBranch',
    category: 'AI Screening',
    route: '/app/ai-screener/pipeline',
    parent: 'ai_screener',
  },
  filter_screener: {
    id: 'filter_screener',
    name: 'Filter Screener',
    description: 'Custom filter-based screening',
    icon: 'Filter',
    category: 'Filter Screening',
    route: '/app/filter-screener',
  },
  filter_high_upside: {
    id: 'filter_high_upside',
    name: 'High Upside Stocks',
    description: 'Stocks with 100%+ upside potential',
    icon: 'TrendingUp',
    category: 'Filter Screening',
    route: '/app/filter-screener/high-upside',
    parent: 'filter_screener',
  },
  filter_undervalued: {
    id: 'filter_undervalued',
    name: 'Undervalued Stocks',
    description: 'Stocks below analyst targets',
    icon: 'ArrowDownCircle',
    category: 'Filter Screening',
    route: '/app/filter-screener/undervalued',
    parent: 'filter_screener',
  },
  suggestions: {
    id: 'suggestions',
    name: 'Trade Suggestions',
    description: 'AI-recommended trade setups',
    icon: 'Lightbulb',
    category: 'Trading',
    route: '/app/suggestions',
  },
  open_trades: {
    id: 'open_trades',
    name: 'Open Trades',
    description: 'Track active positions',
    icon: 'TrendingUp',
    category: 'Trading',
    route: '/app/trades',
  },
  trade_history: {
    id: 'trade_history',
    name: 'Trade History',
    description: 'View closed trades and P&L',
    icon: 'History',
    category: 'Trading',
    route: '/app/history',
  },
  trade_assistant: {
    id: 'trade_assistant',
    name: 'Trade Assistant',
    description: 'AI chat for trade analysis',
    icon: 'MessageSquare',
    category: 'AI Assistant',
    route: '/app/assistant',
  },
  trade_reviewer: {
    id: 'trade_reviewer',
    name: 'Trade Reviewer',
    description: 'AI review of trade performance',
    icon: 'ClipboardCheck',
    category: 'AI Assistant',
    route: '/app/reviewer',
  },
};

// Preset permission templates
export const PERMISSION_PRESETS = {
  FULL_ACCESS: Object.values(FEATURES),
  DASHBOARD_ONLY: ['dashboard'],
  SCREENING_ONLY: ['dashboard', 'ai_screener', 'ai_screener_pipeline', 'filter_screener', 'filter_high_upside', 'filter_undervalued'],
  TRADING_ONLY: ['dashboard', 'suggestions', 'open_trades', 'trade_history'],
  BASIC: ['dashboard', 'ai_screener', 'open_trades', 'trade_history'],
};
```

### Permission Hierarchy Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FEATURE PERMISSION CATEGORIES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │      CORE       │                                                         │
│  │                 │                                                         │
│  │  ☑ Dashboard    │  ← Always included (minimum access)                    │
│  │                 │                                                         │
│  └─────────────────┘                                                         │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │  AI SCREENING   │    │ FILTER SCREEN   │    │    TRADING      │          │
│  │                 │    │                 │    │                 │          │
│  │  ☐ AI Results   │    │  ☐ Filter Main  │    │  ☐ Suggestions  │          │
│  │  ☐ Pipeline     │    │  ☐ High Upside  │    │  ☐ Open Trades  │          │
│  │                 │    │  ☐ Undervalued  │    │  ☐ History      │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │  AI ASSISTANT   │                                                         │
│  │                 │                                                         │
│  │  ☐ Assistant    │                                                         │
│  │  ☐ Reviewer     │                                                         │
│  │                 │                                                         │
│  └─────────────────┘                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Models

### UserAccess Model (Updated with Permissions)

```typescript
// amplify/data/resource.ts
UserAccess: a.model({
  id: a.id().required(),
  
  // User Identity
  cognitoUserId: a.string().required(),
  email: a.string().required(),
  fullName: a.string().required(),
  
  // Access Control
  accessStatus: a.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).default('ACTIVE'),
  role: a.enum(['USER', 'ADMIN']).default('USER'),
  
  // ═══════════════════════════════════════════════════════════════
  // FEATURE PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  permissions: a.string().array().default([
    'dashboard',           // Always included
    'ai_screener',
    'ai_screener_pipeline',
    'filter_screener',
    'filter_high_upside',
    'filter_undervalued',
    'suggestions',
    'open_trades',
    'trade_history',
    'trade_assistant',
    'trade_reviewer',
  ]),
  permissionPreset: a.enum(['FULL_ACCESS', 'DASHBOARD_ONLY', 'SCREENING_ONLY', 'TRADING_ONLY', 'BASIC', 'CUSTOM']).default('FULL_ACCESS'),
  permissionsUpdatedBy: a.string(),
  permissionsUpdatedAt: a.datetime(),
  
  // Access Request Reference
  accessRequestId: a.string(),
  
  // Admin Actions
  approvedBy: a.string(),
  approvedAt: a.datetime(),
  revokedBy: a.string(),
  revokedAt: a.datetime(),
  revokeReason: a.string(),
  
  // Activity Tracking
  lastLoginAt: a.datetime(),
  loginCount: a.integer().default(0),
  
  // Timestamps
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.secondaryIndexes((index) => [
  index('cognitoUserId'),
  index('email'),
  index('accessStatus'),
])
.authorization((allow) => [
  allow.owner().to(['read']),
  allow.group('admin').to(['create', 'read', 'update', 'delete']),
]),
```

### AccessRequest Model

```typescript
AccessRequest: a.model({
  id: a.id().required(),
  
  // User Info
  email: a.string().required(),
  fullName: a.string().required(),
  tradingExperience: a.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
  reason: a.string(),
  
  // Status
  status: a.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  
  // Initial Permissions (set on approval)
  initialPermissions: a.string().array(),
  initialPermissionPreset: a.enum(['FULL_ACCESS', 'DASHBOARD_ONLY', 'SCREENING_ONLY', 'TRADING_ONLY', 'BASIC', 'CUSTOM']),
  
  // Admin Actions
  reviewedBy: a.string(),
  reviewedAt: a.datetime(),
  reviewNotes: a.string(),
  rejectionReason: a.string(),
  
  // Timestamps
  submittedAt: a.datetime().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.authorization((allow) => [
  allow.publicApiKey().to(['create']),
  allow.group('admin').to(['read', 'update', 'delete']),
]),
```

### ScreeningParameters Model

```typescript
ScreeningParameters: a.model({
  id: a.id().required(),
  parameterSet: a.string().required(),
  
  // Method 1 Parameters
  m1_minPrice: a.float().default(5),
  m1_maxPrice: a.float().default(300),
  m1_minAvgVolume: a.float().default(1000000),
  m1_minRelativeVolume: a.float().default(1.5),
  m1_maxSpread: a.float().default(0.05),
  m1_minATR: a.float().default(0.30),
  m1_minIntradayRange: a.float().default(1.0),
  m1_minPremarketVolMultiple: a.float().default(5.0),
  m1_minGapPercent: a.float().default(3.0),
  m1_maxGapPercent: a.float().default(10.0),
  
  // Method 2 Parameters (Gates 1-4)
  m2_g1_minPrice: a.float().default(10),
  m2_g1_maxPrice: a.float().default(500),
  m2_g1_minAvgVolume: a.float().default(1000000),
  m2_g1_minVolumeSpike: a.float().default(2.0),
  m2_g1_minATRPercent: a.float().default(2.0),
  
  m2_g2_minRelativeVolume: a.float().default(1.5),
  m2_g2_requireAboveVWAP: a.boolean().default(true),
  m2_g2_requireAboveEMA9: a.boolean().default(true),
  m2_g2_requireAboveEMA20: a.boolean().default(true),
  m2_g2_requireMarketAligned: a.boolean().default(true),
  
  m2_g3_startTime: a.string().default('09:35'),
  m2_g3_endTime: a.string().default('11:00'),
  m2_g3_intervalMinutes: a.integer().default(5),
  m2_g3_requireHoldsVWAP: a.boolean().default(true),
  m2_g3_requireNoRejection: a.boolean().default(true),
  m2_g3_requireVolumeExpansion: a.boolean().default(true),
  m2_g3_requireSPYAgrees: a.boolean().default(true),
  
  m2_g4_maxRiskPercent: a.float().default(1.0),
  m2_g4_maxVIX: a.float().default(25),
  m2_g4_minSetupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']).default('B'),
  m2_g4_minRiskReward: a.float().default(2.0),
  
  // Metadata
  isActive: a.boolean().default(true),
  lastUpdatedBy: a.string(),
  lastUpdatedAt: a.datetime(),
  createdAt: a.datetime(),
})
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.group('admin').to(['create', 'update', 'delete']),
]),
```

---

## 5. Admin Pages

### 5.1 User Permissions Management Page

```tsx
// pages/admin/UserPermissionsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Check, 
  X, 
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassBadge } from '@/components/ui/glass-badge';
import { FEATURES, FEATURE_CONFIG, PERMISSION_PRESETS, Feature } from '@/types/permissions';

export function UserPermissionsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-permissions', searchQuery],
    queryFn: () => fetchUsersWithPermissions(searchQuery),
  });
  
  const selectedUser = users?.items?.find(u => u.id === selectedUserId);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          User Permissions
        </h1>
        <p className="text-slate-400">
          Control which features and pages each user can access
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <GlassCard className="lg:col-span-1">
          <div className="mb-4">
            <GlassInput
              icon={<Search className="w-4 h-4" />}
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {users?.items?.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isSelected={selectedUserId === user.id}
                onClick={() => setSelectedUserId(user.id)}
              />
            ))}
          </div>
        </GlassCard>
        
        {/* Permission Editor */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <PermissionEditor 
              user={selectedUser} 
              onSave={() => {
                queryClient.invalidateQueries(['admin-users-permissions']);
              }}
            />
          ) : (
            <GlassCard className="flex items-center justify-center h-96">
              <div className="text-center">
                <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Select a user to manage permissions</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function UserListItem({ 
  user, 
  isSelected, 
  onClick 
}: { 
  user: UserAccess; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const permissionCount = user.permissions?.length || 0;
  const totalFeatures = Object.keys(FEATURES).length;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-xl text-left transition-all',
        'border border-transparent',
        isSelected 
          ? 'bg-blue-500/20 border-blue-500/30' 
          : 'bg-white/5 hover:bg-white/10'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{user.fullName}</p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>
        <div className="text-right">
          <GlassBadge variant={user.permissionPreset === 'FULL_ACCESS' ? 'success' : 'default'} size="sm">
            {permissionCount}/{totalFeatures}
          </GlassBadge>
        </div>
      </div>
    </button>
  );
}

function PermissionEditor({ 
  user, 
  onSave 
}: { 
  user: UserAccess;
  onSave: () => void;
}) {
  const [permissions, setPermissions] = useState<string[]>(user.permissions || []);
  const [preset, setPreset] = useState(user.permissionPreset || 'CUSTOM');
  const [isDirty, setIsDirty] = useState(false);
  
  const updateMutation = useMutation({
    mutationFn: updateUserPermissions,
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      setIsDirty(false);
      onSave();
    },
  });
  
  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    if (newPreset !== 'CUSTOM') {
      setPermissions(PERMISSION_PRESETS[newPreset] || []);
    }
    setIsDirty(true);
  };
  
  const togglePermission = (feature: string) => {
    // Dashboard is always required
    if (feature === 'dashboard') return;
    
    const newPermissions = permissions.includes(feature)
      ? permissions.filter(p => p !== feature)
      : [...permissions, feature];
    
    setPermissions(newPermissions);
    setPreset('CUSTOM');
    setIsDirty(true);
  };
  
  const handleSave = () => {
    updateMutation.mutate({
      userId: user.id,
      permissions,
      preset,
    });
  };
  
  const handleReset = () => {
    setPermissions(user.permissions || []);
    setPreset(user.permissionPreset || 'CUSTOM');
    setIsDirty(false);
  };
  
  // Group features by category
  const groupedFeatures = Object.values(FEATURE_CONFIG).reduce((acc, feature) => {
    const category = feature.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, typeof FEATURE_CONFIG[Feature][]>);
  
  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={updateMutation.isPending}
            disabled={!isDirty}
          >
            <Save className="w-4 h-4" />
            Save
          </GlassButton>
        </div>
      </div>
      
      {/* Preset Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Permission Preset
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {Object.keys(PERMISSION_PRESETS).map((presetKey) => (
            <GlassButton
              key={presetKey}
              variant={preset === presetKey ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handlePresetChange(presetKey)}
              className="justify-center"
            >
              {presetKey.replace('_', ' ')}
            </GlassButton>
          ))}
          <GlassButton
            variant={preset === 'CUSTOM' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setPreset('CUSTOM')}
            className="justify-center"
          >
            CUSTOM
          </GlassButton>
        </div>
      </div>
      
      {/* Feature Categories */}
      <div className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, features]) => (
          <FeatureCategory
            key={category}
            category={category}
            features={features}
            permissions={permissions}
            onToggle={togglePermission}
          />
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {permissions.length} of {Object.keys(FEATURES).length} features enabled
          </span>
          {isDirty && (
            <GlassBadge variant="warning">Unsaved Changes</GlassBadge>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function FeatureCategory({
  category,
  features,
  permissions,
  onToggle,
}: {
  category: string;
  features: typeof FEATURE_CONFIG[Feature][];
  permissions: string[];
  onToggle: (feature: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const enabledCount = features.filter(f => permissions.includes(f.id)).length;
  
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{category}</span>
          <GlassBadge variant={enabledCount === features.length ? 'success' : 'default'} size="sm">
            {enabledCount}/{features.length}
          </GlassBadge>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      
      {/* Features */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {features.map((feature) => {
            const isEnabled = permissions.includes(feature.id);
            const isLocked = feature.id === 'dashboard';
            
            return (
              <div
                key={feature.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  'transition-colors',
                  isEnabled ? 'bg-emerald-500/10' : 'bg-white/5',
                  isLocked && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : isEnabled ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <p className={cn(
                      'font-medium',
                      isEnabled ? 'text-white' : 'text-slate-400'
                    )}>
                      {feature.name}
                    </p>
                    <p className="text-xs text-slate-500">{feature.description}</p>
                  </div>
                </div>
                
                {!isLocked && (
                  <GlassButton
                    variant={isEnabled ? 'success' : 'ghost'}
                    size="sm"
                    onClick={() => onToggle(feature.id)}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </GlassButton>
                )}
                
                {isLocked && (
                  <GlassBadge variant="default" size="sm">
                    Required
                  </GlassBadge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### 5.2 Enhanced Approval with Initial Permissions

```tsx
// components/admin/ApproveWithPermissionsDialog.tsx
import { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { PERMISSION_PRESETS } from '@/types/permissions';

interface ApproveWithPermissionsDialogProps {
  request: AccessRequest;
  onApprove: (data: { requestId: string; permissions: string[]; preset: string }) => void;
  isLoading: boolean;
}

export function ApproveWithPermissionsDialog({
  request,
  onApprove,
  isLoading,
}: ApproveWithPermissionsDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('FULL_ACCESS');
  
  const handleApprove = () => {
    onApprove({
      requestId: request.id,
      permissions: PERMISSION_PRESETS[selectedPreset] || PERMISSION_PRESETS.FULL_ACCESS,
      preset: selectedPreset,
    });
  };
  
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Set Initial Permissions</h3>
          <p className="text-sm text-slate-400">Choose what {request.fullName} can access</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {Object.entries(PERMISSION_PRESETS).map(([key, permissions]) => (
          <button
            key={key}
            onClick={() => setSelectedPreset(key)}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all',
              'border',
              selectedPreset === key
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{key.replace('_', ' ')}</p>
                <p className="text-sm text-slate-400">
                  {permissions.length} features enabled
                </p>
              </div>
              {selectedPreset === key && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          </button>
        ))}
      </div>
      
      <GlassButton
        variant="success"
        className="w-full"
        onClick={handleApprove}
        loading={isLoading}
      >
        <CheckCircle className="w-4 h-4" />
        Approve with {selectedPreset.replace('_', ' ')}
      </GlassButton>
    </GlassCard>
  );
}
```

---

## 6. Permission-Based Route Guards

### FeatureRoute Component

```tsx
// components/auth/FeatureRoute.tsx
import { useUserAccess } from '@/hooks/useUserAccess';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Feature } from '@/types/permissions';

interface FeatureRouteProps {
  feature: Feature;
  children: React.ReactNode;
}

export function FeatureRoute({ feature, children }: FeatureRouteProps) {
  const { userAccess, isLoading } = useUserAccess();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }
  
  // Admins have access to everything
  if (userAccess?.role === 'ADMIN') {
    return <>{children}</>;
  }
  
  // Check if user has permission for this feature
  const hasPermission = userAccess?.permissions?.includes(feature);
  
  if (!hasPermission) {
    return <AccessDeniedPage feature={feature} />;
  }
  
  return <>{children}</>;
}

function AccessDeniedPage({ feature }: { feature: Feature }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <GlassCard className="max-w-md text-center p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 mb-6">
          You don't have permission to access this feature. 
          Please contact your administrator if you need access.
        </p>
        <GlassButton variant="primary" asChild>
          <Link to="/app">Go to Dashboard</Link>
        </GlassButton>
      </GlassCard>
    </div>
  );
}
```

### Updated Route Configuration

```tsx
// routes.tsx
import { FeatureRoute } from '@/components/auth/FeatureRoute';
import { FEATURES } from '@/types/permissions';

// Protected app routes with feature checks
{
  path: '/app',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    // Dashboard - always accessible (minimum permission)
    { 
      index: true, 
      element: (
        <FeatureRoute feature={FEATURES.DASHBOARD}>
          <DashboardPage />
        </FeatureRoute>
      ),
    },
    
    // AI Screener
    { 
      path: 'ai-screener', 
      element: (
        <FeatureRoute feature={FEATURES.AI_SCREENER}>
          <AIScreenerPage />
        </FeatureRoute>
      ),
    },
    { 
      path: 'ai-screener/pipeline', 
      element: (
        <FeatureRoute feature={FEATURES.AI_SCREENER_PIPELINE}>
          <PipelinePage />
        </FeatureRoute>
      ),
    },
    
    // Filter Screener
    { 
      path: 'filter-screener/high-upside', 
      element: (
        <FeatureRoute feature={FEATURES.FILTER_HIGH_UPSIDE}>
          <HighUpsidePage />
        </FeatureRoute>
      ),
    },
    { 
      path: 'filter-screener/undervalued', 
      element: (
        <FeatureRoute feature={FEATURES.FILTER_UNDERVALUED}>
          <UndervaluedPage />
        </FeatureRoute>
      ),
    },
    
    // Trading
    { 
      path: 'suggestions', 
      element: (
        <FeatureRoute feature={FEATURES.SUGGESTIONS}>
          <SuggestionsPage />
        </FeatureRoute>
      ),
    },
    { 
      path: 'trades', 
      element: (
        <FeatureRoute feature={FEATURES.OPEN_TRADES}>
          <OpenTradesPage />
        </FeatureRoute>
      ),
    },
    { 
      path: 'history', 
      element: (
        <FeatureRoute feature={FEATURES.TRADE_HISTORY}>
          <TradeHistoryPage />
        </FeatureRoute>
      ),
    },
    
    // AI Assistant
    { 
      path: 'assistant', 
      element: (
        <FeatureRoute feature={FEATURES.TRADE_ASSISTANT}>
          <TradeAssistantPage />
        </FeatureRoute>
      ),
    },
    { 
      path: 'reviewer', 
      element: (
        <FeatureRoute feature={FEATURES.TRADE_REVIEWER}>
          <TradeReviewerPage />
        </FeatureRoute>
      ),
    },
  ],
},
```

---

## 7. Permission-Aware Sidebar

```tsx
// components/layout/GlassSidebar.tsx (updated)
import { useUserAccess } from '@/hooks/useUserAccess';
import { FEATURE_CONFIG, Feature } from '@/types/permissions';

export function GlassSidebar() {
  const { userAccess } = useUserAccess();
  const permissions = userAccess?.permissions || [];
  const isAdmin = userAccess?.role === 'ADMIN';
  
  // Filter nav items based on permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Admins see everything
      if (isAdmin) return true;
      
      // Check if feature is in permissions
      const featureId = routeToFeature(item.href);
      if (!featureId) return true; // Non-feature routes always visible
      
      return permissions.includes(featureId);
    }).map(item => {
      // Also filter children
      if (item.children) {
        return {
          ...item,
          children: filterNavItems(item.children),
        };
      }
      return item;
    });
  };
  
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: filterNavItems(section.items),
  })).filter(section => section.items.length > 0);
  
  return (
    <aside className={/* ... */}>
      {/* Render filteredNavSections */}
    </aside>
  );
}

// Helper to map routes to features
function routeToFeature(route: string): Feature | null {
  const mapping: Record<string, Feature> = {
    '/app': 'dashboard',
    '/app/ai-screener': 'ai_screener',
    '/app/ai-screener/pipeline': 'ai_screener_pipeline',
    '/app/filter-screener/high-upside': 'filter_high_upside',
    '/app/filter-screener/undervalued': 'filter_undervalued',
    '/app/suggestions': 'suggestions',
    '/app/trades': 'open_trades',
    '/app/history': 'trade_history',
    '/app/assistant': 'trade_assistant',
    '/app/reviewer': 'trade_reviewer',
  };
  
  return mapping[route] || null;
}
```

---

## 8. Admin API Functions (Updated)

```typescript
// lib/api/admin.ts

// ═══════════════════════════════════════════════════════════════
// USER PERMISSIONS
// ═══════════════════════════════════════════════════════════════

export async function fetchUsersWithPermissions(search?: string) {
  let filter: any = { accessStatus: { eq: 'ACTIVE' } };
  
  if (search) {
    filter.or = [
      { fullName: { contains: search } },
      { email: { contains: search } },
    ];
  }
  
  const result = await client.models.UserAccess.list({ filter });
  
  return { items: result.data };
}

export async function updateUserPermissions({ 
  userId, 
  permissions, 
  preset 
}: { 
  userId: string; 
  permissions: string[]; 
  preset: string;
}) {
  // Ensure dashboard is always included
  const finalPermissions = permissions.includes('dashboard') 
    ? permissions 
    : ['dashboard', ...permissions];
  
  return client.models.UserAccess.update({
    id: userId,
    permissions: finalPermissions,
    permissionPreset: preset,
    permissionsUpdatedAt: new Date().toISOString(),
  });
}

export async function approveAccessRequestWithPermissions({ 
  requestId, 
  permissions, 
  preset 
}: { 
  requestId: string; 
  permissions: string[]; 
  preset: string;
}) {
  const request = await client.models.AccessRequest.get({ id: requestId });
  
  if (!request.data) throw new Error('Request not found');
  
  // Update request status
  await client.models.AccessRequest.update({
    id: requestId,
    status: 'APPROVED',
    initialPermissions: permissions,
    initialPermissionPreset: preset,
    reviewedAt: new Date().toISOString(),
  });
  
  // Create user with permissions
  await createApprovedUserWithPermissions(request.data, permissions, preset);
  
  // Send approval email
  await sendApprovalEmail(request.data.email);
}
```

---

## 9. Summary

### Admin Capabilities

| Feature | Description |
|---------|-------------|
| **Access Requests** | Review, approve with permissions, or reject |
| **User Management** | View all users, revoke/restore access |
| **User Permissions** | ⭐ Control per-user feature access |
| **Permission Presets** | Quick assign: Full, Dashboard Only, Screening, Trading, Basic |
| **Screening Parameters** | Configure Method 1 & Method 2 filter values |

### Permission Presets

| Preset | Features Included |
|--------|-------------------|
| **FULL_ACCESS** | All 11 features |
| **DASHBOARD_ONLY** | Dashboard only (1 feature) |
| **SCREENING_ONLY** | Dashboard + All screening (6 features) |
| **TRADING_ONLY** | Dashboard + All trading (4 features) |
| **BASIC** | Dashboard + AI Screener + Trades (4 features) |
| **CUSTOM** | Admin picks individual features |

### Feature List

| Feature | Category | Route |
|---------|----------|-------|
| Dashboard | Core | `/app` |
| AI Screener Results | AI Screening | `/app/ai-screener` |
| AI Pipeline View | AI Screening | `/app/ai-screener/pipeline` |
| Filter Screener | Filter Screening | `/app/filter-screener` |
| High Upside | Filter Screening | `/app/filter-screener/high-upside` |
| Undervalued | Filter Screening | `/app/filter-screener/undervalued` |
| Suggestions | Trading | `/app/suggestions` |
| Open Trades | Trading | `/app/trades` |
| Trade History | Trading | `/app/history` |
| Trade Assistant | AI Assistant | `/app/assistant` |
| Trade Reviewer | AI Assistant | `/app/reviewer` |
