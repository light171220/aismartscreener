export type UserRole = 'ADMIN' | 'TRADER' | 'VIEWER';

export type AccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export type TradingExperience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';

export interface User {
  id: string;
  email: string;
  name?: string;
  preferredUsername?: string;
  role?: UserRole;
  groups?: string[];
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserAccess {
  id: string;
  userId: string;
  email: string;
  fullName?: string;
  role: UserRole;
  accessStatus: AccessStatus;
  permissions: Feature[];
  permissionPreset?: PermissionPreset;
  permissionsUpdatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  fullName: string;
  tradingExperience: TradingExperience;
  reason: string;
  status: AccessStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  initialPermissions?: Feature[];
  initialPermissionPreset?: PermissionPreset;
  createdAt?: string;
}

export interface AccessRequestInput {
  email: string;
  fullName: string;
  tradingExperience: TradingExperience;
  reason: string;
}

export type Feature =
  | 'dashboard'
  | 'ai_screener'
  | 'ai_screener_pipeline'
  | 'filter_screener'
  | 'filter_high_upside'
  | 'filter_undervalued'
  | 'suggestions'
  | 'open_trades'
  | 'trade_history'
  | 'trade_assistant'
  | 'trade_reviewer';

export type PermissionPreset =
  | 'FULL_ACCESS'
  | 'DASHBOARD_ONLY'
  | 'SCREENING_ONLY'
  | 'TRADING_ONLY'
  | 'BASIC'
  | 'CUSTOM';

export interface FeatureInfo {
  id: Feature;
  name: string;
  description: string;
  icon: string;
  category: string;
  route: string;
  parent?: Feature;
}

export const FEATURES: Record<string, Feature> = {
  DASHBOARD: 'dashboard',
  AI_SCREENER: 'ai_screener',
  AI_SCREENER_PIPELINE: 'ai_screener_pipeline',
  FILTER_SCREENER: 'filter_screener',
  FILTER_HIGH_UPSIDE: 'filter_high_upside',
  FILTER_UNDERVALUED: 'filter_undervalued',
  SUGGESTIONS: 'suggestions',
  OPEN_TRADES: 'open_trades',
  TRADE_HISTORY: 'trade_history',
  TRADE_ASSISTANT: 'trade_assistant',
  TRADE_REVIEWER: 'trade_reviewer',
} as const;

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

export const PERMISSION_PRESETS: Record<PermissionPreset, Feature[]> = {
  FULL_ACCESS: Object.values(FEATURES),
  DASHBOARD_ONLY: ['dashboard'],
  SCREENING_ONLY: [
    'dashboard',
    'ai_screener',
    'ai_screener_pipeline',
    'filter_screener',
    'filter_high_upside',
    'filter_undervalued',
  ],
  TRADING_ONLY: ['dashboard', 'suggestions', 'open_trades', 'trade_history'],
  BASIC: ['dashboard', 'ai_screener', 'open_trades', 'trade_history'],
  CUSTOM: [],
};

export const TRADING_EXPERIENCE_OPTIONS: { value: TradingExperience; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner (< 1 year)' },
  { value: 'INTERMEDIATE', label: 'Intermediate (1-3 years)' },
  { value: 'ADVANCED', label: 'Advanced (3-5 years)' },
  { value: 'PROFESSIONAL', label: 'Professional (5+ years)' },
];

export interface ScreeningParameters {
  id: string;
  method1MinPrice: number;
  method1MaxPrice: number;
  method1MinVolume: number;
  method1MinATRPercent: number;
  method1MaxSpread: number;
  method2MaxRiskPercent: number;
  method2MaxVIX: number;
  method2MinSetupQuality: string;
  method2MinRiskReward: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  todayScreenedStocks: number;
  todayTrades: number;
  systemHealth: 'healthy' | 'degraded' | 'down';
}
