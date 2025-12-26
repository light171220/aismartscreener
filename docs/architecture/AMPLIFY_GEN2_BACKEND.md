# Amplify Gen 2 Backend Architecture

## 1. Overview

AWS Amplify Gen 2 provides a TypeScript-first, code-based approach to defining cloud infrastructure. This document details how our AI Smart Screener backend is structured using Amplify Gen 2.

## 2. Project Structure

```
aismartscreener/
├── amplify/
│   ├── auth/
│   │   └── resource.ts                    # Authentication configuration
│   ├── data/
│   │   └── resource.ts                    # Data models & AI routes
│   ├── storage/
│   │   └── resource.ts                    # S3 storage configuration
│   ├── functions/
│   │   ├── polygon-fetcher/
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── trade-calculator/
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   └── filter-screener/
│   │       ├── resource.ts
│   │       └── handler.ts
│   ├── jobs/                              # Scheduled & event-driven functions
│   │   │
│   │   │  # ═══ METHOD 1: Scanner-Based Screening ═══
│   │   ├── method1-step1-scan/            # 8:45 AM - Pre-market scan
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── method1-step2-news/            # 9:15 AM - AI news scoring
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── method1-step3-technical/       # 9:35 AM - Technical filter (LOCKS M1)
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   │
│   │   │  # ═══ METHOD 2: GATE System ═══
│   │   ├── method2-gate1/                 # 8:45 AM - Pre-market universe
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── method2-gate2/                 # 9:25 AM - Technical alignment
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── method2-gate3/                 # 9:35-11:00 AM every 5 min
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   ├── method2-gate4/                 # Event-driven (on Gate 3 pass)
│   │   │   ├── resource.ts
│   │   │   └── handler.ts
│   │   │
│   │   │  # ═══ INTERSECTION ═══
│   │   └── intersection-combiner/         # 9:35-11:00 AM every 5 min
│   │       ├── resource.ts
│   │       └── handler.ts
│   │
│   └── backend.ts                         # Main backend definition
├── src/                                   # React frontend
├── amplify_outputs.json                   # Generated config
└── package.json
```

## 3. Authentication Configuration

### amplify/auth/resource.ts
```typescript
import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'AI Smart Screener - Verify your email',
      verificationEmailBody: (createCode) =>
        `Your verification code is: ${createCode()}`,
      verificationEmailStyle: 'CODE',
    },
  },
  
  userAttributes: {
    preferredUsername: {
      required: true,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
  },
  
  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },
  
  accountRecovery: 'EMAIL_ONLY',
  
  groups: ['admin', 'trader', 'viewer'],
});
```

## 4. Data Schema & AI Routes

