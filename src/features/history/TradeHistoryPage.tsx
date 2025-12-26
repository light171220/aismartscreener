import * as React from 'react';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { useClosedTrades, useTradeStats } from '@/hooks/useTrades';
import { 
  History, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Percent,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export function TradeHistoryPage() {
  const { data: trades = [], isLoading, error, refetch } = useClosedTrades();
  const { data: stats } = useTradeStats();

  const handleExportCSV = () => {
    if (trades.length === 0) return;

    const headers = ['Ticker', 'Buy Date', 'Buy Price', 'Sell Date', 'Sell Price', 'Quantity', 'Profit/Loss', 'Profit %', 'R-Multiple'];
    const rows = trades.map(t => [
      t.ticker,
      t.buyDate,
      t.buyPrice.toFixed(2),
      t.sellDate || '',
      t.sellPrice?.toFixed(2) || '',
      t.quantity.toString(),
      t.profit?.toFixed(2) || '',
      t.profitPercent?.toFixed(2) || '',
      t.rMultiple?.toFixed(2) || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trade-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) return <PageLoader message="Loading trade history..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">Failed to load trade history</p>
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
            <History className="w-8 h-8 text-amber-400" />
            Trade History
          </h1>
          <p className="text-slate-400">
            View and analyze your closed trades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </GlassButton>
          <GlassButton 
            variant="default" 
            size="sm" 
            onClick={handleExportCSV}
            disabled={trades.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.totalTrades || 0}</p>
              <p className="text-xs text-slate-400">Total Trades</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats?.winRate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-slate-400">Win Rate ({stats?.wins || 0}W / {stats?.losses || 0}L)</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              (stats?.netPL || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            )}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className={cn(
                'text-2xl font-bold',
                (stats?.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {(stats?.netPL || 0) >= 0 ? '+' : ''}{formatCurrency(stats?.netPL || 0)}
              </p>
              <p className="text-xs text-slate-400">Total P&L</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.avgRMultiple?.toFixed(2) || 0}R</p>
              <p className="text-xs text-slate-400">Avg R-Multiple</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Additional Stats */}
      {stats && stats.totalTrades > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="py-3 px-4">
            <p className="text-xs text-slate-400">Avg Win</p>
            <p className="text-lg font-bold text-emerald-400">+{formatCurrency(stats.avgWin)}</p>
          </GlassCard>
          <GlassCard className="py-3 px-4">
            <p className="text-xs text-slate-400">Avg Loss</p>
            <p className="text-lg font-bold text-red-400">-{formatCurrency(stats.avgLoss)}</p>
          </GlassCard>
          <GlassCard className="py-3 px-4">
            <p className="text-xs text-slate-400">Largest Win</p>
            <p className="text-lg font-bold text-emerald-400">+{formatCurrency(stats.largestWin)}</p>
          </GlassCard>
          <GlassCard className="py-3 px-4">
            <p className="text-xs text-slate-400">Profit Factor</p>
            <p className="text-lg font-bold text-white">{stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}</p>
          </GlassCard>
        </div>
      )}

      {/* Trades Table */}
      <GlassCard>
        <GlassCardHeader className="flex flex-row items-center justify-between">
          <GlassCardTitle>Closed Trades</GlassCardTitle>
          <GlassBadge variant="default">{trades.length} trades</GlassBadge>
        </GlassCardHeader>
        <GlassCardContent>
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">No closed trades yet</p>
              <p className="text-slate-400">Your trade history will appear here after you close positions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Ticker</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Buy Date</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Buy Price</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Sell Date</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Sell Price</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Qty</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">R-Multiple</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const isProfit = (trade.profit || 0) >= 0;
                    return (
                      <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{trade.ticker}</span>
                            {trade.setupQuality && (
                              <GlassBadge variant="primary" size="sm">{trade.setupQuality}</GlassBadge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(trade.buyDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white">
                          {formatCurrency(trade.buyPrice)}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {trade.sellDate ? new Date(trade.sellDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          }) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white">
                          {trade.sellPrice ? formatCurrency(trade.sellPrice) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {trade.quantity}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={cn('font-mono', isProfit ? 'text-emerald-400' : 'text-red-400')}>
                            {isProfit ? '+' : ''}{formatCurrency(trade.profit || 0)}
                          </div>
                          <div className={cn('text-xs', isProfit ? 'text-emerald-400' : 'text-red-400')}>
                            {formatPercent(trade.profitPercent || 0)}
                          </div>
                        </td>
                        <td className={cn(
                          'py-3 px-4 text-right font-mono',
                          (trade.rMultiple || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {(trade.rMultiple || 0) >= 0 ? '+' : ''}{trade.rMultiple?.toFixed(2) || '0.00'}R
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default TradeHistoryPage;
