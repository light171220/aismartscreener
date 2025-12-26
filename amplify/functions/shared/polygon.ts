export const POLYGON_API_KEY = 'p7AiSYm37T2knK61ZM_oCaCmfLJPHZT_';
export const POLYGON_BASE_URL = 'https://api.polygon.io';

export const polygonEndpoints = {
  aggregates: (ticker: string, multiplier: number, timespan: string, from: string, to: string) =>
    `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?apiKey=${POLYGON_API_KEY}`,

  previousClose: (ticker: string) =>
    `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`,

  groupedDaily: (date: string) =>
    `${POLYGON_BASE_URL}/v2/aggs/grouped/locale/us/market/stocks/${date}?apiKey=${POLYGON_API_KEY}`,

  snapshotAll: () =>
    `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${POLYGON_API_KEY}`,

  snapshotTicker: (ticker: string) =>
    `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`,

  snapshotGainers: () =>
    `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${POLYGON_API_KEY}`,

  snapshotLosers: () =>
    `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${POLYGON_API_KEY}`,

  tickerDetails: (ticker: string) =>
    `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}?apiKey=${POLYGON_API_KEY}`,

  tickerNews: (ticker: string, limit: number = 10) =>
    `${POLYGON_BASE_URL}/v2/reference/news?ticker=${ticker}&limit=${limit}&apiKey=${POLYGON_API_KEY}`,

  marketStatus: () =>
    `${POLYGON_BASE_URL}/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`,

  technicals: {
    sma: (ticker: string, window: number = 50) =>
      `${POLYGON_BASE_URL}/v1/indicators/sma/${ticker}?timespan=day&window=${window}&apiKey=${POLYGON_API_KEY}`,
    ema: (ticker: string, window: number = 20) =>
      `${POLYGON_BASE_URL}/v1/indicators/ema/${ticker}?timespan=day&window=${window}&apiKey=${POLYGON_API_KEY}`,
    rsi: (ticker: string, window: number = 14) =>
      `${POLYGON_BASE_URL}/v1/indicators/rsi/${ticker}?timespan=day&window=${window}&apiKey=${POLYGON_API_KEY}`,
    macd: (ticker: string) =>
      `${POLYGON_BASE_URL}/v1/indicators/macd/${ticker}?timespan=day&apiKey=${POLYGON_API_KEY}`,
  },
};

export async function fetchPolygon<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface PolygonAggregateResult {
  v: number;   // Volume
  vw: number;  // Volume-weighted average price
  o: number;   // Open
  c: number;   // Close
  h: number;   // High
  l: number;   // Low
  t: number;   // Timestamp (ms)
  n: number;   // Number of transactions
}

export interface PolygonAggregatesResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonAggregateResult[];
  status: string;
  request_id: string;
}

export interface PolygonSnapshotTicker {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  min?: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
}

export interface PolygonSnapshotResponse {
  status: string;
  tickers: PolygonSnapshotTicker[];
}

export interface PolygonNewsArticle {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  description: string;
  keywords: string[];
}

export interface PolygonNewsResponse {
  results: PolygonNewsArticle[];
  status: string;
  count: number;
  next_url?: string;
}

export interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  market_cap?: number;
  phone_number?: string;
  address?: {
    address1: string;
    city: string;
    state: string;
  };
  description?: string;
  sic_code?: string;
  sic_description?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  share_class_shares_outstanding?: number;
  weighted_shares_outstanding?: number;
}

export interface PolygonIndicatorResult {
  timestamp: number;
  value: number;
}

export interface PolygonIndicatorResponse {
  results: {
    values: PolygonIndicatorResult[];
  };
  status: string;
}
