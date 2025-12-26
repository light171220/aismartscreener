export interface Stock {
  ticker: string;
  companyName: string;
  lastPrice: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap?: number;
}

export type CatalystType =
  | 'EARNINGS'
  | 'ANALYST_UPGRADE'
  | 'ANALYST_DOWNGRADE'
  | 'SECTOR_MOMENTUM'
  | 'MACRO_SYMPATHY'
  | 'NEWS_FDA'
  | 'NEWS_GUIDANCE'
  | 'NEWS_CONTRACT'
  | 'NEWS_MA'
  | 'OTHER';

export type SetupType =
  | 'VWAP_RECLAIM'
  | 'VWAP_REJECTION'
  | 'ORB_BREAKOUT'
  | 'HRV_PULLBACK'
  | 'TREND_CONTINUATION'
  | 'GAP_AND_GO'
  | 'TREND_PULLBACK'
  | 'REVERSAL'
  | 'MOMENTUM'
  | 'OTHER';

export type SetupQuality = 'A_PLUS' | 'A' | 'B' | 'C';

export type MarketTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

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
  createdAt?: string;
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
  createdAt?: string;
}

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
  previousClose?: number;
  gapFromClose?: number;
  gapFromClosePercent?: number;
  priceRanges?: {
    days5: { low: number; high: number };
    days30: { low: number; high: number };
    weeks52: { low: number; high: number };
  };
  aiIdentifiedLevels?: {
    entryPrice: number;
    exitPrice: number;
    entryReason?: string;
    exitReason?: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    analysisFactors?: string[];
  };
}

export type ScreenType = 'HIGH_UPSIDE' | 'UNDERVALUED';

export type RatingType = 'SELL' | 'HOLD' | 'BUY' | 'STRONG_BUY';

export interface FilterCriteria {
  id: string;
  name: string;
  description?: string;
  minPrice: number;
  maxPrice: number;
  minUpsidePct?: number;
  maxUpsidePct?: number;
  minBelowLowTarget?: number;
  minAnalystCoverage: number;
  maxAnalystCoverage?: number;
  minRating: RatingType;
  minMarketCap: number;
  maxMarketCap: number;
  minAvgVolume?: number;
  minRelativeVolume?: number;
  aboveVWAP?: boolean;
  above50DMA?: boolean;
  above200DMA?: boolean;
  runTime: string;
  runDays: string[];
  autoRun: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface FilteredStock {
  id: string;
  ticker: string;
  companyName?: string;
  lastPrice: number;
  avgTargetPrice?: number;
  lowTargetPrice?: number;
  highTargetPrice?: number;
  upsidePct?: number;
  belowLowTargetPct?: number;
  analystCoverage?: number;
  buyRating?: string;
  marketCap?: number;
  avgVolume?: number;
  screenDate: string;
  criteriaId: string;
}

export interface SuggestedStock {
  id: string;
  ticker: string;
  companyName?: string;
  lastPrice: number;
  avgTargetPrice?: number;
  lowTargetPrice?: number;
  highTargetPrice?: number;
  analystCount?: number;
  avgRating?: string;
  upsidePct?: number;
  belowLowTargetPct?: number;
  screenDate: string;
  screenType: ScreenType;
  tradeTaken: boolean;
  tradeId?: string;
  createdAt?: string;
}
