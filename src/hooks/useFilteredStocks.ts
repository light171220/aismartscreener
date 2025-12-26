import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface FilteredStock {
  id: string;
  ticker: string;
  companyName?: string;
  sector?: string;
  industry?: string;
  lastPrice: number;
  previousClose?: number;
  changePercent?: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  lowTargetPrice?: number;
  avgTargetPrice?: number;
  highTargetPrice?: number;
  numberOfAnalysts?: number;
  upsidePct?: number;
  belowLowTargetPct?: number;
  aboveHighTargetPct?: number;
  week52Low?: number;
  week52High?: number;
  week52RangePosition?: number;
  isHighUpside: boolean;
  isUndervalued: boolean;
  screenDate: string;
  screenTime?: string;
  dataSource?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const filteredStockKeys = {
  all: ['filtered-stocks'] as const,
  highUpside: (date?: string) => [...filteredStockKeys.all, 'high-upside', date] as const,
  undervalued: (date?: string) => [...filteredStockKeys.all, 'undervalued', date] as const,
  byTicker: (ticker: string) => [...filteredStockKeys.all, 'ticker', ticker] as const,
};

export function useHighUpsideStocks(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: filteredStockKeys.highUpside(screenDate),
    queryFn: async (): Promise<FilteredStock[]> => {
      const response = await client.models.FilteredStock.list({
        filter: {
          screenDate: { eq: screenDate },
          isHighUpside: { eq: true },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch high upside stocks');
      }

      const stocks = (response.data || []) as unknown as FilteredStock[];
      return stocks.sort((a, b) => (b.upsidePct || 0) - (a.upsidePct || 0));
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUndervaluedStocks(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: filteredStockKeys.undervalued(screenDate),
    queryFn: async (): Promise<FilteredStock[]> => {
      const response = await client.models.FilteredStock.list({
        filter: {
          screenDate: { eq: screenDate },
          isUndervalued: { eq: true },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch undervalued stocks');
      }

      const stocks = (response.data || []) as unknown as FilteredStock[];
      return stocks.sort((a, b) => (b.belowLowTargetPct || 0) - (a.belowLowTargetPct || 0));
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useAllFilteredStocks(date?: string) {
  const screenDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: [...filteredStockKeys.all, screenDate],
    queryFn: async (): Promise<FilteredStock[]> => {
      const response = await client.models.FilteredStock.list({
        filter: {
          screenDate: { eq: screenDate },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch filtered stocks');
      }

      return (response.data || []) as unknown as FilteredStock[];
    },
    staleTime: 60 * 1000,
  });
}

export function useFilteredStockByTicker(ticker: string) {
  return useQuery({
    queryKey: filteredStockKeys.byTicker(ticker),
    queryFn: async (): Promise<FilteredStock | null> => {
      const today = new Date().toISOString().split('T')[0];
      const response = await client.models.FilteredStock.list({
        filter: {
          ticker: { eq: ticker.toUpperCase() },
          screenDate: { eq: today },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch stock');
      }

      const stocks = response.data || [];
      return stocks.length > 0 ? (stocks[0] as unknown as FilteredStock) : null;
    },
    enabled: !!ticker,
    staleTime: 60 * 1000,
  });
}

export function useRefreshFilteredStocks() {
  const queryClient = useQueryClient();
  
  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: filteredStockKeys.all });
    },
  };
}
