import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSelectContent,
  GlassSelectItem,
  GlassDialog,
  GlassDialogTrigger,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
  PageLoader,
} from '@/components/ui';
import { 
  useOpenTrades, 
  useCreateTrade, 
  useCloseTrade,
  useUpdateTrade,
  useDeleteTrade,
  type Trade,
  type TradeInput,
} from '@/hooks/useTrades';
import { 
  LineChart, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  XCircle, 
  Target,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export function OpenTradesPage() {
  const [searchParams] = useSearchParams();
  const { data: trades = [], isLoading, error, refetch } = useOpenTrades();
  const createTrade = useCreateTrade();
  const closeTrade = useCloseTrade();
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();

  const [showNewTradeDialog, setShowNewTradeDialog] = React.useState(false);
  const [showCloseDialog, setShowCloseDialog] = React.useState(false);
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);

  // Pre-fill from URL params (from AI Screener)
  const prefillTicker = searchParams.get('ticker') || '';
  const prefillEntry = searchParams.get('entry') || '';
  const prefillStop = searchParams.get('stop') || '';
  const prefillTarget = searchParams.get('target') || '';

  // New trade form state
  const [newTradeForm, setNewTradeForm] = React.useState<TradeInput>({
    ticker: prefillTicker,
    direction: 'LONG',
    quantity: 1,
    buyPrice: prefillEntry ? parseFloat(prefillEntry) : 0,
    buyDate: new Date().toISOString().split('T')[0],
    stopLoss: prefillStop ? parseFloat(prefillStop) : 0,
    targetPrice: prefillTarget ? parseFloat(prefillTarget) : 0,
  });

  // Close trade form state
  const [closeForm, setCloseForm] = React.useState({
    sellPrice: 0,
    sellDate: new Date().toISOString().split('T')[0],
    exitNotes: '',
  });

  // Open new trade dialog if prefill data exists
  React.useEffect(() => {
    if (prefillTicker) {
      setNewTradeForm(prev => ({
        ...prev,
        ticker: prefillTicker,
        buyPrice: prefillEntry ? parseFloat(prefillEntry) : 0,
        stopLoss: prefillStop ? parseFloat(prefillStop) : 0,
        targetPrice: prefillTarget ? parseFloat(prefillTarget) : 0,
      }));
      setShowNewTradeDialog(true);
    }
  }, [prefillTicker, prefillEntry, prefillStop, prefillTarget]);

  const handleCreateTrade = async () => {
    try {
      await createTrade.mutateAsync(newTradeForm);
      setShowNewTradeDialog(false);
      setNewTradeForm({
        ticker: '',
        direction: 'LONG',
        quantity: 1,
        buyPrice: 0,
        buyDate: new Date().toISOString().split('T')[0],
        stopLoss: 0,
        targetPrice: 0,
      });
    } catch (err) {
      console.error('Failed to create trade:', err);
    }
  };

  const handleCloseTrade = async () => {
    if (!selectedTrade) return;
    
    try {
      await closeTrade.mutateAsync({
        id: selectedTrade.id,
        sellPrice: closeForm.sellPrice,
        sellDate: closeForm.sellDate,
        exitNotes: closeForm.exitNotes,
      });
      setShowCloseDialog(false);
      setSelectedTrade(null);
      setCloseForm({
        sellPrice: 0,
        sellDate: new Date().toISOString().split('T')[0],
        exitNotes: '',
      });
    } catch (err) {
      console.error('Failed to close trade:', err);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        await deleteTrade.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete trade:', err);
      }
    }
  };

  const openCloseDialog = (trade: Trade) => {
    setSelectedTrade(trade);
    setCloseForm({
      sellPrice: trade.currentPrice || trade.targetPrice || trade.buyPrice,
      sellDate: new Date().toISOString().split('T')[0],
      exitNotes: '',
    });
    setShowCloseDialog(true);
  };

  // Calculate P&L preview for close dialog
  const closePLPreview = React.useMemo(() => {
    if (!selectedTrade || !closeForm.sellPrice) return null;
    const profit = (closeForm.sellPrice - selectedTrade.buyPrice) * selectedTrade.quantity;
    const profitPercent = ((closeForm.sellPrice - selectedTrade.buyPrice) / selectedTrade.buyPrice) * 100;
    return { profit, profitPercent };
  }, [selectedTrade, closeForm.sellPrice]);

  const totalUnrealizedPL = trades.reduce((sum, t) => sum + (t.unrealizedPL || 0), 0);
  const totalExposure = trades.reduce((sum, t) => sum + (t.buyPrice * t.quantity), 0);

  if (isLoading) return <PageLoader message="Loading open trades..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">Failed to load trades</p>
        <p className="text-slate-400 mt-2">{(error as Error).message}</p>
        <GlassButton onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <LineChart className="w-8 h-8 text-emerald-400" />
            Open Trades
          </h1>
          <p className="text-slate-400">
            Track your active positions
          </p>
        </div>
        <div className="flex gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </GlassButton>
          <GlassButton variant="primary" onClick={() => setShowNewTradeDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log New Trade
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Open Positions</p>
          <p className="text-2xl font-bold text-white">{trades.length}</p>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Total Exposure</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(totalExposure)}
          </p>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Unrealized P&L</p>
          <p className={cn(
            'text-2xl font-bold',
            totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {totalUnrealizedPL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPL)}
          </p>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <p className="text-sm text-slate-400">Win / Loss</p>
          <p className="text-2xl font-bold text-white">
            <span className="text-emerald-400">{trades.filter(t => (t.unrealizedPL || 0) >= 0).length}</span>
            {' / '}
            <span className="text-red-400">{trades.filter(t => (t.unrealizedPL || 0) < 0).length}</span>
          </p>
        </GlassCard>
      </div>

      {/* Trades List */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Active Positions</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <LineChart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">No open trades</p>
              <p className="text-slate-400 mb-4">Log a trade to start tracking your positions</p>
              <GlassButton variant="primary" onClick={() => setShowNewTradeDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Trade
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <TradeRow 
                  key={trade.id} 
                  trade={trade} 
                  onClose={() => openCloseDialog(trade)}
                  onDelete={() => handleDeleteTrade(trade.id)}
                />
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* New Trade Dialog */}
      <GlassDialog open={showNewTradeDialog} onOpenChange={setShowNewTradeDialog}>
        <GlassDialogContent className="max-w-lg">
          <GlassDialogHeader>
            <GlassDialogTitle>Log New Trade</GlassDialogTitle>
            <GlassDialogDescription>
              Record a trade you've executed on your broker
            </GlassDialogDescription>
          </GlassDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Ticker</label>
                <GlassInput
                  placeholder="AAPL"
                  value={newTradeForm.ticker}
                  onChange={(e) => setNewTradeForm({ ...newTradeForm, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Direction</label>
                <GlassSelect
                  value={newTradeForm.direction}
                  onValueChange={(v) => setNewTradeForm({ ...newTradeForm, direction: v })}
                >
                  <GlassSelectTrigger>
                    <GlassSelectValue />
                  </GlassSelectTrigger>
                  <GlassSelectContent>
                    <GlassSelectItem value="LONG">Long</GlassSelectItem>
                    <GlassSelectItem value="SHORT">Short</GlassSelectItem>
                  </GlassSelectContent>
                </GlassSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Quantity</label>
                <GlassInput
                  type="number"
                  min="1"
                  value={newTradeForm.quantity}
                  onChange={(e) => setNewTradeForm({ ...newTradeForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Buy Price</label>
                <GlassInput
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTradeForm.buyPrice || ''}
                  onChange={(e) => setNewTradeForm({ ...newTradeForm, buyPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Stop Loss</label>
                <GlassInput
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTradeForm.stopLoss || ''}
                  onChange={(e) => setNewTradeForm({ ...newTradeForm, stopLoss: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Target Price</label>
                <GlassInput
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTradeForm.targetPrice || ''}
                  onChange={(e) => setNewTradeForm({ ...newTradeForm, targetPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Buy Date</label>
              <GlassInput
                type="date"
                value={newTradeForm.buyDate}
                onChange={(e) => setNewTradeForm({ ...newTradeForm, buyDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Entry Notes (optional)</label>
              <GlassTextarea
                placeholder="Setup type, reasoning, etc."
                value={newTradeForm.entryNotes || ''}
                onChange={(e) => setNewTradeForm({ ...newTradeForm, entryNotes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <GlassDialogFooter>
            <GlassButton variant="ghost" onClick={() => setShowNewTradeDialog(false)}>
              Cancel
            </GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={handleCreateTrade}
              loading={createTrade.isPending}
              disabled={!newTradeForm.ticker || !newTradeForm.buyPrice}
            >
              Log Trade
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      {/* Close Trade Dialog */}
      <GlassDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <GlassDialogContent>
          <GlassDialogHeader>
            <GlassDialogTitle>Close Trade - {selectedTrade?.ticker}</GlassDialogTitle>
            <GlassDialogDescription>
              Record the exit for this position
            </GlassDialogDescription>
          </GlassDialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Sell Price</label>
                <GlassInput
                  type="number"
                  step="0.01"
                  value={closeForm.sellPrice || ''}
                  onChange={(e) => setCloseForm({ ...closeForm, sellPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Sell Date</label>
                <GlassInput
                  type="date"
                  value={closeForm.sellDate}
                  onChange={(e) => setCloseForm({ ...closeForm, sellDate: e.target.value })}
                />
              </div>
            </div>

            {/* P&L Preview */}
            {closePLPreview && (
              <div className={cn(
                'p-4 rounded-lg',
                closePLPreview.profit >= 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
              )}>
                <p className="text-sm text-slate-400 mb-1">Estimated P&L</p>
                <p className={cn(
                  'text-2xl font-bold',
                  closePLPreview.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {closePLPreview.profit >= 0 ? '+' : ''}{formatCurrency(closePLPreview.profit)}
                  <span className="text-base ml-2">
                    ({formatPercent(closePLPreview.profitPercent)})
                  </span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-1">Exit Notes (optional)</label>
              <GlassTextarea
                placeholder="Reason for exit, lessons learned..."
                value={closeForm.exitNotes}
                onChange={(e) => setCloseForm({ ...closeForm, exitNotes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <GlassDialogFooter>
            <GlassButton variant="ghost" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </GlassButton>
            <GlassButton 
              variant="success" 
              onClick={handleCloseTrade}
              loading={closeTrade.isPending}
              disabled={!closeForm.sellPrice}
            >
              Close Trade
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>
    </div>
  );
}

interface TradeRowProps {
  trade: Trade;
  onClose: () => void;
  onDelete: () => void;
}

function TradeRow({ trade, onClose, onDelete }: TradeRowProps) {
  const isProfit = (trade.unrealizedPL || 0) >= 0;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
      {/* Stock Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{trade.ticker.slice(0, 2)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{trade.ticker}</h4>
            <GlassBadge variant="success" size="sm">{trade.direction}</GlassBadge>
            {trade.setupQuality && (
              <GlassBadge variant="primary" size="sm">{trade.setupQuality}</GlassBadge>
            )}
          </div>
          <p className="text-sm text-slate-400">
            {trade.quantity} shares @ {formatCurrency(trade.buyPrice)}
          </p>
        </div>
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-slate-500">Stop</p>
          <p className="text-sm font-mono text-red-400">{formatCurrency(trade.stopLoss)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Current</p>
          <p className="text-sm font-mono text-white">{formatCurrency(trade.currentPrice || trade.buyPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Target</p>
          <p className="text-sm font-mono text-emerald-400">{formatCurrency(trade.targetPrice)}</p>
        </div>
      </div>

      {/* P&L */}
      <div className="text-right">
        <div className={cn('flex items-center gap-1 justify-end', isProfit ? 'text-emerald-400' : 'text-red-400')}>
          {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-lg font-bold">
            {isProfit ? '+' : ''}{formatCurrency(trade.unrealizedPL || 0)}
          </span>
        </div>
        <p className={cn('text-sm', isProfit ? 'text-emerald-400' : 'text-red-400')}>
          {formatPercent(trade.unrealizedPLPercent || 0)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <GlassButton variant="ghost" size="icon-sm" onClick={onDelete} title="Delete trade">
          <Trash2 className="w-4 h-4 text-red-400" />
        </GlassButton>
        <GlassButton variant="success" size="sm" onClick={onClose}>
          Close Trade
        </GlassButton>
      </div>
    </div>
  );
}

export default OpenTradesPage;
