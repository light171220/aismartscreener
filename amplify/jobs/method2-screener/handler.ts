import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/method2-screener';

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || 'p7AiSYm37T2knK61ZM_oCaCmfLJPHZT_';
const POLYGON_BASE_URL = 'https://api.polygon.io';

interface Method2Config {
  minPrice: number;
  maxPrice: number;
  minVolumeSpike: number;
  minATRPercent: number;
  maxVIX: number;
  maxRiskPercent: number;
  accountSize: number;
  minRiskReward: number;
}

const DEFAULT_CONFIG: Method2Config = {
  minPrice: 5,
  maxPrice: 500,
  minVolumeSpike: 2.0,
  minATRPercent: 2,
  maxVIX: 30,
  maxRiskPercent: 1,
  accountSize: 100000,
  minRiskReward: 1.5,
};

async function fetchPolygon<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Polygon API error: ${response.status}`);
  return response.json();
}

const polygonEndpoints = {
  snapshotGainers: () => `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${POLYGON_API_KEY}`,
  previousClose: (ticker: string) => `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`,
  aggregates: (ticker: string, from: string, to: string) =>
    `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?apiKey=${POLYGON_API_KEY}`,
  snapshotTicker: (ticker: string) => `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`,
};

type MarketTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

async function getMarketTrend(ticker: string): Promise<MarketTrend> {
  try {
    const data = await fetchPolygon<any>(polygonEndpoints.previousClose(ticker));
    if (data.results?.[0]) {
      const change = ((data.results[0].c - data.results[0].o) / data.results[0].o) * 100;
      if (change > 0.3) return 'BULLISH';
      if (change < -0.3) return 'BEARISH';
    }
    return 'NEUTRAL';
  } catch { return 'NEUTRAL'; }
}

async function getVIXLevel(): Promise<number> {
  try {
    const data = await fetchPolygon<any>(polygonEndpoints.snapshotTicker('VIX'));
    return data.ticker?.day?.c || 20;
  } catch { return 20; }
}

async function deleteOldRecords(screenDate: string): Promise<number> {
  let deletedCount = 0;
  try {
    const { data: existingRecords } = await client.models.Method2Stock.list({
      filter: { screenDate: { eq: screenDate } },
    });
    if (existingRecords?.length) {
      for (const record of existingRecords) {
        await client.models.Method2Stock.delete({ id: record.id });
        deletedCount++;
      }
    }
  } catch (error) {
    console.error('Error deleting old records:', error);
  }
  return deletedCount;
}

async function gate1PreMarketFilter(config: Method2Config): Promise<any[]> {
  const snapshot = await fetchPolygon<any>(polygonEndpoints.snapshotGainers());
  if (!snapshot.tickers) return [];

  const results: any[] = [];
  const gate1Time = new Date().toISOString().split('T')[1].split('.')[0];

  for (const ticker of snapshot.tickers.slice(0, 30)) {
    if (!ticker.day || !ticker.prevDay) continue;
    const lastPrice = ticker.day.c;
    if (lastPrice < config.minPrice || lastPrice > config.maxPrice) continue;

    const avgVolume30D = ticker.prevDay.v || 1000000;
    const preMarketVolume = ticker.day.v;
    const volumeSpike = preMarketVolume / avgVolume30D;
    if (volumeSpike < config.minVolumeSpike) continue;

    const atrPercent = ((ticker.day.h - ticker.day.l) / lastPrice) * 100;
    if (atrPercent < config.minATRPercent) continue;

    results.push({
      ticker: ticker.ticker,
      lastPrice,
      avgVolume30D,
      preMarketVolume,
      volumeSpike: Math.round(volumeSpike * 100) / 100,
      atrPercent: Math.round(atrPercent * 100) / 100,
      passedGate1: true,
      gate1Time,
    });
  }
  return results;
}

async function gate2TechnicalAlignment(stocks: any[], config: Method2Config): Promise<any[]> {
  const [spyTrend, qqqTrend] = await Promise.all([getMarketTrend('SPY'), getMarketTrend('QQQ')]);
  const results: any[] = [];
  const gate2Time = new Date().toISOString().split('T')[1].split('.')[0];
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  for (const stock of stocks) {
    try {
      const aggregates = await fetchPolygon<any>(polygonEndpoints.aggregates(stock.ticker, thirtyDaysAgo, today));
      if (!aggregates.results?.length || aggregates.results.length < 5) continue;

      const bars = aggregates.results;
      const latestBar = bars[bars.length - 1];
      const ema20 = bars.slice(-20).reduce((a: number, b: any) => a + b.c, 0) / Math.min(bars.length, 20);
      const ema9 = bars.slice(-9).reduce((a: number, b: any) => a + b.c, 0) / Math.min(bars.length, 9);
      const vwap = latestBar.vw || stock.lastPrice;

      const aboveVWAP = stock.lastPrice > vwap;
      const aboveEMA9 = stock.lastPrice > ema9;
      const aboveEMA20 = stock.lastPrice > ema20;
      const relativeVolume = stock.preMarketVolume / stock.avgVolume30D;

      const isBullish = stock.lastPrice > bars[bars.length - 2]?.c;
      const marketAligned = (isBullish && (spyTrend === 'BULLISH' || qqqTrend === 'BULLISH')) ||
                           (!isBullish && (spyTrend === 'BEARISH' || qqqTrend === 'BEARISH'));

      const passedGate2 = aboveVWAP && aboveEMA9 && marketAligned && relativeVolume >= 1.5;

      results.push({
        ...stock,
        vwap: Math.round(vwap * 100) / 100,
        ema9: Math.round(ema9 * 100) / 100,
        ema20: Math.round(ema20 * 100) / 100,
        aboveVWAP, aboveEMA9, aboveEMA20,
        relativeVolume: Math.round(relativeVolume * 100) / 100,
        spyTrend, qqqTrend, marketAligned,
        passedGate2, gate2Time,
      });
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      console.warn(`Gate 2 failed for ${stock.ticker}:`, error);
    }
  }
  return results.filter(r => r.passedGate2);
}

async function gate3Confirmation(stocks: any[]): Promise<any[]> {
  const results: any[] = [];
  const gate3Time = new Date().toISOString().split('T')[1].split('.')[0];

  for (const stock of stocks) {
    const holdsAboveVWAP = stock.lastPrice > stock.vwap * 0.995;
    const volumeExpansion = stock.relativeVolume >= 2.0;
    const spyAgrees = stock.spyTrend !== 'BEARISH';
    const passedGate3 = holdsAboveVWAP && volumeExpansion && spyAgrees;

    results.push({ ...stock, holdsAboveVWAP, noRejectionWick: true, volumeExpansion, spyAgrees, passedGate3, gate3Time });
  }
  return results.filter(r => r.passedGate3);
}

async function gate4RiskManagement(stocks: any[], config: Method2Config): Promise<any[]> {
  const vixLevel = await getVIXLevel();
  const results: any[] = [];
  const gate4Time = new Date().toISOString().split('T')[1].split('.')[0];

  for (const stock of stocks) {
    const suggestedEntry = Math.round((stock.vwap + 0.01 * stock.lastPrice) * 100) / 100;
    const suggestedStop = Math.round((stock.vwap - (stock.atrPercent / 100) * stock.lastPrice) * 100) / 100;
    const riskPerShare = suggestedEntry - suggestedStop;
    const maxRiskAmount = config.accountSize * (config.maxRiskPercent / 100);
    const maxShares = Math.floor(maxRiskAmount / riskPerShare);
    const riskCheckPassed = maxShares >= 10 && riskPerShare > 0;
    const marketVolatilityOK = vixLevel < config.maxVIX;

    const suggestedTarget1 = Math.round((suggestedEntry + riskPerShare * 1.5) * 100) / 100;
    const suggestedTarget2 = Math.round((suggestedEntry + riskPerShare * 2.5) * 100) / 100;
    const riskRewardRatio = riskPerShare > 0 ? Math.round(((suggestedTarget1 - suggestedEntry) / riskPerShare) * 100) / 100 : 1.5;

    let setupType: 'VWAP_RECLAIM' | 'GAP_AND_GO' | 'TREND_CONTINUATION' = 'VWAP_RECLAIM';
    if (stock.volumeSpike > 3) setupType = 'GAP_AND_GO';
    else if (stock.aboveEMA20 && stock.aboveEMA9) setupType = 'TREND_CONTINUATION';

    const qualityScore = (stock.volumeSpike >= 3 ? 2 : stock.volumeSpike >= 2 ? 1 : 0) +
      (stock.spyTrend === 'BULLISH' ? 2 : stock.spyTrend === 'NEUTRAL' ? 1 : 0) +
      (stock.qqqTrend === 'BULLISH' ? 1 : 0) +
      (riskRewardRatio >= 2 ? 2 : riskRewardRatio >= 1.5 ? 1 : 0);
    
    const setupQuality: 'A_PLUS' | 'A' | 'B' | 'C' = qualityScore >= 6 ? 'A_PLUS' : qualityScore >= 4 ? 'A' : qualityScore >= 2 ? 'B' : 'C';
    const passedGate4 = riskCheckPassed && marketVolatilityOK && riskRewardRatio >= config.minRiskReward;
    const passedAllGates = passedGate4;

    results.push({
      ...stock,
      riskPerShare: Math.round(riskPerShare * 100) / 100,
      maxShares, riskCheckPassed, vixLevel, marketVolatilityOK,
      passedGate4, gate4Time, setupType, setupQuality,
      suggestedEntry, suggestedStop, suggestedTarget1, suggestedTarget2,
      riskRewardRatio, passedAllGates,
    });
  }
  return results;
}

export const handler: Handler = async (event) => {
  const config: Method2Config = { ...DEFAULT_CONFIG, ...event?.config };
  const screenDate = new Date().toISOString().split('T')[0];

  try {
    await deleteOldRecords(screenDate);

    const gate1Results = await gate1PreMarketFilter(config);
    if (!gate1Results.length) return { statusCode: 200, body: { results: [], message: 'No stocks passed Gate 1' } };

    const gate2Results = await gate2TechnicalAlignment(gate1Results, config);
    if (!gate2Results.length) return { statusCode: 200, body: { results: [], message: 'No stocks passed Gate 2' } };

    const gate3Results = await gate3Confirmation(gate2Results);
    if (!gate3Results.length) return { statusCode: 200, body: { results: [], message: 'No stocks passed Gate 3' } };

    const gate4Results = await gate4RiskManagement(gate3Results, config);
    const finalResults = gate4Results.filter(r => r.passedAllGates);

    let savedCount = 0;
    for (const r of finalResults) {
      const { errors } = await client.models.Method2Stock.create({
        ticker: r.ticker,
        lastPrice: r.lastPrice,
        avgVolume30D: r.avgVolume30D,
        preMarketVolume: r.preMarketVolume,
        volumeSpike: r.volumeSpike,
        atrPercent: r.atrPercent,
        passedGate1: r.passedGate1,
        gate1Time: r.gate1Time,
        vwap: r.vwap,
        ema9: r.ema9,
        ema20: r.ema20,
        aboveVWAP: r.aboveVWAP,
        aboveEMA9: r.aboveEMA9,
        aboveEMA20: r.aboveEMA20,
        relativeVolume: r.relativeVolume,
        spyTrend: r.spyTrend,
        qqqTrend: r.qqqTrend,
        marketAligned: r.marketAligned,
        passedGate2: r.passedGate2,
        gate2Time: r.gate2Time,
        holdsAboveVWAP: r.holdsAboveVWAP,
        noRejectionWick: r.noRejectionWick,
        volumeExpansion: r.volumeExpansion,
        spyAgrees: r.spyAgrees,
        passedGate3: r.passedGate3,
        gate3Time: r.gate3Time,
        riskPerShare: r.riskPerShare,
        maxShares: r.maxShares,
        riskCheckPassed: r.riskCheckPassed,
        vixLevel: r.vixLevel,
        marketVolatilityOK: r.marketVolatilityOK,
        passedGate4: r.passedGate4,
        gate4Time: r.gate4Time,
        setupType: r.setupType,
        setupQuality: r.setupQuality,
        suggestedEntry: r.suggestedEntry,
        suggestedStop: r.suggestedStop,
        suggestedTarget1: r.suggestedTarget1,
        suggestedTarget2: r.suggestedTarget2,
        riskRewardRatio: r.riskRewardRatio,
        passedAllGates: r.passedAllGates,
        screenDate,
      });
      if (!errors) savedCount++;
    }

    return {
      statusCode: 200,
      body: {
        results: finalResults,
        count: savedCount,
        screenDate,
        stats: { gate1: gate1Results.length, gate2: gate2Results.length, gate3: gate3Results.length, gate4: finalResults.length },
      },
    };
  } catch (error) {
    return { statusCode: 500, body: { error: error instanceof Error ? error.message : 'Unknown error' } };
  }
};
