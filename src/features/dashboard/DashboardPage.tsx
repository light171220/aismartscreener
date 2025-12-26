import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { cn, formatCurrency, formatPercent, formatRelativeTime, getMarketStatus } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { useHighUpsideStocks, useUndervaluedStocks } from '@/hooks/useFilteredStocks';
import { useOpenTrades, useTodayClosedTrades, useTradeStats } from '@/hooks/useTrades';
import { useBothMethodsResults } from '@/hooks/useScreeningResults';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Zap,
  RefreshCw,
  Rocket,
} from 'lucide-react';

// Auto-refresh hook for specific ET times
function useAutoRefresh() {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const checkRefreshTime = () => {
      const now = new Date();
      const etTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(now);

      const [hour, minute] = etTime.split(':').map(Number);

      // Refresh at 9:00, 9:35, 10:00, 10:30, 11:00 AM ET
      const refreshTimes = [
        [9, 0], [9, 35], [10, 0], [10, 30], [11, 0]
      ];

      if (refreshTimes.some(([h, m]) => h === hour && m === minute)) {
        queryClient.invalidateQueries();
        setLastRefresh(new Date());
      }
    };

    const interval = setInterval(checkRefreshTime, 60_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return { lastRefresh, refresh: () => {
    queryClient.invalidateQueries();
    setLastRefresh(new Date());
  }};
}

export function DashboardPage() {
  const marketStatus = getMarketStatus();
  const { lastRefresh, refresh } = useAutoRefresh();
  
  // Real data hooks
  const { data: highUpsideStocks = [], isLoading: highUpsideLoading } = useHighUpsideStocks();
  const { data: undervaluedStocks = [], isLoading: undervaluedLoading } = useUndervaluedStocks();
  const { data: openTrades = [], isLoading: openTradesLoading } = useOpenTrades();
  const { data: todayClosedTrades = [], isLoading: closedLoading } = useTodayClosedTrades();
  const { data: tradeStats } = useTradeStats();
  const { data: aiResults = [], isLoading: aiResultsLoading } = useBothMethodsResults();

  const isLoading = highUpsideLoading || undervaluedLoading || openTradesLoading || closedLoading || aiResultsLoading;

  // Calculate stats from real data
  const todayPL = todayClosedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalUnrealizedPL = openTrades.reduce((sum, t) => sum + (t.unrealizedPL || 0), 0);
  const winningTrades = todayClosedTrades.filter(t => (t.profit || 0) > 0).length;
  const winRate = todayClosedTrades.length > 0 ? (winningTrades / todayClosedTrades.length) * 100 : 0;

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Your trading overview and quick actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MarketStatusIndicator status={marketStatus} />
          <GlassButton variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </GlassButton>
          <Link to="/app/ai-screener">
            <GlassButton>
              <Sparkles className="w-4 h-4 mr-2" />
              View Screener
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's P&L"
          value={formatCurrency(todayPL)}
          change={todayClosedTrades.length > 0 ? `${todayClosedTrades.length} trades` : undefined}
          trend={todayPL >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatCard
          title="Open Trades"
          value={openTrades.length.toString()}
          subtitle={openTrades.length > 0 ? `${formatCurrency(totalUnrealizedPL)} unrealized` : 'No positions'}
          icon={Activity}
        />
        <StatCard
          title="Win Rate"
          value={todayClosedTrades.length > 0 ? `${winRate.toFixed(0)}%` : 'N/A'}
          subtitle="Today"
          trend={winRate >= 50 ? 'up' : winRate > 0 ? 'down' : undefined}
          icon={Target}
        />
        <StatCard
          title="Market Status"
          value={<MarketStatus />}
          icon={Clock}
        />
      </div>

      {/* Main Grid - AI Results + Open Trades */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's AI Picks */}
        <div className="lg:col-span-2">
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <GlassCardTitle>Today's AI Picks</GlassCardTitle>
                    <GlassCardDescription>
                      Stocks passing dual-method screening (9:35 AM)
                    </GlassCardDescription>
                  </div>
                </div>
                {aiResults.length > 0 && (
                  <GlassBadge variant="success">
                    <Zap className="w-3 h-3 mr-1" />
                    Live
                  </GlassBadge>
                )}
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {aiResults.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No AI screening results yet</p>
                  <p className="text-sm text-slate-500 mt-1">Results appear at 9:35 AM ET</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiResults.slice(0, 5).map((stock) => (
                    <ScreeningResultRow key={stock.id} stock={stock} />
                  ))}
                </div>
              )}
            </GlassCardContent>
            <GlassCardFooter className="justify-end">
              <Link to="/app/ai-screener">
                <GlassButton variant="ghost" size="sm">
                  View All Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlassButton>
              </Link>
            </GlassCardFooter>
          </GlassCard>
        </div>

        {/* Open Trades */}
        <div>
          <GlassCard className="h-full">
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <GlassCardTitle>Open Trades</GlassCardTitle>
                  <GlassCardDescription>
                    {openTrades.length} active position{openTrades.length !== 1 ? 's' : ''}
                  </GlassCardDescription>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {openTrades.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No open positions</p>
                  <Link to="/app/trades" className="mt-4 inline-block">
                    <GlassButton variant="outline" size="sm">
                      Log a Trade
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {openTrades.slice(0, 5).map((trade) => (
                    <OpenTradeRow key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </GlassCardContent>
            <GlassCardFooter className="justify-end">
              <Link to="/app/trades">
                <GlassButton variant="ghost" size="sm">
                  Manage Trades
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlassButton>
              </Link>
            </GlassCardFooter>
          </GlassCard>
        </div>
      </div>

      {/* Filter Screener Widgets */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Underrated Stocks Widget */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <GlassCardTitle>Underrated Stocks</GlassCardTitle>
                <GlassCardDescription>
                  Trading below analyst low target
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {undervaluedStocks.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No undervalued stocks found</p>
            ) : (
              <div className="space-y-3">
                {undervaluedStocks.slice(0, 5).map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-sm text-slate-400">{formatCurrency(stock.lastPrice)}</p>
                    </div>
                    <div className="text-right">
                      <GlassBadge variant="warning" size="sm">
                        -{stock.belowLowTargetPct?.toFixed(0)}% below
                      </GlassBadge>
                      <p className="text-xs text-slate-500 mt-1">
                        Target: {formatCurrency(stock.lowTargetPrice || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
          <GlassCardFooter className="justify-end">
            <Link to="/app/filter-screener/undervalued">
              <GlassButton variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </GlassCardFooter>
        </GlassCard>

        {/* 100%+ Upside Widget */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <GlassCardTitle>100%+ Upside Stocks</GlassCardTitle>
                <GlassCardDescription>
                  High target price potential
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {highUpsideStocks.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No high upside stocks found</p>
            ) : (
              <div className="space-y-3">
                {highUpsideStocks.slice(0, 5).map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-sm text-slate-400">{formatCurrency(stock.lastPrice)}</p>
                    </div>
                    <div className="text-right">
                      <GlassBadge variant="success" size="sm">
                        +{stock.upsidePct?.toFixed(0)}% upside
                      </GlassBadge>
                      <p className="text-xs text-slate-500 mt-1">
                        Target: {formatCurrency(stock.avgTargetPrice || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
          <GlassCardFooter className="justify-end">
            <Link to="/app/filter-screener/high-upside">
              <GlassButton variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </GlassCardFooter>
        </GlassCard>
      </div>

      {/* Today's Closed & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Closed Trades */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <GlassCardTitle>Today's Closed Trades</GlassCardTitle>
                <GlassCardDescription>
                  Realized P&L: {formatCurrency(todayPL)}
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {todayClosedTrades.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No trades closed today</p>
            ) : (
              <div className="space-y-3">
                {todayClosedTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-bold text-white">{trade.ticker}</p>
                      <p className="text-sm text-slate-400">
                        {trade.quantity} shares @ {formatCurrency(trade.buyPrice)} → {formatCurrency(trade.sellPrice || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-mono font-medium', (trade.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}{formatCurrency(trade.profit || 0)}
                      </p>
                      <p className={cn('text-sm', (trade.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatPercent(trade.profitPercent || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
          <GlassCardFooter className="justify-end">
            <Link to="/app/history">
              <GlassButton variant="ghost" size="sm">
                View History <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </GlassCardFooter>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Quick Actions</GlassCardTitle>
            <GlassCardDescription>Common tasks and shortcuts</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/app/trades">
                <GlassButton variant="outline" className="w-full justify-start h-auto py-3">
                  <Activity className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Log Trade</div>
                    <div className="text-xs text-slate-400">Record a new position</div>
                  </div>
                </GlassButton>
              </Link>
              <Link to="/app/ai-screener/pipeline">
                <GlassButton variant="outline" className="w-full justify-start h-auto py-3">
                  <Sparkles className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Pipeline</div>
                    <div className="text-xs text-slate-400">Screening status</div>
                  </div>
                </GlassButton>
              </Link>
              <Link to="/app/assistant">
                <GlassButton variant="outline" className="w-full justify-start h-auto py-3">
                  <Target className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">AI Assistant</div>
                    <div className="text-xs text-slate-400">Get trade advice</div>
                  </div>
                </GlassButton>
              </Link>
              <Link to="/app/history">
                <GlassButton variant="outline" className="w-full justify-start h-auto py-3">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Analytics</div>
                    <div className="text-xs text-slate-400">Performance stats</div>
                  </div>
                </GlassButton>
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Last refresh indicator */}
      <p className="text-xs text-slate-500 text-center">
        Last refresh: {formatRelativeTime(lastRefresh)} • Auto-refreshes at 9:00, 9:35, 10:00, 10:30, 11:00 AM ET
      </p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  change?: string;
  subtitle?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
}

function StatCard({ title, value, change, subtitle, trend, icon: Icon }: StatCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1 flex items-center gap-1',
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </p>
          )}
          {subtitle && !change && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </GlassCard>
  );
}

interface MarketStatusIndicatorProps {
  status: 'pre-market' | 'open' | 'after-hours' | 'closed';
}

function MarketStatusIndicator({ status }: MarketStatusIndicatorProps) {
  const config = {
    'pre-market': { label: 'Pre-Market', variant: 'warning' as const, pulse: true },
    open: { label: 'Market Open', variant: 'success' as const, pulse: true },
    'after-hours': { label: 'After Hours', variant: 'info' as const, pulse: true },
    closed: { label: 'Market Closed', variant: 'default' as const, pulse: false },
  };

  const { label, variant, pulse } = config[status];

  return (
    <GlassBadge variant={variant} pulse={pulse}>
      <span className={cn(
        'w-2 h-2 rounded-full mr-2',
        variant === 'success' && 'bg-emerald-400',
        variant === 'warning' && 'bg-amber-400',
        variant === 'info' && 'bg-cyan-400',
        variant === 'default' && 'bg-slate-400'
      )} />
      {label}
    </GlassBadge>
  );
}

function MarketStatus() {
  const status = getMarketStatus();
  const labels = {
    'pre-market': 'Pre-Market',
    open: 'Open',
    'after-hours': 'After Hours',
    closed: 'Closed',
  };
  return <span>{labels[status]}</span>;
}

interface ScreeningResultRowProps {
  stock: {
    id: string;
    ticker: string;
    companyName?: string;
    currentPrice: number;
    changePercent: number;
    setupQuality?: string;
    setupType?: string;
    inBothMethods: boolean;
  };
}

function ScreeningResultRow({ stock }: ScreeningResultRowProps) {
  const qualityConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
    A_PLUS: { label: 'A+', variant: 'success' },
    A: { label: 'A', variant: 'success' },
    B: { label: 'B', variant: 'warning' },
    C: { label: 'C', variant: 'default' },
  };

  const quality = qualityConfig[stock.setupQuality || 'C'] || qualityConfig.C;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{stock.ticker}</span>
            {stock.inBothMethods && (
              <GlassBadge variant="purple" size="sm">Both</GlassBadge>
            )}
          </div>
          <span className="text-sm text-slate-400">{stock.companyName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-white">{formatCurrency(stock.currentPrice)}</p>
          <p className={cn(
            'text-sm',
            stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatPercent(stock.changePercent)}
          </p>
        </div>
        <GlassBadge variant={quality.variant}>{quality.label}</GlassBadge>
      </div>
    </div>
  );
}

interface OpenTradeRowProps {
  trade: {
    id: string;
    ticker: string;
    buyPrice: number;
    currentPrice?: number;
    quantity: number;
    unrealizedPL?: number;
    unrealizedPLPercent?: number;
  };
}

function OpenTradeRow({ trade }: OpenTradeRowProps) {
  const isProfit = (trade.unrealizedPL || 0) >= 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
      <div>
        <p className="font-bold text-white">{trade.ticker}</p>
        <p className="text-sm text-slate-400">
          {trade.quantity} shares @ {formatCurrency(trade.buyPrice)}
        </p>
      </div>
      <div className="text-right">
        <p className={cn('font-mono font-medium', isProfit ? 'text-emerald-400' : 'text-red-400')}>
          {isProfit ? '+' : ''}{formatCurrency(trade.unrealizedPL || 0)}
        </p>
        <p className={cn('text-sm', isProfit ? 'text-emerald-400' : 'text-red-400')}>
          {formatPercent(trade.unrealizedPLPercent || 0)}
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
