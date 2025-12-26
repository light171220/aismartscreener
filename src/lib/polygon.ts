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
};

export async function fetchPolygon<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface PolygonAggregateResult {
  v: number;
  vw: number;
  o: number;
  c: number;
  h: number;
  l: number;
  t: number;
  n: number;
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

export interface PolygonMarketStatus {
  market: string;
  serverTime: string;
  exchanges: {
    nyse: string;
    nasdaq: string;
    otc: string;
  };
  currencies: {
    fx: string;
    crypto: string;
  };
}
