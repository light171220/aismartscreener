import { useQuery } from '@tanstack/react-query';
import {
  polygonEndpoints,
  fetchPolygon,
  PolygonAggregatesResponse,
  PolygonSnapshotResponse,
  PolygonSnapshotTicker,
  PolygonNewsResponse,
  PolygonMarketStatus,
} from '@/lib/polygon';

export const polygonKeys = {
  all: ['polygon'] as const,
  aggregates: (ticker: string, timespan: string, from: string, to: string) =>
    [...polygonKeys.all, 'aggregates', ticker, timespan, from, to] as const,
  previousClose: (ticker: string) =>
    [...polygonKeys.all, 'previousClose', ticker] as const,
  snapshot: () => [...polygonKeys.all, 'snapshot'] as const,
  snapshotTicker: (ticker: string) =>
    [...polygonKeys.all, 'snapshot', ticker] as const,
  news: (ticker: string) => [...polygonKeys.all, 'news', ticker] as const,
  marketStatus: () => [...polygonKeys.all, 'marketStatus'] as const,
  gainers: () => [...polygonKeys.all, 'gainers'] as const,
  losers: () => [...polygonKeys.all, 'losers'] as const,
};

export function useAggregates(
  ticker: string,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
  from: string,
  to: string,
  multiplier: number = 1
) {
  return useQuery({
    queryKey: polygonKeys.aggregates(ticker, timespan, from, to),
    queryFn: () =>
      fetchPolygon<PolygonAggregatesResponse>(
        polygonEndpoints.aggregates(ticker, multiplier, timespan, from, to)
      ),
    enabled: !!ticker && !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePreviousClose(ticker: string) {
  return useQuery({
    queryKey: polygonKeys.previousClose(ticker),
    queryFn: () =>
      fetchPolygon<PolygonAggregatesResponse>(
        polygonEndpoints.previousClose(ticker)
      ),
    enabled: !!ticker,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSnapshot() {
  return useQuery({
    queryKey: polygonKeys.snapshot(),
    queryFn: () =>
      fetchPolygon<PolygonSnapshotResponse>(polygonEndpoints.snapshotAll()),
    staleTime: 60 * 1000,
  });
}

export function useSnapshotTicker(ticker: string) {
  return useQuery({
    queryKey: polygonKeys.snapshotTicker(ticker),
    queryFn: async () => {
      const response = await fetchPolygon<{ ticker: PolygonSnapshotTicker }>(
        polygonEndpoints.snapshotTicker(ticker)
      );
      return response.ticker;
    },
    enabled: !!ticker,
    staleTime: 60 * 1000,
  });
}

export function useTickerNews(ticker: string, limit: number = 10) {
  return useQuery({
    queryKey: polygonKeys.news(ticker),
    queryFn: () =>
      fetchPolygon<PolygonNewsResponse>(
        polygonEndpoints.tickerNews(ticker, limit)
      ),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketStatus() {
  return useQuery({
    queryKey: polygonKeys.marketStatus(),
    queryFn: () =>
      fetchPolygon<PolygonMarketStatus>(polygonEndpoints.marketStatus()),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useGainers() {
  return useQuery({
    queryKey: polygonKeys.gainers(),
    queryFn: () =>
      fetchPolygon<PolygonSnapshotResponse>(polygonEndpoints.snapshotGainers()),
    staleTime: 60 * 1000,
  });
}

export function useLosers() {
  return useQuery({
    queryKey: polygonKeys.losers(),
    queryFn: () =>
      fetchPolygon<PolygonSnapshotResponse>(polygonEndpoints.snapshotLosers()),
    staleTime: 60 * 1000,
  });
}
