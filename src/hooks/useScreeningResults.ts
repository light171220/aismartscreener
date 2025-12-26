import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type SetupType = 'VWAP_RECLAIM' | 'VWAP_REJECTION' | 'ORB_BREAKOUT' | 'HRV_PULLBACK' | 'TREND_CONTINUATION' | 'GAP_AND_GO';
export type SetupQuality = 'A_PLUS' | 'A' | 'B' | 'C';
export type CatalystType = 'EARNINGS' | 'ANALYST_UPGRADE' | 'ANALYST_DOWNGRADE' | 'SECTOR_MOMENTUM' | 'MACRO_SYMPATHY' | 'NEWS_FDA' | 'NEWS_GUIDANCE' | 'NEWS_CONTRACT' | 'NEWS_MA' | 'OTHER';
export type MarketTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface AIScreeningResult {
  id: string;
  ticker: string;
  companyName?: string;
  currentPrice: number;
  changePercent: number;
  setupType?: SetupType;
  setupQuality?: SetupQuality;
  catalystType?: CatalystType;
  catalystDescription?: string;
  suggestedEntry?: number;
  suggestedStop?: number;
  suggestedTarget1?: number;
  suggestedTarget2?: number;
  riskRewardRatio?: number;
  spyTrend?: MarketTrend;
  qqqTrend?: MarketTrend;
  inMethod1: boolean;
  inMethod2: boolean;
  inBothMethods: boolean;
  method1StockId?: string;
  method2StockId?: string;
  priorityScore: number;
  screenDate: string;
  screenTime?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Method1Stock {
  id: string;
  ticker: string;
  companyName?: string;
  lastPrice: number;
  avgVolume: number;
  relativeVolume?: number;
  spread?: number;
  liquidityPassed?: boolean;
  atr?: number;
  atrPercent?: number;
  intradayRangePct?: number;
  volatilityPassed?: boolean;
  hasCatalyst?: boolean;
  catalystType?: CatalystType;
  catalystDescription?: string;
  catalystPassed?: boolean;
  aboveVWAP?: boolean;
  higherHighsLows?: boolean;
  marketAligned?: boolean;
  technicalSetupPassed?: boolean;
  vwap?: number;
  ema9?: number;
  ema20?: number;
  suggestedEntry?: number;
  suggestedStop?: number;
  target1?: number;
  target2?: number;
  passedMethod1: boolean;
  screenDate: string;
  screenTime?: string;
}

export interface Method2Stock {
  id: string;
  ticker: string;
  companyName?: string;
  lastPrice: number;
  avgVolume30D?: number;
  preMarketVolume?: number;
  volumeSpike?: number;
  atrPercent?: number;
  passedGate1: boolean;
  gate1Time?: string;
  vwap?: number;
  ema9?: number;
  ema20?: number;
  aboveVWAP?: boolean;
  aboveEMA9?: boolean;
  aboveEMA20?: boolean;
  relativeVolume?: number;
  spyTrend?: MarketTrend;
  qqqTrend?: MarketTrend;
  marketAligned?: boolean;
  passedGate2: boolean;
  gate2Time?: string;
  holdsAboveVWAP?: boolean;
  noRejectionWick?: boolean;
  volumeExpansion?: boolean;
  spyAgrees?: boolean;
  passedGate3: boolean;
  gate3Time?: string;
  riskPerShare?: number;
  maxShares?: number;
  riskCheckPassed?: boolean;
  vixLevel?: number;
  marketVolatilityOK?: boolean;
  passedGate4: boolean;
  gate4Time?: string;
  setupType?: SetupType;
  setupQuality?: SetupQuality;
  suggestedEntry?: number;
  suggestedStop?: number;
  suggestedTarget1?: number;
  suggestedTarget2?: number;
  riskRewardRatio?: number;
  passedAllGates: boolean;
  screenDate: string;
}

export const screeningKeys = {
  all: ['screening'] as const,
  results: (date?: string) => [...screeningKeys.all, 'results', date] as const,
  method1: (date?: string) => [...screeningKeys.all, 'method1', date] as const,
  method2: (date?: string) => [...screeningKeys.all, 'method2', date] as const,
  bothMethods: (date?: string) => [...screeningKeys.all, 'both', date] as const,
  byTicker: (ticker: string) => [...screeningKeys.all, 'ticker', ticker] as const,
};

export function useAIScreeningResults(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: screeningKeys.results(screenDate),
    queryFn: async (): Promise<AIScreeningResult[]> => {
      const response = await client.models.AIScreeningResult.list({
        filter: {
          screenDate: { eq: screenDate },
          isActive: { eq: true },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch screening results');
      }

      const results = (response.data || []) as unknown as AIScreeningResult[];
      return results.sort((a, b) => b.priorityScore - a.priorityScore);
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useBothMethodsResults(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: screeningKeys.bothMethods(screenDate),
    queryFn: async (): Promise<AIScreeningResult[]> => {
      const response = await client.models.AIScreeningResult.list({
        filter: {
          screenDate: { eq: screenDate },
          isActive: { eq: true },
          inBothMethods: { eq: true },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch results');
      }

      const results = (response.data || []) as unknown as AIScreeningResult[];
      return results.sort((a, b) => b.priorityScore - a.priorityScore);
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMethod1Stocks(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: screeningKeys.method1(screenDate),
    queryFn: async (): Promise<Method1Stock[]> => {
      const response = await client.models.Method1Stock.list({
        filter: { screenDate: { eq: screenDate } },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch Method 1 stocks');
      }

      return (response.data || []) as unknown as Method1Stock[];
    },
    staleTime: 60 * 1000,
  });
}

export function useMethod2Stocks(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: screeningKeys.method2(screenDate),
    queryFn: async (): Promise<Method2Stock[]> => {
      const response = await client.models.Method2Stock.list({
        filter: { screenDate: { eq: screenDate } },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch Method 2 stocks');
      }

      return (response.data || []) as unknown as Method2Stock[];
    },
    staleTime: 60 * 1000,
  });
}

export function usePipelineStats(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];
  const { data: method1Stocks = [] } = useMethod1Stocks(screenDate);
  const { data: method2Stocks = [] } = useMethod2Stocks(screenDate);
  const { data: results = [] } = useAIScreeningResults(screenDate);

  return useQuery({
    queryKey: [...screeningKeys.all, 'pipeline-stats', screenDate],
    queryFn: async () => {
      const m1LiquidityPassed = method1Stocks.filter(s => s.liquidityPassed).length;
      const m1VolatilityPassed = method1Stocks.filter(s => s.volatilityPassed).length;
      const m1CatalystPassed = method1Stocks.filter(s => s.catalystPassed).length;
      const m1TechnicalPassed = method1Stocks.filter(s => s.technicalSetupPassed).length;
      const m1FinalPassed = method1Stocks.filter(s => s.passedMethod1).length;

      const m2Gate1Passed = method2Stocks.filter(s => s.passedGate1).length;
      const m2Gate2Passed = method2Stocks.filter(s => s.passedGate2).length;
      const m2Gate3Passed = method2Stocks.filter(s => s.passedGate3).length;
      const m2Gate4Passed = method2Stocks.filter(s => s.passedGate4).length;
      const m2AllGatesPassed = method2Stocks.filter(s => s.passedAllGates).length;

      const inBothMethods = results.filter(r => r.inBothMethods).length;
      const inMethod1Only = results.filter(r => r.inMethod1 && !r.inMethod2).length;
      const inMethod2Only = results.filter(r => r.inMethod2 && !r.inMethod1).length;

      return {
        method1: {
          total: method1Stocks.length,
          liquidityPassed: m1LiquidityPassed,
          volatilityPassed: m1VolatilityPassed,
          catalystPassed: m1CatalystPassed,
          technicalPassed: m1TechnicalPassed,
          finalPassed: m1FinalPassed,
        },
        method2: {
          total: method2Stocks.length,
          gate1Passed: m2Gate1Passed,
          gate2Passed: m2Gate2Passed,
          gate3Passed: m2Gate3Passed,
          gate4Passed: m2Gate4Passed,
          allGatesPassed: m2AllGatesPassed,
        },
        intersection: {
          total: results.length,
          inBothMethods,
          inMethod1Only,
          inMethod2Only,
        },
      };
    },
    enabled: method1Stocks.length >= 0 && method2Stocks.length >= 0,
    staleTime: 60 * 1000,
  });
}

export function useRefreshScreeningResults() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: screeningKeys.all });
    },
  };
}
