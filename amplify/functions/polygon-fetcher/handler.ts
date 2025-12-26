import {
  polygonEndpoints,
  fetchPolygon,
  PolygonAggregatesResponse,
  PolygonSnapshotResponse,
  PolygonNewsResponse,
  PolygonIndicatorResponse,
} from '../shared/polygon';

type FetchType = 
  | 'aggregates'
  | 'previousClose'
  | 'snapshot'
  | 'snapshotTicker'
  | 'gainers'
  | 'losers'
  | 'news'
  | 'tickerDetails'
  | 'sma'
  | 'ema'
  | 'rsi'
  | 'macd'
  | 'groupedDaily';

interface FetchEvent {
  type: FetchType;
  ticker?: string;
  tickers?: string[];
  from?: string;
  to?: string;
  timespan?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  multiplier?: number;
  window?: number;
  limit?: number;
  date?: string;
}

export const handler = async (event: FetchEvent) => {
  try {
    const { type, ticker, tickers, from, to, timespan = 'day', multiplier = 1, window, limit = 10, date } = event;

    switch (type) {
      case 'aggregates': {
        if (!ticker || !from || !to) {
          throw new Error('Missing required params: ticker, from, to');
        }
        const data = await fetchPolygon<PolygonAggregatesResponse>(
          polygonEndpoints.aggregates(ticker, multiplier, timespan, from, to)
        );
        return { statusCode: 200, body: data };
      }

      case 'previousClose': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonAggregatesResponse>(
          polygonEndpoints.previousClose(ticker)
        );
        return { statusCode: 200, body: data };
      }

      case 'snapshot': {
        const data = await fetchPolygon<PolygonSnapshotResponse>(
          polygonEndpoints.snapshotAll()
        );
        return { statusCode: 200, body: data };
      }

      case 'snapshotTicker': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<{ ticker: PolygonSnapshotResponse['tickers'][0] }>(
          polygonEndpoints.snapshotTicker(ticker)
        );
        return { statusCode: 200, body: data };
      }

      case 'gainers': {
        const data = await fetchPolygon<PolygonSnapshotResponse>(
          polygonEndpoints.snapshotGainers()
        );
        return { statusCode: 200, body: data };
      }

      case 'losers': {
        const data = await fetchPolygon<PolygonSnapshotResponse>(
          polygonEndpoints.snapshotLosers()
        );
        return { statusCode: 200, body: data };
      }

      case 'news': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonNewsResponse>(
          polygonEndpoints.tickerNews(ticker, limit)
        );
        return { statusCode: 200, body: data };
      }

      case 'tickerDetails': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<{ results: unknown }>(
          polygonEndpoints.tickerDetails(ticker)
        );
        return { statusCode: 200, body: data };
      }

      case 'groupedDaily': {
        if (!date) {
          throw new Error('Missing required param: date');
        }
        const data = await fetchPolygon<PolygonAggregatesResponse>(
          polygonEndpoints.groupedDaily(date)
        );
        return { statusCode: 200, body: data };
      }

      case 'sma': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonIndicatorResponse>(
          polygonEndpoints.technicals.sma(ticker, window || 50)
        );
        return { statusCode: 200, body: data };
      }

      case 'ema': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonIndicatorResponse>(
          polygonEndpoints.technicals.ema(ticker, window || 20)
        );
        return { statusCode: 200, body: data };
      }

      case 'rsi': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonIndicatorResponse>(
          polygonEndpoints.technicals.rsi(ticker, window || 14)
        );
        return { statusCode: 200, body: data };
      }

      case 'macd': {
        if (!ticker) {
          throw new Error('Missing required param: ticker');
        }
        const data = await fetchPolygon<PolygonIndicatorResponse>(
          polygonEndpoints.technicals.macd(ticker)
        );
        return { statusCode: 200, body: data };
      }

      default:
        throw new Error(`Unknown fetch type: ${type}`);
    }
  } catch (error) {
    console.error('Polygon fetch error:', error);
    return {
      statusCode: 500,
      body: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
};
