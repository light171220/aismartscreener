import {
  polygonEndpoints,
  fetchPolygon,
  PolygonSnapshotResponse,
  PolygonSnapshotTicker,
  POLYGON_API_KEY,
} from '../../functions/shared/polygon';

interface ScanResult {
  ticker: string;
  price: number;
  previousClose: number;
  gapPercent: number;
  volume: number;
  avgVolume?: number;
  relativeVolume?: number;
  todaysChange: number;
  todaysChangePercent: number;
}

interface ScanConfig {
  minGapPercent: number;
  maxGapPercent: number;
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  gapDirection: 'up' | 'down' | 'both';
}

const DEFAULT_CONFIG: ScanConfig = {
  minGapPercent: 3,
  maxGapPercent: 50,
  minPrice: 1,
  maxPrice: 500,
  minVolume: 100000,
  gapDirection: 'up',
};

function filterStock(ticker: PolygonSnapshotTicker, config: ScanConfig): boolean {
  if (!ticker.day || !ticker.prevDay) return false;

  const price = ticker.day.c;
  const previousClose = ticker.prevDay.c;
  const volume = ticker.day.v;

  if (price < config.minPrice || price > config.maxPrice) return false;
  if (volume < config.minVolume) return false;
  if (!previousClose || previousClose === 0) return false;

  const gapPercent = ((price - previousClose) / previousClose) * 100;
  const absGap = Math.abs(gapPercent);

  if (absGap < config.minGapPercent || absGap > config.maxGapPercent) return false;

  if (config.gapDirection === 'up' && gapPercent < 0) return false;
  if (config.gapDirection === 'down' && gapPercent > 0) return false;

  return true;
}

function transformToScanResult(ticker: PolygonSnapshotTicker): ScanResult {
  const price = ticker.day.c;
  const previousClose = ticker.prevDay.c;
  const gapPercent = ((price - previousClose) / previousClose) * 100;

  return {
    ticker: ticker.ticker,
    price,
    previousClose,
    gapPercent: Math.round(gapPercent * 100) / 100,
    volume: ticker.day.v,
    todaysChange: ticker.todaysChange,
    todaysChangePercent: ticker.todaysChangePerc,
  };
}

export const handler = async (event?: { config?: Partial<ScanConfig> }) => {
  console.log('Starting market scan with Polygon API key:', POLYGON_API_KEY.substring(0, 8) + '...');
  
  const config: ScanConfig = {
    ...DEFAULT_CONFIG,
    ...event?.config,
  };

  try {
    console.log('Fetching market snapshot...');
    const snapshot = await fetchPolygon<PolygonSnapshotResponse>(
      polygonEndpoints.snapshotAll()
    );

    if (!snapshot.tickers || snapshot.tickers.length === 0) {
      console.log('No tickers in snapshot');
      return {
        statusCode: 200,
        body: { results: [], count: 0, timestamp: new Date().toISOString() },
      };
    }

    console.log(`Processing ${snapshot.tickers.length} tickers...`);

    const filteredStocks = snapshot.tickers
      .filter((t) => filterStock(t, config))
      .map(transformToScanResult)
      .sort((a, b) => Math.abs(b.gapPercent) - Math.abs(a.gapPercent))
      .slice(0, 100);

    console.log(`Found ${filteredStocks.length} stocks matching criteria`);

    return {
      statusCode: 200,
      body: {
        results: filteredStocks,
        count: filteredStocks.length,
        config,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Market scan error:', error);
    return {
      statusCode: 500,
      body: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
};
