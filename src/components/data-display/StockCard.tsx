import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { GlassCard, GlassBadge, GlassButton } from '@/components/ui';
import type { AIScreeningResult, SetupQuality, SetupType, MarketTrend } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface StockCardProps {
  stock: AIScreeningResult;
  onViewDetails?: (stock: AIScreeningResult) => void;
  onTakeTrade?: (stock: AIScreeningResult) => void;
  compact?: boolean;
  className?: string;
}

export function StockCard({
  stock,
  onViewDetails,
  onTakeTrade,
  compact = false,
  className,
}: StockCardProps) {
  const isPositive = stock.changePercent >= 0;

  if (compact) {
    return (
      <GlassCard
        hover
        className={cn('cursor-pointer', className)}
        onClick={() => onViewDetails?.(stock)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{stock.ticker.slice(0, 2)}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{stock.ticker}</p>
              <p className="text-xs text-slate-500">{stock.companyName}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-white font-mono">{formatCurrency(stock.currentPrice)}</p>
            <p className={cn('text-sm', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {formatPercent(stock.changePercent)}
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={className}>
      {}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{stock.ticker.slice(0, 2)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{stock.ticker}</h3>
              {stock.inBothMethods && (
                <GlassBadge variant="success" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  A+
                </GlassBadge>
              )}
            </div>
            <p className="text-sm text-slate-400">{stock.companyName}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-white font-mono">
            {formatCurrency(stock.currentPrice)}
          </p>
          <div className={cn(
            'flex items-center justify-end gap-1',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">{formatPercent(stock.changePercent)}</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Setup Type</p>
          <SetupTypeBadge type={stock.setupType} />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Quality</p>
          <SetupQualityBadge quality={stock.setupQuality} />
        </div>
      </div>

      {}
      {(stock.suggestedEntry || stock.suggestedStop || stock.suggestedTarget1) && (
        <div className="glass-subtle rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {stock.suggestedEntry && (
              <div>
                <p className="text-xs text-slate-500">Entry</p>
                <p className="text-sm font-mono text-white">{formatCurrency(stock.suggestedEntry)}</p>
              </div>
            )}
            {stock.suggestedStop && (
              <div>
                <p className="text-xs text-slate-500">Stop</p>
                <p className="text-sm font-mono text-red-400">{formatCurrency(stock.suggestedStop)}</p>
              </div>
            )}
            {stock.suggestedTarget1 && (
              <div>
                <p className="text-xs text-slate-500">Target</p>
                <p className="text-sm font-mono text-emerald-400">{formatCurrency(stock.suggestedTarget1)}</p>
              </div>
            )}
          </div>
          {stock.riskRewardRatio && (
            <div className="mt-2 pt-2 border-t border-white/10 text-center">
              <span className="text-xs text-slate-500">R/R: </span>
              <span className="text-sm font-medium text-white">1:{stock.riskRewardRatio.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {}
      {stock.catalystDescription && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Catalyst</p>
          <p className="text-sm text-slate-300">{stock.catalystDescription}</p>
        </div>
      )}

      {}
      {(stock.spyTrend || stock.qqqTrend) && (
        <div className="flex items-center gap-4 mb-4">
          {stock.spyTrend && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">SPY:</span>
              <TrendBadge trend={stock.spyTrend} />
            </div>
          )}
          {stock.qqqTrend && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">QQQ:</span>
              <TrendBadge trend={stock.qqqTrend} />
            </div>
          )}
        </div>
      )}

      {}
      <div className="flex items-center gap-2 pt-4 border-t border-white/10">
        <GlassButton
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails?.(stock)}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </GlassButton>
        {onTakeTrade && (
          <GlassButton
            variant="success"
            size="sm"
            className="flex-1"
            onClick={() => onTakeTrade(stock)}
          >
            <Target className="w-4 h-4 mr-1" />
            Log Trade
          </GlassButton>
        )}
      </div>
    </GlassCard>
  );
}

interface SetupTypeBadgeProps {
  type?: SetupType;
}

export function SetupTypeBadge({ type }: SetupTypeBadgeProps) {
  if (!type) return <span className="text-slate-500">-</span>;

  const labels: Record<SetupType, string> = {
    VWAP_RECLAIM: 'VWAP Reclaim',
    VWAP_REJECTION: 'VWAP Rejection',
    ORB_BREAKOUT: 'ORB Breakout',
    HRV_PULLBACK: 'HRV Pullback',
    TREND_CONTINUATION: 'Trend Continuation',
    GAP_AND_GO: 'Gap & Go',
    TREND_PULLBACK: 'Trend Pullback',
    REVERSAL: 'Reversal',
    MOMENTUM: 'Momentum',
    OTHER: 'Other',
  };

  return (
    <GlassBadge variant="primary" size="sm">
      {labels[type] || type}
    </GlassBadge>
  );
}

interface SetupQualityBadgeProps {
  quality?: SetupQuality;
}

export function SetupQualityBadge({ quality }: SetupQualityBadgeProps) {
  if (!quality) return <span className="text-slate-500">-</span>;

  const config: Record<SetupQuality, { label: string; variant: 'success' | 'warning' | 'default' }> = {
    A_PLUS: { label: 'A+', variant: 'success' },
    A: { label: 'A', variant: 'success' },
    B: { label: 'B', variant: 'warning' },
    C: { label: 'C', variant: 'default' },
  };

  const { label, variant } = config[quality];

  return (
    <GlassBadge variant={variant} size="sm">
      {label}
    </GlassBadge>
  );
}

interface TrendBadgeProps {
  trend: MarketTrend;
}

export function TrendBadge({ trend }: TrendBadgeProps) {
  const config: Record<MarketTrend, { icon: typeof TrendingUp; variant: 'success' | 'destructive' | 'default' }> = {
    BULLISH: { icon: TrendingUp, variant: 'success' },
    BEARISH: { icon: TrendingDown, variant: 'destructive' },
    NEUTRAL: { icon: Shield, variant: 'default' },
  };

  const { icon: Icon, variant } = config[trend];

  return (
    <GlassBadge variant={variant} size="sm">
      <Icon className="w-3 h-3 mr-1" />
      {trend}
    </GlassBadge>
  );
}

export function StockCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <GlassCard className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-3 w-24 bg-white/10 rounded" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 w-16 bg-white/10 rounded ml-auto" />
            <div className="h-3 w-12 bg-white/10 rounded ml-auto" />
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-20 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 w-20 bg-white/10 rounded ml-auto" />
          <div className="h-4 w-14 bg-white/10 rounded ml-auto" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-8 bg-white/10 rounded" />
        <div className="h-8 bg-white/10 rounded" />
      </div>
      <div className="h-20 bg-white/10 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-white/10 rounded" />
        <div className="h-9 flex-1 bg-white/10 rounded" />
      </div>
    </GlassCard>
  );
}
