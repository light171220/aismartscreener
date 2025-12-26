import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Trade {
  id: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  sellPrice?: number;
  sellDate?: string;
  stopLoss?: number;
  targetPrice?: number;
  setupType?: string;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
  profit?: number;
  profitPercent?: number;
  source: 'AI_SCREENER' | 'FILTER_SCREENER' | 'MANUAL';
}

interface TradeFilters {
  status?: 'OPEN' | 'CLOSED' | 'ALL';
  source?: Trade['source'] | 'ALL';
  dateRange?: { from: string; to: string };
  ticker?: string;
}

interface TradeState {
  trades: Trade[];
  filters: TradeFilters;
  selectedTradeId: string | null;
  isAddDialogOpen: boolean;
  isCloseDialogOpen: boolean;
  isEditDialogOpen: boolean;

  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  closeTrade: (id: string, sellPrice: number, sellDate: string) => void;
  deleteTrade: (id: string) => void;

  setFilters: (filters: TradeFilters) => void;
  clearFilters: () => void;

  setSelectedTradeId: (id: string | null) => void;
  setAddDialogOpen: (open: boolean) => void;
  setCloseDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;

  getFilteredTrades: () => Trade[];
  getOpenTrades: () => Trade[];
  getClosedTrades: () => Trade[];
  getTotalPL: () => number;
  getWinRate: () => number;
}

export const useTradeStore = create<TradeState>()(
  devtools(
    persist(
      (set, get) => ({
        trades: [],
        filters: { status: 'ALL', source: 'ALL' },
        selectedTradeId: null,
        isAddDialogOpen: false,
        isCloseDialogOpen: false,
        isEditDialogOpen: false,

        setTrades: (trades) => set({ trades }),

        addTrade: (trade) => set((state) => ({
          trades: [...state.trades, trade],
        })),

        updateTrade: (id, updates) => set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

        closeTrade: (id, sellPrice, sellDate) => set((state) => ({
          trades: state.trades.map((t) => {
            if (t.id !== id) return t;
            const profit = (sellPrice - t.buyPrice) * t.quantity;
            const profitPercent = ((sellPrice - t.buyPrice) / t.buyPrice) * 100;
            return {
              ...t,
              sellPrice,
              sellDate,
              status: 'CLOSED' as const,
              profit,
              profitPercent,
            };
          }),
        })),

        deleteTrade: (id) => set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        })),

        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

        clearFilters: () => set({
          filters: { status: 'ALL', source: 'ALL' },
        }),

        setSelectedTradeId: (id) => set({ selectedTradeId: id }),
        setAddDialogOpen: (open) => set({ isAddDialogOpen: open }),
        setCloseDialogOpen: (open) => set({ isCloseDialogOpen: open }),
        setEditDialogOpen: (open) => set({ isEditDialogOpen: open }),

        getFilteredTrades: () => {
          const { trades, filters } = get();
          return trades.filter((t) => {
            if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) {
              return false;
            }
            if (filters.source && filters.source !== 'ALL' && t.source !== filters.source) {
              return false;
            }
            if (filters.ticker && !t.ticker.toLowerCase().includes(filters.ticker.toLowerCase())) {
              return false;
            }
            if (filters.dateRange) {
              const tradeDate = new Date(t.buyDate);
              const from = new Date(filters.dateRange.from);
              const to = new Date(filters.dateRange.to);
              if (tradeDate < from || tradeDate > to) {
                return false;
              }
            }
            return true;
          });
        },

        getOpenTrades: () => get().trades.filter((t) => t.status === 'OPEN'),

        getClosedTrades: () => get().trades.filter((t) => t.status === 'CLOSED'),

        getTotalPL: () => {
          const closedTrades = get().getClosedTrades();
          return closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        },

        getWinRate: () => {
          const closedTrades = get().getClosedTrades();
          if (closedTrades.length === 0) return 0;
          const wins = closedTrades.filter((t) => (t.profit || 0) > 0).length;
          return (wins / closedTrades.length) * 100;
        },
      }),
      {
        name: 'trade-storage',
        partialize: (state) => ({ trades: state.trades }),
      }
    )
  )
);
