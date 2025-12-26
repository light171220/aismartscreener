import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/method1-screener';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || 'p7AiSYm37T2knK61ZM_oCaCmfLJPHZT_';
const POLYGON_BASE_URL = 'https://api.polygon.io';

interface Method1Config {
  minPrice: number;
  maxPrice: number;
  minAvgVolume: number;
  minATRPercent: number;
  maxSpread: number;
  minGapPercent: number;
  maxGapPercent: number;
}

const DEFAULT_CONFIG: Method1Config = {
  minPrice: 5,
  maxPrice: 500,
  minAvgVolume: 500000,
  minATRPercent: 2,
  maxSpread: 0.5,
  minGapPercent: 3,
  maxGapPercent: 30,
};

async function fetchPolygon<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Polygon API error: ${response.status}`);
  return response.json();
}

const polygonEndpoints = {
  snapshotAll: () => `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${POLYGON_API_KEY}`,
  previousClose: (ticker: string) => `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`,
  aggregates: (ticker: string, from: string, to: string) =>
    `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?apiKey=${POLYGON_API_KEY}`,
  tickerNews: (ticker: string, limit: number) =>
    `${POLYGON_BASE_URL}/v2/reference/news?ticker=${ticker}&limit=${limit}&apiKey=${POLYGON_API_KEY}`,
};

async function deleteOldRecords(screenDate: string): Promise<number> {
  let deletedCount = 0;
  try {
    const { data: existingRecords } = await client.models.Method1Stock.list({
      filter: { screenDate: { eq: screenDate } },
    });
    if (existingRecords?.length) {
      for (const record of existingRecords) {
        await client.models.Method1Stock.delete({ id: record.id });
        deletedCount++;
      }
    }
  } catch (error) {
    console.error('Error deleting old records:', error);
  }
  return deletedCount;
}

async function step1LiquidityScan(config: Method1Config): Promise<any[]> {
  const snapshot = await fetchPolygon<any>(polygonEndpoints.snapshotAll());
  if (!snapshot.tickers?.length) return [];

  const results: any[] = [];
  for (const ticker of snapshot.tickers) {
    if (!ticker.day || !ticker.prevDay) continue;
    const lastPrice = ticker.day.c;
    const previousClose = ticker.prevDay.c;
    if (!previousClose || lastPrice < config.minPrice || lastPrice > config.maxPrice) continue;

    const gapPercent = ((lastPrice - previousClose) / previousClose) * 100;
    if (Math.abs(gapPercent) < config.minGapPercent || Math.abs(gapPercent) > config.maxGapPercent) continue;

    const avgVolume = ticker.prevDay.v || ticker.day.v;
    if (avgVolume < config.minAvgVolume) continue;

    const relativeVolume = ticker.day.v / avgVolume;
    if (relativeVolume >= 1.5) {
      results.push({
        ticker: ticker.ticker,
        lastPrice,
        previousClose,
        gapPercent: Math.round(gapPercent * 100) / 100,
        volume: ticker.day.v,
        avgVolume,
        relativeVolume: Math.round(relativeVolume * 100) / 100,
        liquidityPassed: true,
      });
    }
  }
  return results.slice(0, 50);
}

async function step2CatalystCheck(stocks: any[]): Promise<any[]> {
  const results: any[] = [];
  const catalystKeywords = ['earnings', 'beat', 'upgrade', 'FDA', 'approval', 'contract', 'acquisition', 'guidance'];

  for (const stock of stocks) {
    try {
      const news = await fetchPolygon<any>(polygonEndpoints.tickerNews(stock.ticker, 5));
      let hasCatalyst = false, catalystType: string | undefined, catalystDescription: string | undefined;

      if (news.results?.length) {
        const recentNews = news.results[0];
        const combined = (recentNews.title + ' ' + (recentNews.description || '')).toLowerCase();
        for (const keyword of catalystKeywords) {
          if (combined.includes(keyword)) {
            hasCatalyst = true;
            catalystType = keyword.includes('earnings') ? 'EARNINGS' : keyword.includes('upgrade') ? 'ANALYST_UPGRADE' : 'OTHER';
            catalystDescription = recentNews.title.substring(0, 200);
            break;
          }
        }
      }
      if (stock.gapPercent > 5) {
        hasCatalyst = true;
        catalystType = catalystType || 'SECTOR_MOMENTUM';
        catalystDescription = catalystDescription || `Strong gap ${stock.gapPercent}%`;
      }

      if (hasCatalyst) {
        results.push({ ...stock, hasCatalyst, catalystType, catalystDescription, catalystPassed: true });
      }
      await new Promise(r => setTimeout(r, 100));
    } catch {
      if (stock.gapPercent > 5) {
        results.push({ ...stock, hasCatalyst: true, catalystType: 'SECTOR_MOMENTUM', catalystDescription: `Gap ${stock.gapPercent}%`, catalystPassed: true });
      }
    }
  }
  return results;
}

async function step3TechnicalSetup(stocks: any[]): Promise<any[]> {
  const results: any[] = [];
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const stock of stocks) {
    try {
      const [aggregates, spyData] = await Promise.all([
        fetchPolygon<any>(polygonEndpoints.aggregates(stock.ticker, thirtyDaysAgo, today)),
        fetchPolygon<any>(polygonEndpoints.previousClose('SPY')),
      ]);

      if (!aggregates.results?.length || aggregates.results.length < 5) continue;
      const bars = aggregates.results;
      const latestBar = bars[bars.length - 1];

      const ema20 = bars.slice(-20).reduce((a: number, b: any) => a + b.c, 0) / Math.min(bars.length, 20);
      const ema9 = bars.slice(-9).reduce((a: number, b: any) => a + b.c, 0) / Math.min(bars.length, 9);
      const vwap = latestBar.vw || stock.lastPrice;

      const atrValues = bars.slice(-14).map((b: any, i: number) => {
        if (i === 0) return b.h - b.l;
        const prev = bars[bars.length - 14 + i - 1];
        return Math.max(b.h - b.l, Math.abs(b.h - prev.c), Math.abs(b.l - prev.c));
      });
      const atr = atrValues.reduce((a: number, b: number) => a + b, 0) / atrValues.length;

      const aboveVWAP = stock.lastPrice > vwap;
      const spyChange = spyData.results?.[0] ? ((spyData.results[0].c - spyData.results[0].o) / spyData.results[0].o) * 100 : 0;
      const marketAligned = (stock.gapPercent > 0 && spyChange > 0) || (stock.gapPercent < 0 && spyChange < 0);
      const technicalSetupPassed = aboveVWAP && stock.lastPrice > ema9 && marketAligned;

      const suggestedEntry = Math.round((vwap + 0.02 * stock.lastPrice) * 100) / 100;
      const suggestedStop = Math.round((vwap - atr) * 100) / 100;
      const riskPerShare = suggestedEntry - suggestedStop;
      const target1 = Math.round((suggestedEntry + riskPerShare * 1.5) * 100) / 100;
      const target2 = Math.round((suggestedEntry + riskPerShare * 2.5) * 100) / 100;

      results.push({
        ...stock,
        vwap: Math.round(vwap * 100) / 100,
        ema9: Math.round(ema9 * 100) / 100,
        ema20: Math.round(ema20 * 100) / 100,
        atr: Math.round(atr * 100) / 100,
        atrPercent: Math.round((atr / stock.lastPrice) * 10000) / 100,
        aboveVWAP,
        marketAligned,
        technicalSetupPassed,
        suggestedEntry,
        suggestedStop,
        target1,
        target2,
        passedMethod1: technicalSetupPassed,
      });
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.warn(`Failed for ${stock.ticker}:`, error);
    }
  }
  return results.filter(r => r.passedMethod1);
}

export const handler: Handler = async (event) => {
  const config: Method1Config = { ...DEFAULT_CONFIG, ...event?.config };
  const screenDate = new Date().toISOString().split('T')[0];
  const screenTime = new Date().toISOString().split('T')[1].split('.')[0];

  try {
    await deleteOldRecords(screenDate);

    const step1Results = await step1LiquidityScan(config);
    if (!step1Results.length) return { statusCode: 200, body: { results: [], message: 'No stocks passed Step 1' } };

    const step2Results = await step2CatalystCheck(step1Results);
    if (!step2Results.length) return { statusCode: 200, body: { results: [], message: 'No stocks passed Step 2' } };

    const finalResults = await step3TechnicalSetup(step2Results);

    let savedCount = 0;
    for (const r of finalResults) {
      const { errors } = await client.models.Method1Stock.create({
        ticker: r.ticker,
        companyName: r.companyName,
        lastPrice: r.lastPrice,
        avgVolume: r.avgVolume,
        relativeVolume: r.relativeVolume,
        liquidityPassed: r.liquidityPassed,
        atr: r.atr,
        atrPercent: r.atrPercent,
        hasCatalyst: r.hasCatalyst,
        catalystType: r.catalystType,
        catalystDescription: r.catalystDescription,
        catalystPassed: r.catalystPassed,
        aboveVWAP: r.aboveVWAP,
        marketAligned: r.marketAligned,
        technicalSetupPassed: r.technicalSetupPassed,
        vwap: r.vwap,
        ema9: r.ema9,
        ema20: r.ema20,
        suggestedEntry: r.suggestedEntry,
        suggestedStop: r.suggestedStop,
        target1: r.target1,
        target2: r.target2,
        passedMethod1: r.passedMethod1,
        screenDate,
        screenTime,
      });
      if (!errors) savedCount++;
    }

    return {
      statusCode: 200,
      body: {
        results: finalResults,
        count: savedCount,
        screenDate,
        screenTime,
        stats: { step1: step1Results.length, step2: step2Results.length, step3: finalResults.length },
      },
    };
  } catch (error) {
    return { statusCode: 500, body: { error: error instanceof Error ? error.message : 'Unknown error' } };
  }
};
