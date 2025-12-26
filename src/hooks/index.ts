export { useAuth } from './useAuth';
export { useUserAccess } from './useUserAccess';
export type { UserAccess, AccessStatus, UserRole, PermissionPreset } from './useUserAccess';
export { useFeatureAccess, FEATURE_IDS, FEATURE_LABELS, PERMISSION_PRESETS } from './useFeatureAccess';
export type { FeatureId } from './useFeatureAccess';

export { useAccessRequest } from './useAccessRequest';
export type { AccessRequest, CreateAccessRequestInput, AccessRequestStatus, TradingExperience } from './useAccessRequest';

export { useAdminAccessRequests } from './useAdminAccessRequests';
export type { ApproveRequestInput, RejectRequestInput } from './useAdminAccessRequests';

export { useAdminUsers } from './useAdminUsers';
export type { UpdateUserInput, RevokeUserInput, RestoreUserInput } from './useAdminUsers';

export {
  useAIScreeningResults,
  useBothMethodsResults,
  useMethod1Stocks,
  useMethod2Stocks,
  usePipelineStats,
  useRefreshScreeningResults,
  screeningKeys,
} from './useScreeningResults';
export type {
  AIScreeningResult,
  Method1Stock,
  Method2Stock,
  SetupType,
  SetupQuality,
  CatalystType,
  MarketTrend,
} from './useScreeningResults';

export {
  useHighUpsideStocks,
  useUndervaluedStocks,
  useAllFilteredStocks,
  useFilteredStockByTicker,
  useRefreshFilteredStocks,
  filteredStockKeys,
} from './useFilteredStocks';
export type { FilteredStock } from './useFilteredStocks';

export {
  useOpenTrades,
  useClosedTrades,
  useTodayClosedTrades,
  useTradeStats,
  useTradeById,
  useCreateTrade,
  useUpdateTrade,
  useCloseTrade,
  useDeleteTrade,
  tradeKeys,
} from './useTrades';
export type { Trade, TradeInput, CloseTradeInput, TradeStats } from './useTrades';

export {
  useConversation,
  useTradeAssistant,
  useTradeReviewer,
  useConversationHistory,
  useConversationById,
  useDeleteConversation,
  useAnalyzeStock,
  conversationKeys,
} from './useConversation';
export type { Message, Conversation, ConversationType } from './useConversation';

export {
  useAggregates,
  usePreviousClose,
  useSnapshot,
  useSnapshotTicker,
  useTickerNews,
  useMarketStatus,
  useGainers,
  useLosers,
  polygonKeys,
} from './usePolygon';
