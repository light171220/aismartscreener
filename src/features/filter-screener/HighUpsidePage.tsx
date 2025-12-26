import * as React from 'react';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { useHighUpsideStocks, useRefreshFilteredStocks, type FilteredStock } from '@/hooks/useFilteredStocks';
import {
  Rocket,
  TrendingUp,
  Target,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  Users,
  AlertCircle,
} from 'lucide-react';

function Week52RangeIndicator({ position, low, high }: { position: number; low?: number; high?: number }) {
  return (
    <div className="w-28">
      <div className="h-1.5 bg-slate-700 rounded-full relative">
        <div 
          className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
          style={{ width: '100%' }}
        />
        <div 
          className="absolute w-2.5 h-2.5 bg-white rounded-full -top-0.5 border-2 border-slate-800 shadow-lg"
          style={{ left: `${Math.min(100, Math.max(0, position))}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      {low !== undefined && high !== undefined && (
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>${low.toFixed(0)}</span>
          <span>${high.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}

function StockRow({ stock }: { stock: FilteredStock }) {
  const isPositiveChange = (stock.changePercent || 0) >= 0;
  
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-colors border border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <div className="min-w-[80px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">{stock.ticker}</span>
            <GlassBadge variant="success" size="sm">
              +{stock.upsidePct?.toFixed(0)}%
            </GlassBadge>
          </div>
          <span className="text-sm text-slate-400 line-clamp-1">{stock.companyName}</span>
        </div>
        
        <div className="flex items-center gap-6 flex-1">
          <div className="text-right min-w-[90px]">
            <p className="font-mono text-white">{formatCurrency(stock.lastPrice)}</p>
            <p className={cn('text-sm', isPositiveChange ? 'text-emerald-400' : 'text-red-400')}>
              {isPositiveChange ? '+' : ''}{formatPercent(stock.changePercent || 0)}
            </p>
          </div>
          
          <div className="text-center min-w-[100px]">
            <p className="font-mono text-emerald-400">{formatCurrency(stock.avgTargetPrice || 0)}</p>
            <p className="text-xs text-slate-500">Avg Target</p>
          </div>
          
          <div className="text-center min-w-[80px]">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-white">{stock.numberOfAnalysts}</span>
            </div>
            <p className="text-xs text-slate-500">Analysts</p>
          </div>
          
          <div className="hidden lg:block">
            <Week52RangeIndicator 
              position={stock.week52RangePosition || 50}
              low={stock.week52Low}
              high={stock.week52High}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <GlassButton variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-1" />
          Details
        </GlassButton>
        <GlassButton variant="primary" size="sm">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          Trade
        </GlassButton>
      </div>
    </div>
  );
}

export function HighUpsidePage() {
  const { data: stocks, isLoading, error, refetch } = useHighUpsideStocks();
  const { refresh } = useRefreshFilteredStocks();

  if (isLoading) {
    return <PageLoader message="Loading high upside stocks..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">Failed to load stocks</p>
        <p className="text-slate-400 mt-2">{error.message}</p>
        <GlassButton onClick={() => refetch()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </GlassButton>
      </div>
    );
  }

  const totalStocks = stocks?.length || 0;
  const avgUpside = stocks && stocks.length > 0
    ? stocks.reduce((sum, s) => sum + (s.upsidePct || 0), 0) / stocks.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-8 h-8 text-emerald-400" />
            100%+ Upside Potential
          </h1>
          <p className="text-slate-400">
            Stocks with analyst targets suggesting doubling potential or more
          </p>
        </div>
        <GlassButton variant="outline" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </GlassButton>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalStocks}</p>
              <p className="text-xs text-slate-400">Total Stocks</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">+{avgUpside.toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Avg Upside</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%+</p>
              <p className="text-xs text-slate-400">Min Upside</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stocks && stocks.length > 0 
                  ? Math.round(stocks.reduce((sum, s) => sum + (s.numberOfAnalysts || 0), 0) / stocks.length)
                  : 0}
              </p>
              <p className="text-xs text-slate-400">Avg Analysts</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Stock List */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <GlassCardTitle>High Upside Opportunities</GlassCardTitle>
              <GlassCardDescription>
                Sorted by upside potential • Updated at 9:00 AM ET
              </GlassCardDescription>
            </div>
            <GlassBadge variant="success">
              {totalStocks} stocks
            </GlassBadge>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {!stocks || stocks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No high upside stocks found today</p>
              <p className="text-sm mt-2">Check back after the market opens</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stocks.map((stock) => (
                <StockRow key={stock.id} stock={stock} />
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default HighUpsidePage;
