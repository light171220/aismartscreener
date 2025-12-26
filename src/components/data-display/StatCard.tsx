import * as React from 'react';
import { cn, formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import { GlassCard } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  format?: 'currency' | 'percent' | 'number' | 'none';
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-blue-400',
  format = 'none',
  trend,
  loading = false,
  className,
}: StatCardProps) {
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return formatPercent(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  }, [value, format]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  if (loading) {
    return (
      <GlassCard className={cn('animate-pulse', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-8 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="h-10 w-10 bg-white/10 rounded-lg" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{formattedValue}</p>

          {}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={cn('w-4 h-4', trendColor)} />
              <span className={cn('text-sm font-medium', trendColor)}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}

          {}
          {subtitle && !change && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        {}
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center',
            iconColor
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

interface QuickStatsGridProps {
  stats: StatCardProps[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

export function QuickStatsGrid({ stats, loading = false, columns = 4 }: QuickStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MiniStat({ label, value, variant = 'default' }: MiniStatProps) {
  const variants = {
    default: 'text-white',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    destructive: 'text-red-400',
  };

  return (
    <div className="text-center">
      <p className={cn('text-lg font-bold', variants[variant])}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