### amplify/data/resource.ts

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ════════════════════════════════════════════════════════════════════════════
  // AI SCREENING MODELS
  // ════════════════════════════════════════════════════════════════════════════
  
  // ──────────────────────────────────────────────────────────────────────────
  // METHOD 1: Scanner-Based Screening Results
  // ──────────────────────────────────────────────────────────────────────────
  Method1Stock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      
      // Liquidity Checks
      lastPrice: a.float().required(),
      avgVolume: a.float().required(),
      relativeVolume: a.float(),
      spread: a.float(),
      liquidityPassed: a.boolean(),
      
      // Volatility Checks
      atr: a.float(),
      atrPercent: a.float(),
      intradayRangePct: a.float(),
      volatilityPassed: a.boolean(),
      
      // Catalyst
      hasCatalyst: a.boolean(),
      catalystType: a.enum([
        'EARNINGS',
        'ANALYST_UPGRADE',
        'ANALYST_DOWNGRADE',
        'SECTOR_MOMENTUM',
        'MACRO_SYMPATHY',
        'NEWS_FDA',
        'NEWS_GUIDANCE',
        'NEWS_CONTRACT',
        'NEWS_MA',
        'OTHER'
      ]),
      catalystDescription: a.string(),
      catalystPassed: a.boolean(),
      
      // Technical Setup
      aboveVWAP: a.boolean(),
      higherHighsLows: a.boolean(),
      marketAligned: a.boolean(),
      technicalSetupPassed: a.boolean(),
      
      // Entry Levels
      vwap: a.float(),
      ema9: a.float(),
      ema20: a.float(),
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      target1: a.float(),
      target2: a.float(),
      
      // Overall Status
      passedMethod1: a.boolean().default(false),
      
      screenDate: a.date().required(),
      screenTime: a.string(),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('screenDate').sortKeys(['passedMethod1']),
    ])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // METHOD 2: GATE System Screening Results
  // ──────────────────────────────────────────────────────────────────────────
  Method2Stock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      
      // Gate 1 Data
      lastPrice: a.float().required(),
      avgVolume30D: a.float(),
      preMarketVolume: a.float(),
      volumeSpike: a.float(),
      atrPercent: a.float(),
      passedGate1: a.boolean().default(false),
      gate1Time: a.string(),
      
      // Gate 2 Data
      vwap: a.float(),
      ema9: a.float(),
      ema20: a.float(),
      aboveVWAP: a.boolean(),
      aboveEMA9: a.boolean(),
      aboveEMA20: a.boolean(),
      relativeVolume: a.float(),
      spyTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      qqqTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      marketAligned: a.boolean(),
      passedGate2: a.boolean().default(false),
      gate2Time: a.string(),
      
      // Gate 3 Data
      holdsAboveVWAP: a.boolean(),
      noRejectionWick: a.boolean(),
      volumeExpansion: a.boolean(),
      spyAgrees: a.boolean(),
      passedGate3: a.boolean().default(false),
      gate3Time: a.string(),
      
      // Gate 4 Data
      riskPerShare: a.float(),
      maxShares: a.integer(),
      riskCheckPassed: a.boolean(),
      vixLevel: a.float(),
      marketVolatilityOK: a.boolean(),
      passedGate4: a.boolean().default(false),
      gate4Time: a.string(),
      
      // Setup Info
      setupType: a.enum([
        'VWAP_RECLAIM',
        'VWAP_REJECTION',
        'ORB_BREAKOUT',
        'HRV_PULLBACK',
        'TREND_CONTINUATION',
        'GAP_AND_GO',
      ]),
      setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
      
      // Entry Levels
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      suggestedTarget1: a.float(),
      suggestedTarget2: a.float(),
      riskRewardRatio: a.float(),
      
      // Overall Status
      passedMethod2: a.boolean().default(false),
      
      screenDate: a.date().required(),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('screenDate').sortKeys(['passedMethod2']),
    ])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // AI SCREENING RESULT: Intersection of Method 1 & Method 2
  // ──────────────────────────────────────────────────────────────────────────
  AIScreeningResult: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      
      // Method References
      method1StockId: a.string().required(),
      method2StockId: a.string().required(),
      
      // Combined Status
      passedMethod1: a.boolean().default(true),
      passedMethod2: a.boolean().default(true),
      passedBothMethods: a.boolean().default(true),
      
      // Best Values from Both Methods
      currentPrice: a.float().required(),
      changePercent: a.float(),
      vwap: a.float(),
      
      // ═══════════════════════════════════════════════════════════════
      // LAST CLOSING PRICE (Planned)
      // Source: Polygon API /v2/aggs/ticker/{ticker}/prev
      // ═══════════════════════════════════════════════════════════════
      previousClose: a.float(),              // Previous day's closing price
      gapFromClose: a.float(),               // currentPrice - previousClose
      gapFromClosePercent: a.float(),        // ((current - prev) / prev) * 100
      
      // ═══════════════════════════════════════════════════════════════
      // PRICE RANGES (Planned)
      // Source: Polygon API /v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}
      // ═══════════════════════════════════════════════════════════════
      priceRange5DLow: a.float(),            // 5-day low price
      priceRange5DHigh: a.float(),           // 5-day high price
      priceRange30DLow: a.float(),           // 30-day low price
      priceRange30DHigh: a.float(),          // 30-day high price
      priceRange52WLow: a.float(),           // 52-week low price
      priceRange52WHigh: a.float(),          // 52-week high price
      
      // ═══════════════════════════════════════════════════════════════
      // AI-IDENTIFIED ENTRY & EXIT PRICES (Planned)
      // Source: AI analysis in method1-step3-technical or method2-gate3
      // ═══════════════════════════════════════════════════════════════
      aiEntryPrice: a.float(),               // AI-identified optimal entry
      aiExitPrice: a.float(),                // AI-identified target exit
      aiEntryReason: a.string(),             // e.g., "VWAP support + 9 EMA bounce"
      aiExitReason: a.string(),              // e.g., "52-week high resistance"
      aiConfidence: a.enum(['HIGH', 'MEDIUM', 'LOW']),
      aiAnalysisFactors: a.string().array(), // Factors considered
      
      // Setup (from Method 2 GATE system)
      setupType: a.enum([
        'VWAP_RECLAIM',
        'VWAP_REJECTION',
        'ORB_BREAKOUT',
        'HRV_PULLBACK',
        'TREND_CONTINUATION',
        'GAP_AND_GO',
      ]),
      setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
      
      // Catalyst (from Method 1)
      catalystType: a.string(),
      catalystDescription: a.string(),
      
      // Entry Levels (consensus from both) - IMPLEMENTED
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      suggestedTarget1: a.float(),           // Used to calculate avgTargetPrice
      suggestedTarget2: a.float(),           // Used to calculate avgTargetPrice
      riskRewardRatio: a.float(),
      // Note: avgTargetPrice = (target1 + target2) / 2 (calculated in UI)
      // Note: growthPercent = ((avgTarget - currentPrice) / currentPrice) * 100
      
      // Risk Info
      riskPerShare: a.float(),
      maxShares: a.integer(),
      
      // Market Context
      spyTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      qqqTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      vixLevel: a.float(),
      
      // Status
      isActive: a.boolean().default(true),
      alertSentAt: a.datetime(),
      
      screenDate: a.date().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('screenDate').sortKeys(['setupQuality']),
      index('isActive'),
    ])
    .authorization((allow) => [allow.authenticated()]),
  
  // ════════════════════════════════════════════════════════════════════════════
  // FILTER SCREENING MODELS
  // ════════════════════════════════════════════════════════════════════════════
  
  // ──────────────────────────────────────────────────────────────────────────
  // Filter Criteria (User-defined screening rules)
  // ──────────────────────────────────────────────────────────────────────────
  FilterCriteria: a
    .model({
      name: a.string().required(),
      description: a.string(),
      minPrice: a.float().default(2.5),
      maxPrice: a.float().default(60),
      minUpsidePct: a.float(),
      minBelowLowTarget: a.float(),
      minAnalystCoverage: a.integer().default(3),
      maxAnalystCoverage: a.integer(),
      minRating: a.enum(['SELL', 'HOLD', 'BUY', 'STRONG_BUY']).default('HOLD'),
      minMarketCap: a.float().default(1_000_000_000),
      maxMarketCap: a.float().default(1_500_000_000),
      minAvgVolume: a.integer(),
      minRelativeVolume: a.float(),
      aboveVWAP: a.boolean(),
      above50DMA: a.boolean(),
      above200DMA: a.boolean(),
      runTime: a.string().default('09:00'),
      runDays: a.string().array(),
      autoRun: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner()]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // Filtered Stock (Results from filter screening)
  // ──────────────────────────────────────────────────────────────────────────
  FilteredStock: a
    .model({
      ticker: a.string().required(),
      companyName: a.string(),
      lastPrice: a.float().required(),
      avgTargetPrice: a.float(),
      lowTargetPrice: a.float(),
      highTargetPrice: a.float(),
      upsidePct: a.float(),
      belowLowTargetPct: a.float(),
      analystCoverage: a.integer(),
      buyRating: a.string(),
      marketCap: a.float(),
      avgVolume: a.integer(),
      screenDate: a.date().required(),
      criteriaId: a.string().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),
  
  // ════════════════════════════════════════════════════════════════════════════
  // TRADE MANAGEMENT MODELS
  // ════════════════════════════════════════════════════════════════════════════
  
  // ──────────────────────────────────────────────────────────────────────────
  // Suggested Stock (From 2 filter methods: High Upside & Undervalued)
  // ──────────────────────────────────────────────────────────────────────────
  SuggestedStock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      
      // Current price
      lastPrice: a.float().required(),
      
      // Analyst data
      avgTargetPrice: a.float(),
      lowTargetPrice: a.float(),
      highTargetPrice: a.float(),
      analystCount: a.integer(),
      avgRating: a.string(), // SELL, HOLD, BUY, STRONG_BUY
      
      // Calculated
      upsidePct: a.float(),         // % to avg target (Method 1)
      belowLowTargetPct: a.float(), // % below low target (Method 2)
      
      // Screening info
      screenDate: a.date().required(),
      screenType: a.enum(['HIGH_UPSIDE', 'UNDERVALUED']),
      
      // Tracking
      tradeTaken: a.boolean().default(false),
      tradeId: a.string(),
      
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // Trade (User's logged trades - manual journaling)
  // ──────────────────────────────────────────────────────────────────────────
  Trade: a
    .model({
      id: a.id().required(),
      
      // Core trade info
      ticker: a.string().required(),
      quantity: a.integer().required(),
      
      // Entry (required when logging)
      buyPrice: a.float().required(),
      buyDate: a.date().required(),
      
      // Exit (filled when closing)
      sellPrice: a.float(),
      sellDate: a.date(),
      
      // Status
      status: a.enum(['OPEN', 'CLOSED']).default('OPEN'),
      
      // Calculated on close
      profit: a.float(),      // (sellPrice - buyPrice) * quantity
      profitPct: a.float(),   // percentage gain/loss
      
      // Risk management (optional)
      stopLoss: a.float(),
      targetPrice: a.float(),
      
      // Classification
      tradeType: a.enum(['SWING', 'DAY', 'POSITION', 'SCALP', 'OTHER']),
      setupType: a.string(), // e.g., "VWAP_RECLAIM", "ORB", "PULLBACK"
      
      // Source tracking
      screenSource: a.enum(['HIGH_UPSIDE', 'UNDERVALUED', 'AI_SCREENER', 'MANUAL']),
      suggestedStockId: a.string(),
      
      // Broker info (optional)
      brokerName: a.string(),
      
      // Notes
      entryNotes: a.string(),
      exitNotes: a.string(),
      
      // Owner
      owner: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // Trade History (Closed trades for analytics)
  // ──────────────────────────────────────────────────────────────────────────
  TradeHistory: a
    .model({
      userId: a.string().required(),
      ticker: a.string().required(),
      quantity: a.integer().required(),
      buyPrice: a.float().required(),
      buyDate: a.date().required(),
      sellPrice: a.float().required(),
      sellDate: a.date().required(),
      profit: a.float().required(),
      profitPct: a.float().required(),
      rMultiple: a.float(), // Risk multiple (profit / risk)
      setupType: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
  
  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN & ACCESS CONTROL MODELS
  // ════════════════════════════════════════════════════════════════════════════
  
  // ──────────────────────────────────────────────────────────────────────────
  // User Access (Approved users with permissions)
  // ──────────────────────────────────────────────────────────────────────────
  UserAccess: a
    .model({
      id: a.id().required(),
      
      // User Identity
      cognitoUserId: a.string().required(),
      email: a.string().required(),
      fullName: a.string().required(),
      
      // Access Control
      accessStatus: a.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).default('ACTIVE'),
      role: a.enum(['USER', 'ADMIN']).default('USER'),
      
      // Feature Permissions
      permissions: a.string().array().default([
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
  
  // ──────────────────────────────────────────────────────────────────────────
  // Access Request (Pending requests from visitors)
  // ──────────────────────────────────────────────────────────────────────────
  AccessRequest: a
    .model({
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
  
  // ──────────────────────────────────────────────────────────────────────────
  // Screening Parameters (Admin-configurable screening values)
  // ──────────────────────────────────────────────────────────────────────────
  ScreeningParameters: a
    .model({
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
  
  // ════════════════════════════════════════════════════════════════════════════
  // UTILITY MODELS
  // ════════════════════════════════════════════════════════════════════════════
  
  // ──────────────────────────────────────────────────────────────────────────
  // Legacy Screened Stock (for backwards compatibility)
  // ──────────────────────────────────────────────────────────────────────────
  ScreenedStock: a
    .model({
      ticker: a.string().required(),
      companyName: a.string(),
      lastPrice: a.float(),
      avgTargetPrice: a.float(),
      lowTargetPrice: a.float(),
      highTargetPrice: a.float(),
      upsidePct: a.float(),
      analystCoverage: a.integer(),
      buyRating: a.string(),
      marketCap: a.float(),
      relativeVolume: a.float(),
      preMarketVolume: a.integer(),
      gapPercent: a.float(),
      atr: a.float(),
      catalyst: a.string(),
      screenType: a.enum(['AI_SCREENER', 'FILTER_SCREENER', 'COMBINED']),
      screenTime: a.enum(['PREMARKET_845', 'NEWS_915', 'TECHNICAL_935']),
      screenDate: a.date().required(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete', 'read']),
    ]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // Screening History (Track suggestions over time)
  // ──────────────────────────────────────────────────────────────────────────
  ScreeningHistory: a
    .model({
      ticker: a.string().required(),
      screenDate: a.date().required(),
      screenTime: a.string().required(),
      suggested845: a.boolean(),
      suggested915: a.boolean(),
      suggested935: a.boolean(),
      dayLow: a.float(),
      dayHigh: a.float(),
      fiveDayLow: a.float(),
      fiveDayHigh: a.float(),
      threeMonthLow: a.float(),
      threeMonthHigh: a.float(),
      sixMonthLow: a.float(),
      sixMonthHigh: a.float(),
      oneYearLow: a.float(),
      oneYearHigh: a.float(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete', 'read']),
    ]),
  
  // ──────────────────────────────────────────────────────────────────────────
  // User Preferences (Personalized screening settings)
  // ──────────────────────────────────────────────────────────────────────────
  UserPreferences: a
    .model({
      minMarketCap: a.float(),
      maxMarketCap: a.float(),
      minPrice: a.float(),
      maxPrice: a.float(),
      minAnalystCoverage: a.integer(),
      preferredRatings: a.string().array(),
      riskPerTrade: a.float(),
      preferredSetups: a.string().array(),
    })
    .authorization((allow) => [allow.owner()]),
  
  // ════════════════════════════════════════════════════════════════════════════
  // CUSTOM QUERIES
  // ════════════════════════════════════════════════════════════════════════════
  
  // Query to get stock data from Polygon
  getStockData: a
    .query()
    .arguments({
      ticker: a.string().required(),
      startDate: a.string(),
      endDate: a.string(),
    })
    .returns(a.json())
    .handler(a.handler.function('polygonFetcher'))
    .authorization((allow) => [allow.authenticated()]),
  
  // Query to get user's open trades
  getOpenTrades: a
    .query()
    .arguments({})
    .returns(a.ref('Trade').array())
    .handler(a.handler.function('tradeCalculator'))
    .authorization((allow) => [allow.authenticated()]),
  
  // Custom query for on-demand filter screening
  runFilterScreen: a
    .query()
    .arguments({
      criteriaId: a.string().required(),
    })
    .returns(a.ref('FilteredStock').array())
    .handler(a.handler.function('filterScreener'))
    .authorization((allow) => [allow.authenticated()]),
  
  // ════════════════════════════════════════════════════════════════════════════
  // AI ROUTES - CONVERSATION
  // ════════════════════════════════════════════════════════════════════════════
  
  // Main chat assistant for trade analysis
  tradeAssistant: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are an expert day trading assistant specializing in US equities.
    
Your role is to:
1. Analyze stocks based on technical and fundamental criteria
2. Evaluate trade setups for quality (A+, B, C grades)
3. Help users validate entry, stop-loss, and target levels
4. Review past trades and identify patterns
5. Provide market context (SPY/QQQ trend, sector strength)

Always consider:
- Risk management (max 0.5-1% account risk per trade)
- Setup quality (VWAP, ORB, pullback patterns)
- Market conditions (trending, consolidating, ranging)
- Volume confirmation
- Time of day (best setups 9:35-11:00 AM ET)

Be direct, specific, and actionable. Avoid generic advice.`,
    
    tools: [
      a.ai.dataTool({
        name: 'getScreenedStocks',
        description: 'Get the latest AI-screened stocks for today',
        model: a.ref('AIScreeningResult'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getMethod1Stocks',
        description: 'Get stocks that passed Method 1 scanner',
        model: a.ref('Method1Stock'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getMethod2Stocks',
        description: 'Get stocks that passed Method 2 GATE system',
        model: a.ref('Method2Stock'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getUserTrades',
        description: 'Get user\'s current open trades',
        model: a.ref('Trade'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getTradeHistory',
        description: 'Get user\'s past closed trades for analysis',
        model: a.ref('TradeHistory'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getSuggestions',
        description: 'Get stock suggestions from filter screening',
        model: a.ref('SuggestedStock'),
        modelOperation: 'list',
      }),
    ],
  })
  .authorization((allow) => allow.owner()),
  
  // Post-trade review assistant
  tradeReviewer: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a trading performance coach. Analyze completed trades to:
    
1. Evaluate setup quality (was it A+ quality?)
2. Assess execution quality (entry, exit, stop placement)
3. Identify one specific mistake to correct
4. Suggest one rule to reinforce tomorrow
5. Track emotional trading indicators

Use the DAILY SCORECARD metrics:
- Rule adherence: 100% goal
- Avg R per trade: ≥ +0.5R goal
- Win rate: 45-60% goal
- Overtrades: 0 goal
- Emotional trades: 0 goal

Be constructive but honest. Focus on process, not outcomes.`,
    
    tools: [
      a.ai.dataTool({
        name: 'getTradeHistory',
        model: a.ref('TradeHistory'),
        modelOperation: 'list',
      }),
    ],
  })
  .authorization((allow) => allow.owner()),
  
  // ════════════════════════════════════════════════════════════════════════════
  // AI ROUTES - GENERATION
  // ════════════════════════════════════════════════════════════════════════════
  
  // Generate stock screening based on filter criteria
  generateFilteredStocks: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a stock screening assistant. Given filter criteria, analyze and return stocks that match.
    
Format your response as a JSON array with these fields:
- ticker
- companyName  
- lastPrice
- avgTargetPrice
- upsidePct
- analystCoverage
- buyRating
- marketCap

Apply filters strictly. Only include stocks meeting ALL criteria.`,
  })
  .arguments({
    minUpsidePct: a.float(),
    minAnalystCoverage: a.integer(),
    minRating: a.string(),
    minMarketCap: a.float(),
    maxMarketCap: a.float(),
    minPrice: a.float(),
    maxPrice: a.float(),
  })
  .returns(a.json())
  .authorization((allow) => [allow.authenticated()]),
  
  // Generate trade validation
  validateTrade: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `Evaluate the proposed trade setup and return:
    
1. quality: "A+", "B", or "C"
2. marketAlignment: boolean (does SPY/QQQ agree?)
3. riskAssessment: description of risk level
4. invalidationPoints: what would invalidate this trade
5. recommendation: "PROCEED", "WAIT", or "SKIP"
6. reasoning: brief explanation`,
  })
  .arguments({
    ticker: a.string().required(),
    entryPrice: a.float().required(),
    stopLoss: a.float().required(),
    target: a.float().required(),
    setupType: a.string().required(),
    marketBias: a.string(),
  })
  .returns(a.json())
  .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
```

## 5. Scheduled Functions (Cron Jobs)

### Dual-Method Timing Overview

The AI Screening uses **TWO PARALLEL METHODS** that run simultaneously. See `features/AI_SCREENING.md` for complete details.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAMBDA FUNCTION SCHEDULE (ET → UTC)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  METHOD 1 (Scanner-Based)              METHOD 2 (GATE System)               │
│  ═══════════════════════════          ════════════════════════════          │
│                                                                              │
│  8:45 AM  → method1-step1-scan         8:45 AM  → method2-gate1             │
│  9:15 AM  → method1-step2-news         9:25 AM  → method2-gate2             │
│  9:35 AM  → method1-step3-technical    9:35 AM  → method2-gate3 (START)     │
│           ⚠️ COMPLETES & LOCKS         9:40 AM  → method2-gate3             │
│                                        9:45 AM  → method2-gate3             │
│                                        ...every 5 min...                    │
│                                        11:00 AM → method2-gate3 (FINAL)     │
│                                        On Pass  → method2-gate4 (event)     │
│                                                                              │
│  INTERSECTION runs after each Gate 3 pass to find common stocks             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 METHOD 1 Functions

#### amplify/jobs/method1-step1-scan/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const method1Step1Scan = defineFunction({
  name: 'method1-step1-scan',
  entry: './handler.ts',
  // 8:45 AM ET = 12:45 UTC (EST) or 13:45 UTC (EDT)
  schedule: 'cron(45 12 ? * MON-FRI *)',
  timeoutSeconds: 300,
  memoryMB: 512,
  environment: {
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
  },
});
```

#### amplify/jobs/method1-step2-news/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const method1Step2News = defineFunction({
  name: 'method1-step2-news',
  entry: './handler.ts',
  // 9:15 AM ET = 13:15 UTC (EST) or 14:15 UTC (EDT)
  schedule: 'cron(15 13 ? * MON-FRI *)',
  timeoutSeconds: 300,
  memoryMB: 512,
});
```

#### amplify/jobs/method1-step3-technical/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const method1Step3Technical = defineFunction({
  name: 'method1-step3-technical',
  entry: './handler.ts',
  // 9:35 AM ET = 13:35 UTC (EST) or 14:35 UTC (EDT)
  // ⚠️ THIS IS THE FINAL METHOD 1 RUN - Results are LOCKED after this
  schedule: 'cron(35 13 ? * MON-FRI *)',
  timeoutSeconds: 300,
  memoryMB: 512,
});
```

### 5.2 METHOD 2 Functions (GATE System)

#### amplify/jobs/method2-gate1/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const method2Gate1 = defineFunction({
  name: 'method2-gate1',
  entry: './handler.ts',
  // 8:45 AM ET - Pre-Market Universe Builder (06:00-09:00 window)
  schedule: 'cron(45 12 ? * MON-FRI *)',
  timeoutSeconds: 300,
  memoryMB: 512,
  environment: {
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
  },
});
```

#### amplify/jobs/method2-gate2/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const method2Gate2 = defineFunction({
  name: 'method2-gate2',
  entry: './handler.ts',
  // 9:25 AM ET - Technical Alignment Screener
  schedule: 'cron(25 13 ? * MON-FRI *)',
  timeoutSeconds: 300,
  memoryMB: 512,
});
```

#### amplify/jobs/method2-gate3/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

// Gate 3 runs every 5 minutes from 9:35 AM to 11:00 AM ET (17 total runs)
// This requires multiple cron expressions

export const method2Gate3 = defineFunction({
  name: 'method2-gate3',
  entry: './handler.ts',
  // Combined schedule for 9:35-11:00 AM ET every 5 minutes
  // Using EventBridge rule with multiple cron expressions
  schedule: [
    'cron(35,40,45,50,55 13 ? * MON-FRI *)',  // 9:35-9:55 AM
    'cron(0,5,10,15,20,25,30,35,40,45,50,55 14 ? * MON-FRI *)',  // 10:00-10:55 AM
    'cron(0 15 ? * MON-FRI *)',  // 11:00 AM
  ],
  timeoutSeconds: 180,
  memoryMB: 512,
});
```

#### amplify/jobs/method2-gate4/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

// Gate 4 is EVENT-DRIVEN, triggered when a stock passes Gate 3
// Not scheduled - invoked by Gate 3 function

export const method2Gate4 = defineFunction({
  name: 'method2-gate4',
  entry: './handler.ts',
  // No schedule - triggered by method2-gate3
  timeoutSeconds: 60,
  memoryMB: 256,
});
```

### 5.3 Intersection Combiner Function

#### amplify/jobs/intersection-combiner/resource.ts
```typescript
import { defineFunction } from '@aws-amplify/backend';

// Runs after each Gate 3 pass to find common stocks from both methods
// Also triggered at 9:35 AM when Method 1 completes

export const intersectionCombiner = defineFunction({
  name: 'intersection-combiner',
  entry: './handler.ts',
  // Runs same schedule as Gate 3
  schedule: [
    'cron(35,40,45,50,55 13 ? * MON-FRI *)',
    'cron(0,5,10,15,20,25,30,35,40,45,50,55 14 ? * MON-FRI *)',
    'cron(0 15 ? * MON-FRI *)',
  ],
  timeoutSeconds: 120,
  memoryMB: 256,
});
```

### 5.4 Lambda Schedule Reference Table

| Function | ET Time | UTC Cron | Runs | Description |
|----------|---------|----------|------|-------------|
| `method1-step1-scan` | 8:45 AM | `45 12 ? * MON-FRI` | Once | Pre-market scan (vol, gap, ATR, news) |
| `method1-step2-news` | 9:15 AM | `15 13 ? * MON-FRI` | Once | AI news scoring |
| `method1-step3-technical` | 9:35 AM | `35 13 ? * MON-FRI` | Once | Technical filter (VWAP/ORB/HRV) **LOCKS M1** |
| `method2-gate1` | 8:45 AM | `45 12 ? * MON-FRI` | Once | Gate 1: Pre-market universe |
| `method2-gate2` | 9:25 AM | `25 13 ? * MON-FRI` | Once | Gate 2: Technical alignment |
| `method2-gate3` | 9:35-11:00 AM | Every 5 min | 17× | Gate 3: Execution filter |
| `method2-gate4` | On G3 pass | Event-driven | Per stock | Gate 4: Risk validation |
| `intersection-combiner` | 9:35-11:00 AM | Every 5 min | 17× | Find common stocks |

**Note:** UTC times assume EST (UTC-5). During EDT (UTC-4), add 1 hour to UTC times.

## 6. Backend Entry Point

### amplify/backend.ts
```typescript
import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

// Method 1 Functions
import { method1Step1Scan } from './jobs/method1-step1-scan/resource';
import { method1Step2News } from './jobs/method1-step2-news/resource';
import { method1Step3Technical } from './jobs/method1-step3-technical/resource';

// Method 2 Functions (GATE System)
import { method2Gate1 } from './jobs/method2-gate1/resource';
import { method2Gate2 } from './jobs/method2-gate2/resource';
import { method2Gate3 } from './jobs/method2-gate3/resource';
import { method2Gate4 } from './jobs/method2-gate4/resource';

// Intersection Combiner
import { intersectionCombiner } from './jobs/intersection-combiner/resource';

// Utility Functions
import { filterScreener } from './functions/filter-screener/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  
  // Method 1: Scanner-Based Screening
  method1Step1Scan,      // 8:45 AM - Pre-market scan
  method1Step2News,      // 9:15 AM - AI news scoring
  method1Step3Technical, // 9:35 AM - Technical filter (LOCKS M1)
  
  // Method 2: GATE System
  method2Gate1,          // 8:45 AM - Pre-market universe
  method2Gate2,          // 9:25 AM - Technical alignment
  method2Gate3,          // 9:35-11:00 AM every 5 min - Execution filter
  method2Gate4,          // Event-driven - Risk validation
  
  // Intersection
  intersectionCombiner,  // 9:35-11:00 AM every 5 min - Find common stocks
  
  // Utility
  filterScreener,        // On-demand filter screening
});

// Grant functions access to Polygon API secret
const polygonApiKey = backend.addEnvironment('POLYGON_API_KEY');

// Add Bedrock permissions to Lambda functions that use AI
const bedrockPolicy = new PolicyStatement({
  actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
  resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-*'],
});

// Method 1 functions that use AI
backend.method1Step1Scan.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.method1Step2News.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.method1Step3Technical.resources.lambda.addToRolePolicy(bedrockPolicy);

// Method 2 functions that use AI
backend.method2Gate1.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.method2Gate4.resources.lambda.addToRolePolicy(bedrockPolicy);

// Allow Gate 3 to invoke Gate 4
backend.method2Gate3.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [backend.method2Gate4.resources.lambda.functionArn],
  })
);
```

## 7. Data Model Summary

### Complete Model Reference

| Category | Model | Description |
|----------|-------|-------------|
| **AI Screening** | `Method1Stock` | Scanner-based screening results |
| | `Method2Stock` | GATE system screening results |
| | `AIScreeningResult` | Intersection of both methods (final) |
| **Filter Screening** | `FilterCriteria` | User-defined filter rules |
| | `FilteredStock` | Filter screening results |
| **Trade Management** | `SuggestedStock` | Suggestions from filter methods |
| | `Trade` | User's logged trades |
| | `TradeHistory` | Closed trades for analytics |
| **Admin** | `UserAccess` | User permissions & access |
| | `AccessRequest` | Pending access requests |
| | `ScreeningParameters` | Admin-configurable screening values |
| **Utility** | `ScreenedStock` | Legacy screening results |
| | `ScreeningHistory` | Historical tracking |
| | `UserPreferences` | User settings |

### AI Routes

| Type | Route | Description |
|------|-------|-------------|
| Conversation | `tradeAssistant` | Main chat for trade analysis |
| Conversation | `tradeReviewer` | Post-trade performance review |
| Generation | `generateFilteredStocks` | AI-powered stock filtering |
| Generation | `validateTrade` | Trade setup validation |

### Custom Queries

| Query | Handler | Description |
|-------|---------|-------------|
| `getStockData` | `polygonFetcher` | Fetch data from Polygon API |
| `getOpenTrades` | `tradeCalculator` | Get user's open positions |
| `runFilterScreen` | `filterScreener` | Run on-demand filter screening |

## 8. Real-Time Subscriptions

The Amplify Data layer automatically generates GraphQL subscriptions for all models:

```typescript
// Subscribe to new AI screening results
const subscription = client.models.AIScreeningResult.observeQuery({
  filter: {
    screenDate: { eq: today },
    isActive: { eq: true },
  },
}).subscribe({
  next: ({ items }) => {
    console.log('New AI screening results:', items);
  },
});

// Subscribe to Method 2 Gate 3 passes
const gate3Sub = client.models.Method2Stock.onCreate({
  filter: { passedGate3: { eq: true } },
}).subscribe({
  next: (stock) => {
    toast(`${stock.ticker} passed Gate 3!`);
  },
});
```

## 9. Environment Variables & Secrets

```bash
# Set secrets using Amplify CLI
npx ampx sandbox secret set POLYGON_API_KEY

# Environment variables in amplify/backend.ts
backend.addEnvironment('POLYGON_API_KEY');
```

## 10. Deployment

### Development (Sandbox)
```bash
npx ampx sandbox
```

### Production
```bash
# Connect to Git branch in Amplify Console
# Automatic deployment on push
```

## 11. Key Amplify Gen 2 Features Used

| Feature | Usage |
|---------|-------|
| TypeScript Backend | All infrastructure as code |
| Per-Developer Sandboxes | Isolated dev environments |
| AI Conversation Routes | Trade assistant chat |
| AI Generation Routes | Stock screening |
| Scheduled Functions | Time-based screeners |
| Real-time Subscriptions | Live updates |
| Owner Authorization | User-scoped data |
| Group Authorization | Admin-only access |
| Public API Key Auth | Access request submission |
| CDK Extension | Custom AWS resources |
