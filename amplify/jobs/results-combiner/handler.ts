import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/results-combiner';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

type SetupQuality = 'A_PLUS' | 'A' | 'B' | 'C';
type MarketTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
type SetupType = 'VWAP_RECLAIM' | 'VWAP_REJECTION' | 'ORB_BREAKOUT' | 'HRV_PULLBACK' | 'TREND_CONTINUATION' | 'GAP_AND_GO';
type CatalystType = 'EARNINGS' | 'ANALYST_UPGRADE' | 'ANALYST_DOWNGRADE' | 'SECTOR_MOMENTUM' | 'MACRO_SYMPATHY' | 'NEWS_FDA' | 'NEWS_GUIDANCE' | 'NEWS_CONTRACT' | 'NEWS_MA' | 'OTHER';

function calculatePriorityScore(
  inMethod1: boolean,
  inMethod2: boolean,
  setupQuality: string,
  riskRewardRatio: number,
  spyTrend?: string,
  qqqTrend?: string
): number {
  let score = 50;
  if (inMethod1 && inMethod2) score += 30;
  else if (inMethod1 || inMethod2) score += 15;

  switch (setupQuality) {
    case 'A_PLUS': score += 20; break;
    case 'A': score += 15; break;
    case 'B': score += 10; break;
    case 'C': score += 5; break;
  }

  if (riskRewardRatio >= 2.5) score += 15;
  else if (riskRewardRatio >= 2.0) score += 10;
  else if (riskRewardRatio >= 1.5) score += 5;

  if (spyTrend === 'BULLISH') score += 5;
  if (qqqTrend === 'BULLISH') score += 5;

  return Math.min(100, Math.max(0, score));
}

async function deleteOldRecords(screenDate: string): Promise<number> {
  let deletedCount = 0;
  try {
    const { data: existingRecords } = await client.models.AIScreeningResult.list({
      filter: { screenDate: { eq: screenDate } },
    });
    if (existingRecords?.length) {
      for (const record of existingRecords) {
        await client.models.AIScreeningResult.delete({ id: record.id });
        deletedCount++;
      }
    }
  } catch (error) {
    console.error('Error deleting old records:', error);
  }
  return deletedCount;
}

export const handler: Handler = async (event) => {
  const screenDate = new Date().toISOString().split('T')[0];
  const screenTime = new Date().toISOString().split('T')[1].split('.')[0];

  try {
    await deleteOldRecords(screenDate);

    const [method1Response, method2Response] = await Promise.all([
      client.models.Method1Stock.list({ filter: { screenDate: { eq: screenDate } } }),
      client.models.Method2Stock.list({ filter: { screenDate: { eq: screenDate } } }),
    ]);

    const method1Results = method1Response.data || [];
    const method2Results = method2Response.data || [];

    const method1Tickers = new Set(method1Results.filter(r => r.passedMethod1).map(r => r.ticker));
    const method2Tickers = new Set(method2Results.filter(r => r.passedAllGates).map(r => r.ticker));

    const method1Map = new Map(method1Results.map(r => [r.ticker, r]));
    const method2Map = new Map(method2Results.map(r => [r.ticker, r]));

    const allTickers = new Set([...method1Tickers, ...method2Tickers]);
    let savedCount = 0;

    for (const ticker of allTickers) {
      const inMethod1 = method1Tickers.has(ticker);
      const inMethod2 = method2Tickers.has(ticker);
      const inBothMethods = inMethod1 && inMethod2;

      const m1 = method1Map.get(ticker);
      const m2 = method2Map.get(ticker);
      const primarySource = m2 || m1;
      if (!primarySource) continue;

      const currentPrice = m2?.lastPrice || m1?.lastPrice || 0;
      const setupType = (m2?.setupType || 'GAP_AND_GO') as SetupType;
      const setupQuality = (m2?.setupQuality || (inBothMethods ? 'A_PLUS' : inMethod1 ? 'A' : 'B')) as SetupQuality;

      const suggestedEntry = m2?.suggestedEntry || m1?.suggestedEntry || currentPrice;
      const suggestedStop = m2?.suggestedStop || m1?.suggestedStop || currentPrice * 0.97;
      const suggestedTarget1 = m2?.suggestedTarget1 || m1?.target1 || currentPrice * 1.05;
      const suggestedTarget2 = m2?.suggestedTarget2 || m1?.target2;

      const riskPerShare = (suggestedEntry || 0) - (suggestedStop || 0);
      const rewardPerShare = (suggestedTarget1 || 0) - (suggestedEntry || 0);
      const riskRewardRatio = riskPerShare > 0 ? Math.round((rewardPerShare / riskPerShare) * 100) / 100 : 1.5;

      const priorityScore = calculatePriorityScore(
        inMethod1,
        inMethod2,
        setupQuality,
        riskRewardRatio,
        m2?.spyTrend || undefined,
        m2?.qqqTrend || undefined
      );

      const { errors } = await client.models.AIScreeningResult.create({
        ticker,
        companyName: m1?.companyName,
        currentPrice,
        changePercent: 0,
        setupType,
        setupQuality,
        catalystType: m1?.catalystType as CatalystType | undefined,
        catalystDescription: m1?.catalystDescription,
        suggestedEntry,
        suggestedStop,
        suggestedTarget1,
        suggestedTarget2,
        riskRewardRatio,
        spyTrend: m2?.spyTrend as MarketTrend | undefined,
        qqqTrend: m2?.qqqTrend as MarketTrend | undefined,
        inMethod1,
        inMethod2,
        inBothMethods,
        method1StockId: m1?.id,
        method2StockId: m2?.id,
        priorityScore,
        screenDate,
        screenTime,
        isActive: true,
      });

      if (!errors) savedCount++;
    }

    const bothMethodsCount = [...allTickers].filter(t => method1Tickers.has(t) && method2Tickers.has(t)).length;

    return {
      statusCode: 200,
      body: {
        count: savedCount,
        screenDate,
        screenTime,
        stats: {
          method1Only: [...allTickers].filter(t => method1Tickers.has(t) && !method2Tickers.has(t)).length,
          method2Only: [...allTickers].filter(t => method2Tickers.has(t) && !method1Tickers.has(t)).length,
          bothMethods: bothMethodsCount,
        },
      },
    };
  } catch (error) {
    return { statusCode: 500, body: { error: error instanceof Error ? error.message : 'Unknown error' } };
  }
};
