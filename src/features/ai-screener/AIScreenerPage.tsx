import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  GlassSearchInput,
  GlassSelect,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSelectContent,
  GlassSelectItem,
  GlassTableSkeleton,
  PageLoader,
} from '@/components/ui';
import { useAIScreeningResults, useRefreshScreeningResults, type AIScreeningResult } from '@/hooks/useScreeningResults';
import {
  Sparkles,
  GitBranch,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';

export function AIScreenerPage() {
  const { data: results = [], isLoading, error, refetch } = useAIScreeningResults();
  const { refresh } = useRefreshScreeningResults();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [qualityFilter, setQualityFilter] = React.useState<string>('all');
  const [methodFilter, setMethodFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'priority' | 'quality' | 'change'>('priority');
  const [selectedStock, setSelectedStock] = React.useState<AIScreeningResult | null>(null);

  const filteredResults = React.useMemo(() => {
    let filtered = [...results];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.ticker.toLowerCase().includes(query) ||
          r.companyName?.toLowerCase().includes(query)
      );
    }

    if (qualityFilter !== 'all') {
      filtered = filtered.filter((r) => r.setupQuality === qualityFilter);
    }

    if (methodFilter !== 'all') {
      if (methodFilter === 'both') {
        filtered = filtered.filter((r) => r.inBothMethods);
      } else if (methodFilter === 'method1') {
        filtered = filtered.filter((r) => r.inMethod1);
      } else if (methodFilter === 'method2') {
        filtered = filtered.filter((r) => r.inMethod2);
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priorityScore - a.priorityScore;
        case 'quality':
          const qualityOrder = { A_PLUS: 0, A: 1, B: 2, C: 3 };
          return (
            (qualityOrder[a.setupQuality as keyof typeof qualityOrder] || 4) -
            (qualityOrder[b.setupQuality as keyof typeof qualityOrder] || 4)
          );
        case 'change':
          return b.changePercent - a.changePercent;
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, searchQuery, qualityFilter, methodFilter, sortBy]);

  const handleRefresh = async () => {
    refresh();
    await refetch();
  };

  // Get last update time from results
  const lastUpdateTime = React.useMemo(() => {
    if (results.length === 0) return null;
    const times = results.map(r => r.screenTime).filter(Boolean);
    return times.length > 0 ? times[0] : null;
  }, [results]);

  if (isLoading) {
    return <PageLoader message="Loading AI screening results..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">Failed to load screening results</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">AI Screener Results</h1>
          <p className="text-slate-400 mt-1">
            Stocks identified by our dual-method AI screening system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/ai-screener/pipeline">
            <GlassButton variant="outline">
              <GitBranch className="w-4 h-4 mr-2" />
              View Pipeline
            </GlassButton>
          </Link>
          <GlassButton onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Stocks"
          value={results.length}
          icon={Sparkles}
          color="blue"
        />
        <StatsCard
          title="In Both Methods"
          value={results.filter((r) => r.inBothMethods).length}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="A+ Setups"
          value={results.filter((r) => r.setupQuality === 'A_PLUS').length}
          icon={Target}
          color="purple"
        />
        <StatsCard
          title="Last Updated"
          value={lastUpdateTime || 'N/A'}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-sm">
            <GlassSearchInput
              placeholder="Search by ticker or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <GlassSelect value={qualityFilter} onValueChange={setQualityFilter}>
              <GlassSelectTrigger className="w-36">
                <GlassSelectValue placeholder="Quality" />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="all">All Quality</GlassSelectItem>
                <GlassSelectItem value="A_PLUS">A+ Only</GlassSelectItem>
                <GlassSelectItem value="A">A Only</GlassSelectItem>
                <GlassSelectItem value="B">B Only</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>

            <GlassSelect value={methodFilter} onValueChange={setMethodFilter}>
              <GlassSelectTrigger className="w-36">
                <GlassSelectValue placeholder="Method" />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="all">All Methods</GlassSelectItem>
                <GlassSelectItem value="both">Both Methods</GlassSelectItem>
                <GlassSelectItem value="method1">Method 1</GlassSelectItem>
                <GlassSelectItem value="method2">Method 2</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>

            <GlassSelect value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <GlassSelectTrigger className="w-36">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <GlassSelectValue placeholder="Sort by" />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="priority">Priority Score</GlassSelectItem>
                <GlassSelectItem value="quality">Quality</GlassSelectItem>
                <GlassSelectItem value="change">% Change</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>
        </div>
      </GlassCard>

      {/* Results Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="glass-table-header">
                <th className="text-left p-4 text-sm font-medium text-slate-400">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Price</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Setup</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Catalyst</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Method</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">R:R</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  onView={() => setSelectedStock(stock)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No stocks found</h3>
            <p className="text-slate-400">
              {results.length === 0 
                ? 'Screening results will appear here after the market opens. Check back at 9:35 AM ET.'
                : 'Try adjusting your filters to see more results.'}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Stock Detail Dialog */}
      {selectedStock && (
        <StockDetailDialog
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-green-500',
    purple: 'from-purple-500 to-violet-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}

interface StockRowProps {
  stock: AIScreeningResult;
  onView: () => void;
}

function StockRow({ stock, onView }: StockRowProps) {
  const qualityConfig = {
    A_PLUS: { label: 'A+', variant: 'success' as const },
    A: { label: 'A', variant: 'success' as const },
    B: { label: 'B', variant: 'warning' as const },
    C: { label: 'C', variant: 'default' as const },
  };

  const quality = qualityConfig[stock.setupQuality as keyof typeof qualityConfig] || qualityConfig.C;
  const isPositive = stock.changePercent >= 0;

  return (
    <tr className="glass-table-row hover:bg-white/5 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stock.ticker}</span>
              <GlassBadge variant={quality.variant} size="sm">
                {quality.label}
              </GlassBadge>
            </div>
            <span className="text-sm text-slate-400">{stock.companyName}</span>
          </div>
        </div>
      </td>

      <td className="p-4">
        <div>
          <p className="font-mono text-white">{formatCurrency(stock.currentPrice)}</p>
          <p className={cn('text-sm flex items-center gap-1', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatPercent(stock.changePercent)}
          </p>
        </div>
      </td>

      <td className="p-4">
        <GlassBadge variant="primary" size="sm">
          {stock.setupType?.replace(/_/g, ' ')}
        </GlassBadge>
      </td>

      <td className="p-4">
        <div className="max-w-xs">
          <p className="text-sm text-white truncate">{stock.catalystDescription}</p>
          <p className="text-xs text-slate-500">{stock.catalystType?.replace(/_/g, ' ')}</p>
        </div>
      </td>

      <td className="p-4">
        <div className="flex gap-1">
          {stock.inBothMethods ? (
            <GlassBadge variant="purple" size="sm">Both</GlassBadge>
          ) : (
            <>
              {stock.inMethod1 && <GlassBadge variant="info" size="sm">M1</GlassBadge>}
              {stock.inMethod2 && <GlassBadge variant="info" size="sm">M2</GlassBadge>}
            </>
          )}
        </div>
      </td>

      <td className="p-4">
        <span className="font-mono text-white">
          1:{stock.riskRewardRatio?.toFixed(1) || 'N/A'}
        </span>
      </td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <GlassButton variant="ghost" size="icon-sm" onClick={onView}>
            <Eye className="w-4 h-4" />
          </GlassButton>
          <Link to={`/app/trades?ticker=${stock.ticker}&entry=${stock.suggestedEntry}&stop=${stock.suggestedStop}&target=${stock.suggestedTarget1}`}>
            <GlassButton variant="primary" size="sm">
              Trade
            </GlassButton>
          </Link>
        </div>
      </td>
    </tr>
  );
}

interface StockDetailDialogProps {
  stock: AIScreeningResult;
  onClose: () => void;
}

function StockDetailDialog({ stock, onClose }: StockDetailDialogProps) {
  const qualityConfig = {
    A_PLUS: { label: 'A+', variant: 'success' as const },
    A: { label: 'A', variant: 'success' as const },
    B: { label: 'B', variant: 'warning' as const },
    C: { label: 'C', variant: 'default' as const },
  };

  const quality = qualityConfig[stock.setupQuality as keyof typeof qualityConfig] || qualityConfig.C;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-2xl glass-modal p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{stock.ticker}</h2>
              <GlassBadge variant={quality.variant}>{quality.label}</GlassBadge>
              {stock.inBothMethods && (
                <GlassBadge variant="purple">Both Methods</GlassBadge>
              )}
            </div>
            <p className="text-slate-400">{stock.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>

        <div className="glass rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Current Price</p>
              <p className="text-xl font-mono font-bold text-white">{formatCurrency(stock.currentPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Change</p>
              <p className={cn('text-xl font-bold', stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {formatPercent(stock.changePercent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">SPY Trend</p>
              <GlassBadge variant={stock.spyTrend === 'BULLISH' ? 'success' : stock.spyTrend === 'BEARISH' ? 'destructive' : 'default'}>
                {stock.spyTrend}
              </GlassBadge>
            </div>
            <div>
              <p className="text-sm text-slate-400">QQQ Trend</p>
              <GlassBadge variant={stock.qqqTrend === 'BULLISH' ? 'success' : stock.qqqTrend === 'BEARISH' ? 'destructive' : 'default'}>
                {stock.qqqTrend}
              </GlassBadge>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">Setup Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-white">{stock.setupType?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quality:</span>
                <span className="text-white">{quality.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority Score:</span>
                <span className="text-white">{stock.priorityScore}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">Trade Levels</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Entry:</span>
                <span className="text-white font-mono">{formatCurrency(stock.suggestedEntry || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stop:</span>
                <span className="text-red-400 font-mono">{formatCurrency(stock.suggestedStop || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target 1:</span>
                <span className="text-emerald-400 font-mono">{formatCurrency(stock.suggestedTarget1 || 0)}</span>
              </div>
              {stock.suggestedTarget2 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target 2:</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(stock.suggestedTarget2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-slate-400">Risk/Reward:</span>
                <span className="text-white font-bold">1:{stock.riskRewardRatio?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-white mb-3">Catalyst</h3>
          <div className="flex items-start gap-3">
            <GlassBadge variant="info">{stock.catalystType?.replace(/_/g, ' ')}</GlassBadge>
            <p className="text-slate-300">{stock.catalystDescription}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <GlassButton variant="outline" onClick={onClose}>
            Close
          </GlassButton>
          <Link to={`/app/trades?ticker=${stock.ticker}&entry=${stock.suggestedEntry}&stop=${stock.suggestedStop}&target=${stock.suggestedTarget1}`}>
            <GlassButton variant="primary">
              Log Trade
            </GlassButton>
          </Link>
        </div>
      </div>
    </>
  );
}

export default AIScreenerPage;
