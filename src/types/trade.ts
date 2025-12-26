import type { SetupType, SetupQuality } from './stock';

export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export type TradeDirection = 'LONG' | 'SHORT';

export interface Trade {
  id: string;
  ticker: string;
  companyName?: string;
  direction: TradeDirection;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  stopLoss: number;
  targetPrice: number;
  target2Price?: number;
  setupType?: SetupType;
  setupQuality?: SetupQuality;
  entryNotes?: string;
  exitNotes?: string;
  status: TradeStatus;
  sellPrice?: number;
  sellDate?: string;
  profit?: number;
  profitPercent?: number;
  rMultiple?: number;
  currentPrice?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
  suggestedStockId?: string;
  screeningResultId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TradeInput {
  ticker: string;
  direction?: TradeDirection;
  quantity: number;
  buyPrice: number;
  buyDate?: string;
  stopLoss: number;
  targetPrice: number;
  target2Price?: number;
  setupType?: SetupType;
  entryNotes?: string;
  suggestedStockId?: string;
  screeningResultId?: string;
}

export interface CloseTradeInput {
  id: string;
  sellPrice: number;
  sellDate?: string;
  exitNotes?: string;
}

export interface TradeHistory {
  id: string;
  ticker: string;
  direction: TradeDirection;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  sellPrice: number;
  sellDate: string;
  stopLoss: number;
  targetPrice: number;
  profit: number;
  profitPercent: number;
  rMultiple: number;
  setupType?: SetupType;
  setupQuality?: SetupQuality;
  entryNotes?: string;
  exitNotes?: string;
  wasWinner: boolean;
  tradeId: string;
  userId?: string;
  createdAt?: string;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPL: number;
  avgWin: number;
  avgLoss: number;
  avgRMultiple: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  profitFactor: number;
}

export interface DailyStats {
  date: string;
  trades: number;
  wins: number;
  losses: number;
  netPL: number;
  cumulativePL: number;
}

export interface SetupStats {
  setupType: SetupType;
  trades: number;
  wins: number;
  winRate: number;
  avgRMultiple: number;
  totalPL: number;
}

export const SETUP_TYPES: { value: SetupType; label: string }[] = [
  { value: 'VWAP_RECLAIM', label: 'VWAP Reclaim' },
  { value: 'ORB_BREAKOUT', label: 'ORB Breakout' },
  { value: 'TREND_PULLBACK', label: 'Trend Pullback' },
  { value: 'GAP_AND_GO', label: 'Gap & Go' },
  { value: 'REVERSAL', label: 'Reversal' },
  { value: 'MOMENTUM', label: 'Momentum' },
  { value: 'HRV_PULLBACK', label: 'HRV Pullback' },
  { value: 'TREND_CONTINUATION', label: 'Trend Continuation' },
  { value: 'OTHER', label: 'Other' },
];

export const SETUP_QUALITIES: { value: SetupQuality; label: string }[] = [
  { value: 'A_PLUS', label: 'A+ (Perfect)' },
  { value: 'A', label: 'A (Excellent)' },
  { value: 'B', label: 'B (Good)' },
  { value: 'C', label: 'C (Fair)' },
];
