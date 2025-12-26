import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { filterScreener } from '../jobs/filter-screener/resource';
import { method1Screener } from '../jobs/method1-screener/resource';
import { method2Screener } from '../jobs/method2-screener/resource';
import { resultsCombiner } from '../jobs/results-combiner/resource';

const schema = a.schema({
  tradeAssistant: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are an expert day trading assistant specializing in momentum trading strategies. 
You help traders analyze stocks, identify setups, and make informed trading decisions.
You have access to Method 1 (liquidity + catalyst + technical setup) and Method 2 (4-gate system) screening methodologies.
Always emphasize risk management, proper position sizing, and discipline.
Provide specific entry, stop loss, and target levels when discussing trade setups.
Be concise but thorough in your analysis.`,
  })
  .authorization((allow) => allow.owner()),

  tradeReviewer: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a trading performance coach who reviews completed trades.
Analyze trade entries, exits, risk management, and emotional decisions.
Provide constructive feedback on what went well and areas for improvement.
Help identify patterns in trading behavior - both positive and negative.
Suggest specific improvements based on the trade data provided.
Be supportive but honest in your assessments.`,
  })
  .authorization((allow) => allow.owner()),

  analyzeStock: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `Analyze the given stock data and provide a structured trading analysis.
Include: setup quality rating, entry/exit points, risk assessment, and key catalysts.
Be specific with price levels and percentages.`,
  })
  .arguments({
    ticker: a.string().required(),
    priceData: a.json().required(),
    technicals: a.json(),
    news: a.string(),
  })
  .returns(
    a.customType({
      setupQuality: a.string(),
      entryPrice: a.float(),
      stopLoss: a.float(),
      target1: a.float(),
      target2: a.float(),
      riskRewardRatio: a.float(),
      analysis: a.string(),
      catalysts: a.string().array(),
      risks: a.string().array(),
    })
  )
  .authorization((allow) => [allow.authenticated()]),

  Method1Stock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      lastPrice: a.float().required(),
      avgVolume: a.float().required(),
      relativeVolume: a.float(),
      spread: a.float(),
      liquidityPassed: a.boolean(),
      atr: a.float(),
      atrPercent: a.float(),
      intradayRangePct: a.float(),
      volatilityPassed: a.boolean(),
      hasCatalyst: a.boolean(),
      catalystType: a.enum([
        'EARNINGS', 'ANALYST_UPGRADE', 'ANALYST_DOWNGRADE', 'SECTOR_MOMENTUM',
        'MACRO_SYMPATHY', 'NEWS_FDA', 'NEWS_GUIDANCE', 'NEWS_CONTRACT', 'NEWS_MA', 'OTHER'
      ]),
      catalystDescription: a.string(),
      catalystPassed: a.boolean(),
      aboveVWAP: a.boolean(),
      higherHighsLows: a.boolean(),
      marketAligned: a.boolean(),
      technicalSetupPassed: a.boolean(),
      vwap: a.float(),
      ema9: a.float(),
      ema20: a.float(),
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      target1: a.float(),
      target2: a.float(),
      passedMethod1: a.boolean().default(false),
      screenDate: a.date().required(),
      screenTime: a.string(),
    })
    .secondaryIndexes((index) => [index('screenDate')])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  Method2Stock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      lastPrice: a.float().required(),
      avgVolume30D: a.float(),
      preMarketVolume: a.float(),
      volumeSpike: a.float(),
      atrPercent: a.float(),
      passedGate1: a.boolean().default(false),
      gate1Time: a.string(),
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
      holdsAboveVWAP: a.boolean(),
      noRejectionWick: a.boolean(),
      volumeExpansion: a.boolean(),
      spyAgrees: a.boolean(),
      passedGate3: a.boolean().default(false),
      gate3Time: a.string(),
      riskPerShare: a.float(),
      maxShares: a.integer(),
      riskCheckPassed: a.boolean(),
      vixLevel: a.float(),
      marketVolatilityOK: a.boolean(),
      passedGate4: a.boolean().default(false),
      gate4Time: a.string(),
      setupType: a.enum([
        'VWAP_RECLAIM', 'VWAP_REJECTION', 'ORB_BREAKOUT',
        'HRV_PULLBACK', 'TREND_CONTINUATION', 'GAP_AND_GO'
      ]),
      setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      suggestedTarget1: a.float(),
      suggestedTarget2: a.float(),
      riskRewardRatio: a.float(),
      passedAllGates: a.boolean().default(false),
      screenDate: a.date().required(),
    })
    .secondaryIndexes((index) => [index('screenDate')])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  AIScreeningResult: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      currentPrice: a.float().required(),
      changePercent: a.float().required(),
      setupType: a.enum([
        'VWAP_RECLAIM', 'VWAP_REJECTION', 'ORB_BREAKOUT',
        'HRV_PULLBACK', 'TREND_CONTINUATION', 'GAP_AND_GO'
      ]),
      setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
      catalystType: a.enum([
        'EARNINGS', 'ANALYST_UPGRADE', 'ANALYST_DOWNGRADE', 'SECTOR_MOMENTUM',
        'MACRO_SYMPATHY', 'NEWS_FDA', 'NEWS_GUIDANCE', 'NEWS_CONTRACT', 'NEWS_MA', 'OTHER'
      ]),
      catalystDescription: a.string(),
      suggestedEntry: a.float(),
      suggestedStop: a.float(),
      suggestedTarget1: a.float(),
      suggestedTarget2: a.float(),
      riskRewardRatio: a.float(),
      spyTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      qqqTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
      inMethod1: a.boolean().required(),
      inMethod2: a.boolean().required(),
      inBothMethods: a.boolean().required(),
      method1StockId: a.string(),
      method2StockId: a.string(),
      priorityScore: a.integer().required(),
      screenDate: a.date().required(),
      screenTime: a.string(),
      isActive: a.boolean().default(true),
    })
    .secondaryIndexes((index) => [index('screenDate').sortKeys(['priorityScore'])])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  Trade: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      direction: a.string().required(),
      quantity: a.integer().required(),
      buyPrice: a.float().required(),
      buyDate: a.date().required(),
      stopLoss: a.float().required(),
      targetPrice: a.float().required(),
      target2Price: a.float(),
      setupType: a.string(),
      setupQuality: a.string(),
      entryNotes: a.string(),
      exitNotes: a.string(),
      status: a.string().required(),
      sellPrice: a.float(),
      sellDate: a.date(),
      profit: a.float(),
      profitPercent: a.float(),
      rMultiple: a.float(),
      suggestedStockId: a.string(),
      screeningResultId: a.string(),
    })
    .authorization((allow) => [allow.owner().to(['create', 'read', 'update', 'delete'])]),

  TradeHistory: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      direction: a.string().required(),
      quantity: a.integer().required(),
      buyPrice: a.float().required(),
      buyDate: a.date().required(),
      sellPrice: a.float().required(),
      sellDate: a.date().required(),
      stopLoss: a.float().required(),
      targetPrice: a.float().required(),
      profit: a.float().required(),
      profitPercent: a.float().required(),
      rMultiple: a.float().required(),
      setupType: a.string(),
      setupQuality: a.string(),
      entryNotes: a.string(),
      exitNotes: a.string(),
      wasWinner: a.boolean().required(),
      tradeId: a.string().required(),
    })
    .authorization((allow) => [allow.owner().to(['create', 'read', 'update', 'delete'])]),

  UserAccess: a
    .model({
      id: a.id().required(),
      ownerId: a.string().required(),
      email: a.string().required(),
      fullName: a.string(),
      role: a.enum(['ADMIN', 'TRADER', 'VIEWER']),
      accessStatus: a.enum(['PENDING', 'APPROVED', 'REJECTED', 'REVOKED']),
      permissions: a.string().array(),
      permissionPreset: a.enum(['FULL_ACCESS', 'DASHBOARD_ONLY', 'SCREENING_ONLY', 'TRADING_ONLY', 'BASIC', 'CUSTOM']),
      approvedAt: a.datetime(),
      approvedBy: a.string(),
      revokedAt: a.datetime(),
      revokedBy: a.string(),
      revokeReason: a.string(),
      expiresAt: a.datetime(),
      notes: a.string(),
    })
    .secondaryIndexes((index) => [index('ownerId'), index('email')])
    .authorization((allow) => [
      allow.ownerDefinedIn('ownerId').to(['read']),
      allow.group('admin').to(['create', 'read', 'update', 'delete']),
    ]),

  AccessRequest: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      email: a.string().required(),
      fullName: a.string().required(),
      tradingExperience: a.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
      reason: a.string().required(),
      status: a.enum(['PENDING', 'APPROVED', 'REJECTED']),
      reviewedAt: a.datetime(),
      reviewedBy: a.string(),
      reviewNotes: a.string(),
    })
    .secondaryIndexes((index) => [index('userId'), index('status')])
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.group('admin').to(['read', 'update', 'delete']),
    ]),

  ScreeningParameters: a
    .model({
      id: a.id().required(),
      method1MinPrice: a.float().required(),
      method1MaxPrice: a.float().required(),
      method1MinVolume: a.float().required(),
      method1MinATRPercent: a.float().required(),
      method1MaxSpread: a.float().required(),
      method2MaxRiskPercent: a.float().required(),
      method2MaxVIX: a.float().required(),
      method2MinSetupQuality: a.string().required(),
      method2MinRiskReward: a.float().required(),
      updatedBy: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  FilteredStock: a
    .model({
      id: a.id().required(),
      ticker: a.string().required(),
      companyName: a.string(),
      sector: a.string(),
      industry: a.string(),
      lastPrice: a.float().required(),
      previousClose: a.float(),
      changePercent: a.float(),
      volume: a.float(),
      avgVolume: a.float(),
      marketCap: a.float(),
      lowTargetPrice: a.float(),
      avgTargetPrice: a.float(),
      highTargetPrice: a.float(),
      numberOfAnalysts: a.integer(),
      upsidePct: a.float(),
      belowLowTargetPct: a.float(),
      aboveHighTargetPct: a.float(),
      week52Low: a.float(),
      week52High: a.float(),
      week52RangePosition: a.float(),
      isHighUpside: a.boolean().default(false),
      isUndervalued: a.boolean().default(false),
      screenDate: a.date().required(),
      screenTime: a.string(),
      dataSource: a.string(),
    })
    .secondaryIndexes((index) => [index('screenDate')])
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  Conversation: a
    .model({
      id: a.id().required(),
      title: a.string(),
      conversationType: a.enum(['TRADE_ASSISTANT', 'TRADE_REVIEWER', 'GENERAL']),
      messages: a.json(),
      lastMessageAt: a.datetime(),
      tradeId: a.string(),
      contextData: a.json(),
      tokenCount: a.integer(),
      isArchived: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner().to(['create', 'read', 'update', 'delete'])]),

  AIMessage: a
    .model({
      id: a.id().required(),
      conversationId: a.string().required(),
      role: a.enum(['USER', 'ASSISTANT', 'SYSTEM']),
      content: a.string().required(),
      tokenCount: a.integer(),
      metadata: a.json(),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [index('conversationId')])
    .authorization((allow) => [allow.owner().to(['create', 'read', 'update', 'delete'])]),
})
.authorization((allow) => [
  allow.resource(filterScreener),
  allow.resource(method1Screener),
  allow.resource(method2Screener),
  allow.resource(resultsCombiner),
]);

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
