import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface Trade {
  id: string;
  ticker: string;
  companyName?: string;
  direction: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  stopLoss: number;
  targetPrice: number;
  target2Price?: number;
  setupType?: string;
  setupQuality?: string;
  entryNotes?: string;
  exitNotes?: string;
  status: 'OPEN' | 'CLOSED';
  sellPrice?: number;
  sellDate?: string;
  profit?: number;
  profitPercent?: number;
  rMultiple?: number;
  suggestedStockId?: string;
  screeningResultId?: string;
  currentPrice?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TradeInput {
  ticker: string;
  companyName?: string;
  direction: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  stopLoss: number;
  targetPrice: number;
  target2Price?: number;
  setupType?: string;
  setupQuality?: string;
  entryNotes?: string;
  suggestedStockId?: string;
  screeningResultId?: string;
}

export interface CloseTradeInput {
  id: string;
  sellPrice: number;
  sellDate: string;
  exitNotes?: string;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPL: number;
  avgWin: number;
  avgLoss: number;
  avgRMultiple: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  profitFactor: number;
}

export const tradeKeys = {
  all: ['trades'] as const,
  open: () => [...tradeKeys.all, 'open'] as const,
  closed: () => [...tradeKeys.all, 'closed'] as const,
  stats: () => [...tradeKeys.all, 'stats'] as const,
  detail: (id: string) => [...tradeKeys.all, id] as const,
  today: () => [...tradeKeys.all, 'today'] as const,
};

export function useOpenTrades() {
  return useQuery({
    queryKey: tradeKeys.open(),
    queryFn: async (): Promise<Trade[]> => {
      const response = await client.models.Trade.list({
        filter: { status: { eq: 'OPEN' } },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch open trades');
      }

      const trades = (response.data || []) as unknown as Trade[];
      return trades.sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime());
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useClosedTrades() {
  return useQuery({
    queryKey: tradeKeys.closed(),
    queryFn: async (): Promise<Trade[]> => {
      const response = await client.models.Trade.list({
        filter: { status: { eq: 'CLOSED' } },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch closed trades');
      }

      const trades = (response.data || []) as unknown as Trade[];
      return trades.sort((a, b) => new Date(b.sellDate || b.buyDate).getTime() - new Date(a.sellDate || a.buyDate).getTime());
    },
    staleTime: 60 * 1000,
  });
}

export function useTodayClosedTrades() {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: tradeKeys.today(),
    queryFn: async (): Promise<Trade[]> => {
      const response = await client.models.Trade.list({
        filter: {
          status: { eq: 'CLOSED' },
          sellDate: { eq: today },
        },
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch today\'s trades');
      }

      return (response.data || []) as unknown as Trade[];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useTradeStats() {
  const { data: closedTrades = [] } = useClosedTrades();

  return useQuery({
    queryKey: tradeKeys.stats(),
    queryFn: async (): Promise<TradeStats> => {
      const trades = closedTrades;
      
      if (trades.length === 0) {
        return {
          totalTrades: 0, wins: 0, losses: 0, winRate: 0,
          totalProfit: 0, totalLoss: 0, netPL: 0,
          avgWin: 0, avgLoss: 0, avgRMultiple: 0,
          largestWin: 0, largestLoss: 0,
          consecutiveWins: 0, consecutiveLosses: 0, profitFactor: 0,
        };
      }

      const wins = trades.filter(t => (t.profit || 0) > 0);
      const losses = trades.filter(t => (t.profit || 0) < 0);
      
      const totalProfit = wins.reduce((sum, t) => sum + (t.profit || 0), 0);
      const totalLoss = Math.abs(losses.reduce((sum, t) => sum + (t.profit || 0), 0));
      const netPL = totalProfit - totalLoss;
      
      const avgWin = wins.length > 0 ? totalProfit / wins.length : 0;
      const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
      const avgRMultiple = trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / trades.length;
      
      const largestWin = Math.max(...wins.map(t => t.profit || 0), 0);
      const largestLoss = Math.abs(Math.min(...losses.map(t => t.profit || 0), 0));
      
      let maxConsecutiveWins = 0, maxConsecutiveLosses = 0;
      let currentWins = 0, currentLosses = 0;
      
      const sortedTrades = [...trades].sort(
        (a, b) => new Date(a.sellDate || a.buyDate).getTime() - new Date(b.sellDate || b.buyDate).getTime()
      );
      
      for (const trade of sortedTrades) {
        if ((trade.profit || 0) > 0) {
          currentWins++;
          currentLosses = 0;
          maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
        } else if ((trade.profit || 0) < 0) {
          currentLosses++;
          currentWins = 0;
          maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
        }
      }
      
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

      return {
        totalTrades: trades.length,
        wins: wins.length,
        losses: losses.length,
        winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
        totalProfit, totalLoss, netPL,
        avgWin, avgLoss, avgRMultiple,
        largestWin, largestLoss,
        consecutiveWins: maxConsecutiveWins,
        consecutiveLosses: maxConsecutiveLosses,
        profitFactor,
      };
    },
    enabled: closedTrades.length >= 0,
    staleTime: 60 * 1000,
  });
}

export function useTradeById(id: string) {
  return useQuery({
    queryKey: tradeKeys.detail(id),
    queryFn: async (): Promise<Trade | null> => {
      const response = await client.models.Trade.get({ id });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch trade');
      }

      return response.data as unknown as Trade | null;
    },
    enabled: !!id,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TradeInput): Promise<Trade> => {
      const response = await client.models.Trade.create({
        ...input,
        status: 'OPEN',
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to create trade');
      }

      return response.data as unknown as Trade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.open() });
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Trade> & { id: string }): Promise<Trade> => {
      const response = await client.models.Trade.update(input);

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to update trade');
      }

      return response.data as unknown as Trade;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

export function useCloseTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CloseTradeInput): Promise<Trade> => {
      const currentTradeResponse = await client.models.Trade.get({ id: input.id });
      
      if (currentTradeResponse.errors || !currentTradeResponse.data) {
        throw new Error('Trade not found');
      }

      const currentTrade = currentTradeResponse.data as unknown as Trade;
      
      const profit = (input.sellPrice - currentTrade.buyPrice) * currentTrade.quantity;
      const profitPercent = ((input.sellPrice - currentTrade.buyPrice) / currentTrade.buyPrice) * 100;
      const riskPerShare = currentTrade.buyPrice - currentTrade.stopLoss;
      const rMultiple = riskPerShare > 0 ? (input.sellPrice - currentTrade.buyPrice) / riskPerShare : 0;

      const response = await client.models.Trade.update({
        id: input.id,
        status: 'CLOSED',
        sellPrice: input.sellPrice,
        sellDate: input.sellDate,
        exitNotes: input.exitNotes,
        profit,
        profitPercent,
        rMultiple,
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to close trade');
      }

      await client.models.TradeHistory.create({
        ticker: currentTrade.ticker,
        direction: currentTrade.direction,
        quantity: currentTrade.quantity,
        buyPrice: currentTrade.buyPrice,
        buyDate: currentTrade.buyDate,
        sellPrice: input.sellPrice,
        sellDate: input.sellDate,
        stopLoss: currentTrade.stopLoss,
        targetPrice: currentTrade.targetPrice,
        profit,
        profitPercent,
        rMultiple,
        setupType: currentTrade.setupType,
        setupQuality: currentTrade.setupQuality,
        entryNotes: currentTrade.entryNotes,
        exitNotes: input.exitNotes,
        wasWinner: profit > 0,
        tradeId: input.id,
      });

      return response.data as unknown as Trade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await client.models.Trade.delete({ id });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to delete trade');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}
