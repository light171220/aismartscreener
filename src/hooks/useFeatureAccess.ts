import { useUserAccess } from './useUserAccess';
import { useAuth } from './useAuth';

export const FEATURE_IDS = [
  'dashboard',
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
] as const;

export type FeatureId = typeof FEATURE_IDS[number];

export const FEATURE_LABELS: Record<FeatureId, string> = {
  dashboard: 'Dashboard',
  ai_screener: 'AI Screener Results',
  ai_screener_pipeline: 'Pipeline View',
  filter_screener: 'Filter Screener',
  filter_high_upside: 'High Upside Stocks',
  filter_undervalued: 'Undervalued Stocks',
  suggestions: 'Trade Suggestions',
  open_trades: 'Open Trades',
  trade_history: 'Trade History',
  trade_assistant: 'Trade Assistant',
  trade_reviewer: 'Trade Reviewer',
};

export const PERMISSION_PRESETS: Record<string, FeatureId[]> = {
  FULL_ACCESS: [...FEATURE_IDS],
  DASHBOARD_ONLY: ['dashboard'],
  SCREENING_ONLY: ['dashboard', 'ai_screener', 'ai_screener_pipeline', 'filter_screener', 'filter_high_upside', 'filter_undervalued'],
  TRADING_ONLY: ['dashboard', 'suggestions', 'open_trades', 'trade_history'],
  BASIC: ['dashboard', 'ai_screener', 'open_trades', 'trade_history'],
  CUSTOM: [],
};

export function useFeatureAccess() {
  const { userAccess, isLoading: accessLoading } = useUserAccess();
  const { isAdmin: cognitoAdmin, isLoading: authLoading } = useAuth();

  const isLoading = accessLoading || authLoading;

  const hasFeature = (feature: FeatureId): boolean => {
    if (cognitoAdmin) {
      return true;
    }

    if (!userAccess) {
      return false;
    }

    if (userAccess.role === 'ADMIN') {
      return true;
    }

    if (feature === 'dashboard') {
      return true;
    }

    return userAccess.permissions?.includes(feature) ?? false;
  };

  const availableFeatures = FEATURE_IDS.filter((f) => hasFeature(f));

  const canAccessRoute = (route: string): boolean => {
    const routeToFeature: Record<string, FeatureId> = {
      '/app': 'dashboard',
      '/app/ai-screener': 'ai_screener',
      '/app/ai-screener/pipeline': 'ai_screener_pipeline',
      '/app/filter-screener': 'filter_screener',
      '/app/filter-screener/high-upside': 'filter_high_upside',
      '/app/filter-screener/undervalued': 'filter_undervalued',
      '/app/suggestions': 'suggestions',
      '/app/trades': 'open_trades',
      '/app/history': 'trade_history',
      '/app/assistant': 'trade_assistant',
      '/app/reviewer': 'trade_reviewer',
    };

    const feature = routeToFeature[route];
    if (!feature) return true;
    
    return hasFeature(feature);
  };

  return {
    hasFeature,
    availableFeatures,
    canAccessRoute,
    isLoading,
    permissions: userAccess?.permissions || [],
    userRole: userAccess?.role,
    isCognitoAdmin: cognitoAdmin,
  };
}
