import {
  polygonEndpoints,
  fetchPolygon,
  PolygonAggregatesResponse,
  PolygonIndicatorResponse,
  PolygonNewsResponse,
  POLYGON_API_KEY,
} from '../../functions/shared/polygon';

interface AnalysisResult {
  ticker: string;
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema9: number | null;
  ema21: number | null;
  rsi: number | null;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  } | null;
  priceVsSma20: number | null;
  priceVsSma50: number | null;
  priceVsSma200: number | null;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  signals: string[];
  newsCount: number;
  recentNews: Array<{
    title: string;
    published: string;
    url: string;
  }>;
  analyzedAt: string;
}

async function getIndicatorValue(
  ticker: string,
  type: 'sma' | 'ema' | 'rsi',
  window: number
): Promise<number | null> {
  try {
    const endpoint = type === 'sma' 
      ? polygonEndpoints.technicals.sma(ticker, window)
      : type === 'ema'
      ? polygonEndpoints.technicals.ema(ticker, window)
      : polygonEndpoints.technicals.rsi(ticker, window);

    const data = await fetchPolygon<PolygonIndicatorResponse>(endpoint);
    
    if (data.results?.values?.length > 0) {
      return data.results.values[0].value;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to get ${type}${window} for ${ticker}:`, error);
    return null;
  }
}

async function getMACD(ticker: string): Promise<AnalysisResult['macd']> {
  try {
    const data = await fetchPolygon<{
      results: {
        values: Array<{
          value: number;
          signal: number;
          histogram: number;
        }>;
      };
    }>(polygonEndpoints.technicals.macd(ticker));

    if (data.results?.values?.length > 0) {
      const latest = data.results.values[0];
      return {
        value: latest.value,
        signal: latest.signal,
        histogram: latest.histogram,
      };
    }
    return null;
  } catch (error) {
    console.warn(`Failed to get MACD for ${ticker}:`, error);
    return null;
  }
}

async function getNews(ticker: string): Promise<AnalysisResult['recentNews']> {
  try {
    const data = await fetchPolygon<PolygonNewsResponse>(
      polygonEndpoints.tickerNews(ticker, 5)
    );

    return data.results?.map((n) => ({
      title: n.title,
      published: n.published_utc,
      url: n.article_url,
    })) || [];
  } catch (error) {
    console.warn(`Failed to get news for ${ticker}:`, error);
    return [];
  }
}

function determineTrend(
  price: number,
  sma20: number | null,
  sma50: number | null,
  sma200: number | null
): 'bullish' | 'bearish' | 'neutral' {
  let bullishSignals = 0;
  let bearishSignals = 0;

  if (sma20 && price > sma20) bullishSignals++;
  else if (sma20 && price < sma20) bearishSignals++;

  if (sma50 && price > sma50) bullishSignals++;
  else if (sma50 && price < sma50) bearishSignals++;

  if (sma200 && price > sma200) bullishSignals++;
  else if (sma200 && price < sma200) bearishSignals++;

  if (sma20 && sma50 && sma20 > sma50) bullishSignals++;
  else if (sma20 && sma50 && sma20 < sma50) bearishSignals++;

  if (bullishSignals >= 3) return 'bullish';
  if (bearishSignals >= 3) return 'bearish';
  return 'neutral';
}

function determineStrength(rsi: number | null, macd: AnalysisResult['macd']): 'strong' | 'moderate' | 'weak' {
  let score = 0;

  if (rsi) {
    if (rsi > 50 && rsi < 70) score += 2;
    else if (rsi >= 30 && rsi <= 50) score += 1;
    else if (rsi > 70 || rsi < 30) score += 0;
  }

  if (macd) {
    if (macd.histogram > 0 && macd.value > macd.signal) score += 2;
    else if (macd.histogram > 0 || macd.value > macd.signal) score += 1;
  }

  if (score >= 3) return 'strong';
  if (score >= 1) return 'moderate';
  return 'weak';
}

function generateSignals(
  price: number,
  sma20: number | null,
  sma50: number | null,
  sma200: number | null,
  rsi: number | null,
  macd: AnalysisResult['macd']
): string[] {
  const signals: string[] = [];

  if (sma20 && sma50) {
    if (sma20 > sma50) signals.push('Golden cross (SMA20 > SMA50)');
    else signals.push('Death cross (SMA20 < SMA50)');
  }

  if (sma200 && price > sma200) {
    signals.push('Trading above 200 SMA (long-term bullish)');
  } else if (sma200 && price < sma200) {
    signals.push('Trading below 200 SMA (long-term bearish)');
  }

  if (rsi) {
    if (rsi > 70) signals.push('RSI overbought (>70)');
    else if (rsi < 30) signals.push('RSI oversold (<30)');
    else if (rsi > 50) signals.push('RSI bullish (>50)');
    else signals.push('RSI bearish (<50)');
  }

  if (macd) {
    if (macd.histogram > 0 && macd.value > macd.signal) {
      signals.push('MACD bullish crossover');
    } else if (macd.histogram < 0 && macd.value < macd.signal) {
      signals.push('MACD bearish crossover');
    }
  }

  return signals;
}

export const handler = async (event: { tickers: string[] }) => {
  console.log('Starting stock analysis with Polygon API key:', POLYGON_API_KEY.substring(0, 8) + '...');
  
  const { tickers } = event;

  if (!tickers || tickers.length === 0) {
    return {
      statusCode: 400,
      body: { error: 'No tickers provided' },
    };
  }

  const results: AnalysisResult[] = [];

  for (const ticker of tickers) {
    try {
      console.log(`Analyzing ${ticker}...`);

      const [prevClose, sma20, sma50, sma200, ema9, ema21, rsi, macd, news] = await Promise.all([
        fetchPolygon<PolygonAggregatesResponse>(polygonEndpoints.previousClose(ticker)),
        getIndicatorValue(ticker, 'sma', 20),
        getIndicatorValue(ticker, 'sma', 50),
        getIndicatorValue(ticker, 'sma', 200),
        getIndicatorValue(ticker, 'ema', 9),
        getIndicatorValue(ticker, 'ema', 21),
        getIndicatorValue(ticker, 'rsi', 14),
        getMACD(ticker),
        getNews(ticker),
      ]);

      const price = prevClose.results?.[0]?.c || 0;

      if (price === 0) {
        console.warn(`No price data for ${ticker}, skipping`);
        continue;
      }

      const trend = determineTrend(price, sma20, sma50, sma200);
      const strength = determineStrength(rsi, macd);
      const signals = generateSignals(price, sma20, sma50, sma200, rsi, macd);

      results.push({
        ticker,
        price,
        sma20,
        sma50,
        sma200,
        ema9,
        ema21,
        rsi,
        macd,
        priceVsSma20: sma20 ? ((price - sma20) / sma20) * 100 : null,
        priceVsSma50: sma50 ? ((price - sma50) / sma50) * 100 : null,
        priceVsSma200: sma200 ? ((price - sma200) / sma200) * 100 : null,
        trend,
        strength,
        signals,
        newsCount: news.length,
        recentNews: news,
        analyzedAt: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error analyzing ${ticker}:`, error);
    }
  }

  return {
    statusCode: 200,
    body: {
      results,
      count: results.length,
      analyzedAt: new Date().toISOString(),
    },
  };
};
