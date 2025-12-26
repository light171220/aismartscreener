# Cards & Stats Components

## 1. Overview

Card components are used throughout the application to display grouped information. This includes stock cards, trade cards, stat cards, and more.

## 2. Base Card Component

```tsx
// components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

## 3. Stock Card

```tsx
// components/data-display/StockCard.tsx
interface StockCardProps {
  ticker: string;
  companyName?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  catalyst?: string;
  setupType?: string;
  setupQuality?: string;
  onTrade?: () => void;
  onWatch?: () => void;
}

export function StockCard({
  ticker,
  companyName,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  catalyst,
  setupType,
  setupQuality,
  onTrade,
  onWatch,
}: StockCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{ticker}</CardTitle>
            {companyName && (
              <CardDescription className="truncate max-w-[200px]">
                {companyName}
              </CardDescription>
            )}
          </div>
          {setupQuality && (
            <Badge variant={setupQuality === 'A+' ? 'success' : 'default'}>
              {setupQuality}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          <Badge variant={isPositive ? 'success' : 'destructive'}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </Badge>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {volume && (
            <div>
              <span className="text-muted-foreground">Volume:</span>
              <span className="ml-1 font-medium">{formatVolume(volume)}</span>
            </div>
          )}
          {marketCap && (
            <div>
              <span className="text-muted-foreground">Mkt Cap:</span>
              <span className="ml-1 font-medium">{formatMarketCap(marketCap)}</span>
            </div>
          )}
          {setupType && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Setup:</span>
              <Badge variant="outline" className="ml-2">
                {setupType.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Catalyst */}
        {catalyst && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">Catalyst</p>
            <p className="text-sm truncate">{catalyst}</p>
          </div>
        )}
      </CardContent>
      
      {/* Actions */}
      {(onTrade || onWatch) && (
        <CardFooter className="gap-2">
          {onWatch && (
            <Button variant="outline" size="sm" onClick={onWatch}>
              <Star className="w-4 h-4 mr-1" />
              Watch
            </Button>
          )}
          {onTrade && (
            <Button size="sm" onClick={onTrade}>
              <TrendingUp className="w-4 h-4 mr-1" />
              Trade
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
```

## 4. Trade Card

```tsx
// components/data-display/TradeCard.tsx
interface TradeCardProps {
  trade: Trade;
  currentPrice?: number;
  onClose?: () => void;
  onEdit?: () => void;
}

export function TradeCard({ trade, currentPrice, onClose, onEdit }: TradeCardProps) {
  const unrealizedPL = currentPrice
    ? (currentPrice - trade.buyPrice) * trade.quantity
    : null;
  const unrealizedPLPct = currentPrice
    ? ((currentPrice - trade.buyPrice) / trade.buyPrice) * 100
    : null;
  
  const isProfit = (unrealizedPL ?? 0) >= 0;
  
  return (
    <Card className={cn(
      'border-l-4',
      isProfit ? 'border-l-green-500' : 'border-l-red-500'
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">{trade.ticker}</CardTitle>
            <CardDescription>
              {trade.quantity} shares @ ${trade.buyPrice.toFixed(2)}
            </CardDescription>
          </div>
          <Badge variant="outline">{trade.setupType?.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Price Levels */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Entry</p>
            <p className="font-bold">${trade.buyPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="font-bold">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : '...'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground text-red-500">Stop</p>
            <p className="font-bold text-red-500">
              ${trade.stopLoss.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground text-green-500">Target</p>
            <p className="font-bold text-green-500">
              ${trade.targetPrice.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Progress to Target */}
        {currentPrice && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Stop</span>
              <span>Entry</span>
              <span>Target</span>
            </div>
            <Progress
              value={calculateProgress(trade.stopLoss, currentPrice, trade.targetPrice)}
              className="h-2"
            />
          </div>
        )}
        
        {/* Unrealized P&L */}
        {unrealizedPL !== null && (
          <div className={cn(
            'rounded-lg p-3 text-center',
            isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
          )}>
            <p className="text-xs text-muted-foreground">Unrealized P&L</p>
            <p className={cn(
              'text-2xl font-bold',
              isProfit ? 'text-green-500' : 'text-red-500'
            )}>
              {isProfit ? '+' : ''}${unrealizedPL.toFixed(2)}
              <span className="text-sm ml-1">
                ({isProfit ? '+' : ''}{unrealizedPLPct?.toFixed(2)}%)
              </span>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2">
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />
            Close Trade
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

## 5. Stat Card

```tsx
// components/data-display/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: '',
    success: 'border-green-500/50 bg-green-500/5',
    destructive: 'border-red-500/50 bg-red-500/5',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
  };
  
  return (
    <Card className={cn('relative overflow-hidden', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={cn(
                'flex items-center',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500'
              )}>
                {trend === 'up' ? (
                  <ArrowUp className="w-3 h-3" />
                ) : trend === 'down' ? (
                  <ArrowDown className="w-3 h-3" />
                ) : null}
                {trendValue}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
      
      {/* Decorative gradient */}
      {variant !== 'default' && (
        <div className={cn(
          'absolute inset-x-0 bottom-0 h-1',
          variant === 'success' && 'bg-gradient-to-r from-green-500 to-green-400',
          variant === 'destructive' && 'bg-gradient-to-r from-red-500 to-red-400',
          variant === 'warning' && 'bg-gradient-to-r from-yellow-500 to-yellow-400'
        )} />
      )}
    </Card>
  );
}
```

## 6. Stats Grid

```tsx
// components/data-display/StatsGrid.tsx
interface StatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    variant?: 'default' | 'success' | 'destructive' | 'warning';
  }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Usage example
<StatsGrid
  stats={[
    {
      title: 'Total P&L',
      value: '$1,234.56',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'This month',
      variant: 'success',
    },
    {
      title: 'Win Rate',
      value: '68%',
      icon: <Target className="w-4 h-4" />,
      description: 'Last 30 trades',
      variant: 'success',
    },
    {
      title: 'Open Trades',
      value: 3,
      icon: <Activity className="w-4 h-4" />,
      description: '$5,420 invested',
    },
    {
      title: 'Avg R Multiple',
      value: '1.5R',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Target: ≥0.5R',
      variant: 'success',
    },
  ]}
/>
```

## 7. Empty State Card

```tsx
// components/data-display/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-12">
      {icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </Card>
  );
}

// Usage
<EmptyState
  icon={<FileText className="w-8 h-8 text-muted-foreground" />}
  title="No trades yet"
  description="Start tracking your trades by adding your first position."
  action={{
    label: 'Add Trade',
    onClick: () => setShowAddDialog(true),
  }}
/>
```

## 8. Loading Card Skeleton

```tsx
// components/data-display/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StockCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 9. GlassCard Component System

The glassmorphism card system provides frosted glass effects for a premium dark UI.

### Base GlassCard

```tsx
// components/ui/glass-card.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'solid' | 'gradient';
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>((
  { className, variant = 'default', hover = false, glow = false, padding = 'md', children, ...props },
  ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border transition-all duration-300',
        // Variant styles
        variant === 'default' && 'glass border-white/10',
        variant === 'subtle' && 'glass-subtle border-white/5',
        variant === 'solid' && 'bg-slate-800/90 border-slate-700/50',
        variant === 'gradient' && 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
        // Hover effect
        hover && 'hover:border-white/20 hover:bg-white/10 cursor-pointer',
        // Glow effect
        glow && 'shadow-lg shadow-blue-500/10',
        // Padding
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-4',
        padding === 'lg' && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
GlassCard.displayName = 'GlassCard';
```

### CSS Classes for Glass Effects

```css
/* styles/globals.css */

/* Main glass effect */
.glass {
  background: rgba(15, 23, 42, 0.7); /* slate-900 with opacity */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Subtle glass - lighter background */
.glass-subtle {
  background: rgba(30, 41, 59, 0.5); /* slate-800 with less opacity */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Input fields glass */
.glass-input {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-input:focus {
  border-color: rgba(59, 130, 246, 0.5); /* blue-500 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### GlassCard Variants

```tsx
// Stat Card with Glass Effect
export function GlassStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <GlassCard hover>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Icon className="w-4 h-4 text-blue-400" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {change !== undefined && (
          <span className={cn(
            'text-sm font-medium flex items-center',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-slate-400',
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </GlassCard>
  );
}

// Stock Card with Glass Effect
export function GlassStockCard({ stock }: { stock: AIScreeningResult }) {
  // Calculate average target price from target1 and target2
  const avgTargetPrice = stock.target1 && stock.target2
    ? (stock.target1 + stock.target2) / 2
    : stock.target1 || stock.target2 || null;
  
  // Calculate % growth from current price to average target
  const growthPercent = avgTargetPrice && stock.currentPrice
    ? ((avgTargetPrice - stock.currentPrice) / stock.currentPrice) * 100
    : null;
  
  return (
    <GlassCard hover padding="lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{stock.ticker}</h3>
          <p className="text-sm text-slate-400 truncate max-w-[150px]">
            {stock.companyName}
          </p>
        </div>
        <GlassBadge variant="success">
          <Sparkles className="w-3 h-3 mr-1" />
          {stock.setupQuality}
        </GlassBadge>
      </div>
      
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-mono font-bold text-white">
          ${stock.currentPrice?.toFixed(2)}
        </span>
        <span className={cn(
          'text-sm font-medium',
          stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
        </span>
      </div>
      
      {/* Average Target Price & Growth % */}
      {avgTargetPrice && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div>
            <p className="text-xs text-slate-400">Avg Target Price</p>
            <p className="text-lg font-mono font-bold text-emerald-400">
              ${avgTargetPrice.toFixed(2)}
            </p>
          </div>
          {growthPercent !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Potential Growth</p>
              <p className={cn(
                'text-lg font-bold flex items-center justify-end gap-1',
                growthPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                <TrendingUp className="w-4 h-4" />
                {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-slate-400">Entry</p>
          <p className="text-sm font-mono text-blue-400">
            ${stock.suggestedEntry?.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Stop</p>
          <p className="text-sm font-mono text-red-400">
            ${stock.suggestedStop?.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">R:R</p>
          <p className="text-sm font-mono text-emerald-400">
            {stock.riskRewardRatio?.toFixed(2)}:1
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

// Trade Card with Glass Effect
export function GlassTradeCard({ trade }: { trade: Trade }) {
  const pnlPercent = ((trade.currentPrice - trade.buyPrice) / trade.buyPrice) * 100;
  const isProfit = pnlPercent >= 0;
  
  return (
    <GlassCard 
      hover 
      className={cn(
        'border-l-4',
        isProfit ? 'border-l-emerald-500' : 'border-l-red-500'
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{trade.ticker}</h3>
          <p className="text-xs text-slate-400">
            {format(new Date(trade.buyDate), 'MMM d, yyyy')}
          </p>
        </div>
        <GlassBadge variant={trade.status === 'OPEN' ? 'primary' : 'default'}>
          {trade.status}
        </GlassBadge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400">Entry</p>
          <p className="text-white font-mono">${trade.buyPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current</p>
          <p className="text-white font-mono">${trade.currentPrice?.toFixed(2)}</p>
        </div>
      </div>
      
      <div className={cn(
        'p-3 rounded-xl text-center',
        isProfit ? 'bg-emerald-500/10' : 'bg-red-500/10'
      )}>
        <p className="text-xs text-slate-400 mb-1">P&L</p>
        <p className={cn(
          'text-xl font-bold font-mono',
          isProfit ? 'text-emerald-400' : 'text-red-400'
        )}>
          {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
        </p>
      </div>
    </GlassCard>
  );
}

// Feature Card for Landing Page
export function GlassFeatureCard({ 
  icon: Icon, 
  title, 
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient?: string;
}) {
  return (
    <GlassCard hover className="group">
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
        gradient || 'bg-gradient-to-br from-blue-500 to-purple-600'
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </GlassCard>
  );
}

// Admin Stat Card
export function AdminStatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}) {
  const iconColors = {
    default: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-amber-500/20 text-amber-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    danger: 'bg-red-500/20 text-red-400',
  };
  
  return (
    <GlassCard>
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-xl', iconColors[variant])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </GlassCard>
  );
}
```

### Glass Card Grid Layout

```tsx
// Example: Dashboard Stats Row
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <GlassStatCard
    title="Total P&L"
    value="$12,458"
    change={15.3}
    trend="up"
    icon={DollarSign}
  />
  <GlassStatCard
    title="Win Rate"
    value="68%"
    change={5}
    trend="up"
    icon={TrendingUp}
  />
  <GlassStatCard
    title="Open Positions"
    value={3}
    icon={Activity}
  />
  <GlassStatCard
    title="Today's Picks"
    value={8}
    icon={Sparkles}
  />
</div>
```

---

## 10. Planned Features

### Price Range Data for GlassStockCard

Upcoming enhancement to display historical price ranges for identified stocks on the dashboard.

#### Data Model Extension

```typescript
// types/screening.ts - Extended AIScreeningResult
interface AIScreeningResult {
  // ... existing fields ...
  
  // Price Range Data (Planned)
  priceRanges?: {
    days5: {
      low: number;
      high: number;
    };
    days30: {
      low: number;
      high: number;
    };
    weeks52: {
      low: number;
      high: number;
    };
  };
}
```

#### GlassStockCard with Price Ranges (Planned)

```tsx
// components/data-display/GlassStockCard.tsx - Extended version
export function GlassStockCard({ stock }: { stock: AIScreeningResult }) {
  // ... existing calculations ...
  
  // Calculate position within 52-week range
  const range52WeekPosition = stock.priceRanges?.weeks52 && stock.currentPrice
    ? ((stock.currentPrice - stock.priceRanges.weeks52.low) / 
       (stock.priceRanges.weeks52.high - stock.priceRanges.weeks52.low)) * 100
    : null;
  
  return (
    <GlassCard hover padding="lg">
      {/* ... existing header, price, target sections ... */}
      
      {/* Price Ranges Section */}
      {stock.priceRanges && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-400">Price Ranges</span>
          </div>
          
          <div className="space-y-3">
            {/* 5 Days Range */}
            <PriceRangeRow
              label="5D"
              low={stock.priceRanges.days5.low}
              high={stock.priceRanges.days5.high}
              current={stock.currentPrice}
            />
            
            {/* 30 Days Range */}
            <PriceRangeRow
              label="30D"
              low={stock.priceRanges.days30.low}
              high={stock.priceRanges.days30.high}
              current={stock.currentPrice}
            />
            
            {/* 52 Weeks Range */}
            <PriceRangeRow
              label="52W"
              low={stock.priceRanges.weeks52.low}
              high={stock.priceRanges.weeks52.high}
              current={stock.currentPrice}
              highlight
            />
          </div>
          
          {/* 52-Week Position Indicator */}
          {range52WeekPosition !== null && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>52W Low</span>
                <span>52W High</span>
              </div>
              <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full"
                  style={{ width: '100%' }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500"
                  style={{ left: `calc(${Math.min(Math.max(range52WeekPosition, 0), 100)}% - 6px)` }}
                />
              </div>
              <p className="text-center text-xs text-slate-400 mt-1">
                {range52WeekPosition.toFixed(0)}% of 52W range
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* ... existing trade levels grid ... */}
    </GlassCard>
  );
}
```

#### PriceRangeRow Component (Planned)

```tsx
// components/data-display/PriceRangeRow.tsx
interface PriceRangeRowProps {
  label: string;
  low: number;
  high: number;
  current?: number;
  highlight?: boolean;
}

export function PriceRangeRow({ label, low, high, current, highlight }: PriceRangeRowProps) {
  // Calculate where current price sits in the range
  const position = current 
    ? ((current - low) / (high - low)) * 100
    : null;
  
  // Determine if current is near low (buy zone) or near high (caution)
  const isNearLow = position !== null && position < 20;
  const isNearHigh = position !== null && position > 80;
  
  return (
    <div className={cn(
      'grid grid-cols-[40px_1fr_60px_60px] gap-2 items-center',
      highlight && 'p-2 -mx-2 rounded-lg bg-white/5'
    )}>
      <span className={cn(
        'text-xs font-medium',
        highlight ? 'text-blue-400' : 'text-slate-500'
      )}>
        {label}
      </span>
      
      {/* Visual Range Bar */}
      <div className="relative h-1.5 bg-slate-700/50 rounded-full">
        {position !== null && (
          <div 
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full',
              isNearLow && 'bg-emerald-400',
              isNearHigh && 'bg-red-400',
              !isNearLow && !isNearHigh && 'bg-blue-400'
            )}
            style={{ left: `calc(${Math.min(Math.max(position, 0), 100)}% - 4px)` }}
          />
        )}
      </div>
      
      {/* Low Price */}
      <div className="text-right">
        <p className="text-[10px] text-slate-500">Low</p>
        <p className="text-xs font-mono text-red-400">${low.toFixed(2)}</p>
      </div>
      
      {/* High Price */}
      <div className="text-right">
        <p className="text-[10px] text-slate-500">High</p>
        <p className="text-xs font-mono text-emerald-400">${high.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

#### Lambda Integration Notes (Planned)

Price range data will be fetched from Polygon API during the screening process:

```typescript
// Lambda: method1-step2-news or dedicated price-enrichment function
// Polygon API endpoints:
// - /v2/aggs/ticker/{ticker}/range/1/day/{from}/{to} for daily aggregates
// - Calculate 5D, 30D ranges from daily bars
// - /v3/reference/tickers/{ticker} includes 52-week high/low

interface PolygonTickerDetails {
  ticker: string;
  // 52-week data from ticker details
  fifty_two_week_high: number;
  fifty_two_week_low: number;
}

interface PriceRangeEnrichment {
  ticker: string;
  priceRanges: {
    days5: { low: number; high: number };
    days30: { low: number; high: number };
    weeks52: { low: number; high: number };
  };
}
```

---

### AI-Identified Entry & Exit Prices for GlassStockCard

Upcoming enhancement to display AI-identified optimal entry and exit prices from the screening/filter process.

#### Data Model Extension

```typescript
// types/screening.ts - Extended AIScreeningResult
interface AIScreeningResult {
  // ... existing fields ...
  
  // AI-Identified Trade Levels (Planned)
  aiIdentifiedLevels?: {
    entryPrice: number;        // Optimal entry point identified by AI
    exitPrice: number;         // Target exit/take-profit price
    entryReason?: string;      // Why this entry was chosen (e.g., "Support bounce", "Breakout level")
    exitReason?: string;       // Why this exit was chosen (e.g., "Resistance level", "Fibonacci extension")
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';  // AI confidence in these levels
  };
}
```

#### GlassStockCard with AI Entry/Exit Prices (Planned)

```tsx
// components/data-display/GlassStockCard.tsx - Extended version
export function GlassStockCard({ stock }: { stock: AIScreeningResult }) {
  // ... existing calculations ...
  
  // Calculate potential profit from AI levels
  const aiProfitPercent = stock.aiIdentifiedLevels?.entryPrice && stock.aiIdentifiedLevels?.exitPrice
    ? ((stock.aiIdentifiedLevels.exitPrice - stock.aiIdentifiedLevels.entryPrice) / 
       stock.aiIdentifiedLevels.entryPrice) * 100
    : null;
  
  // Calculate distance from current price to entry
  const distanceToEntry = stock.aiIdentifiedLevels?.entryPrice && stock.currentPrice
    ? ((stock.aiIdentifiedLevels.entryPrice - stock.currentPrice) / stock.currentPrice) * 100
    : null;
  
  return (
    <GlassCard hover padding="lg">
      {/* ... existing header, price, target, price ranges sections ... */}
      
      {/* AI-Identified Entry & Exit Prices */}
      {stock.aiIdentifiedLevels && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-400">AI Trade Levels</span>
            </div>
            <GlassBadge 
              variant={stock.aiIdentifiedLevels.confidence === 'HIGH' ? 'success' : 
                       stock.aiIdentifiedLevels.confidence === 'MEDIUM' ? 'warning' : 'default'}
              size="sm"
            >
              {stock.aiIdentifiedLevels.confidence} Confidence
            </GlassBadge>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Entry Price */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownToLine className="w-3 h-3 text-blue-400" />
                <p className="text-xs text-slate-400">Entry Price</p>
              </div>
              <p className="text-lg font-mono font-bold text-blue-400">
                ${stock.aiIdentifiedLevels.entryPrice.toFixed(2)}
              </p>
              {stock.aiIdentifiedLevels.entryReason && (
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  {stock.aiIdentifiedLevels.entryReason}
                </p>
              )}
              {distanceToEntry !== null && (
                <p className={cn(
                  'text-xs mt-1',
                  distanceToEntry <= 0 ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {distanceToEntry <= 0 ? '✓ At/Below Entry' : `${distanceToEntry.toFixed(1)}% above current`}
                </p>
              )}
            </div>
            
            {/* Exit Price */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpFromLine className="w-3 h-3 text-emerald-400" />
                <p className="text-xs text-slate-400">Exit Price</p>
              </div>
              <p className="text-lg font-mono font-bold text-emerald-400">
                ${stock.aiIdentifiedLevels.exitPrice.toFixed(2)}
              </p>
              {stock.aiIdentifiedLevels.exitReason && (
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  {stock.aiIdentifiedLevels.exitReason}
                </p>
              )}
              {aiProfitPercent !== null && (
                <p className="text-xs text-emerald-400 mt-1">
                  +{aiProfitPercent.toFixed(1)}% potential
                </p>
              )}
            </div>
          </div>
          
          {/* Entry to Exit Visual */}
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Entry</span>
              <span>Current</span>
              <span>Exit</span>
            </div>
            <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
              {/* Progress bar from entry to exit */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                style={{ 
                  width: `${Math.min(Math.max(
                    ((stock.currentPrice - stock.aiIdentifiedLevels.entryPrice) / 
                     (stock.aiIdentifiedLevels.exitPrice - stock.aiIdentifiedLevels.entryPrice)) * 100
                  , 0), 100)}%` 
                }}
              />
              {/* Current price marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500"
                style={{ 
                  left: `calc(${Math.min(Math.max(
                    ((stock.currentPrice - stock.aiIdentifiedLevels.entryPrice) / 
                     (stock.aiIdentifiedLevels.exitPrice - stock.aiIdentifiedLevels.entryPrice)) * 100
                  , 0), 100)}% - 6px)` 
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* ... existing trade levels grid ... */}
    </GlassCard>
  );
}
```

#### Lambda Integration Notes (Planned)

Entry and exit prices will be identified during the screening process:

```typescript
// Lambda: method1-step3-technical or method2-gate3
// AI analysis determines optimal entry/exit based on:
// - Support/Resistance levels
// - VWAP, EMAs, key moving averages
// - Fibonacci retracements/extensions
// - Volume profile analysis
// - Historical price action patterns

interface AITradeLevelsOutput {
  ticker: string;
  aiIdentifiedLevels: {
    entryPrice: number;
    exitPrice: number;
    entryReason: string;   // e.g., "VWAP support + 9 EMA bounce"
    exitReason: string;    // e.g., "Previous day high resistance"
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    analysisFactors: string[];  // Factors considered in determination
  };
}

// Example output:
// {
//   ticker: "AAPL",
//   aiIdentifiedLevels: {
//     entryPrice: 178.50,
//     exitPrice: 185.25,
//     entryReason: "Gap fill + VWAP reclaim",
//     exitReason: "52-week high resistance",
//     confidence: "HIGH",
//     analysisFactors: ["VWAP", "Gap Analysis", "Volume Profile", "52W High"]
//   }
// }
```

---

### Last Closing Price for GlassStockCard

Upcoming enhancement to display the previous day's closing price for identified stocks on the dashboard.

#### Data Model Extension

```typescript
// types/screening.ts - Extended AIScreeningResult
interface AIScreeningResult {
  // ... existing fields ...
  
  // Last Closing Price (Planned)
  previousClose?: number;           // Previous day's closing price
  gapFromClose?: number;            // Current price - previous close
  gapFromClosePercent?: number;     // Gap percentage from previous close
}
```

#### GlassStockCard with Last Closing Price (Planned)

```tsx
// components/data-display/GlassStockCard.tsx - Extended version
export function GlassStockCard({ stock }: { stock: AIScreeningResult }) {
  // ... existing calculations ...
  
  return (
    <GlassCard hover padding="lg">
      {/* ... existing header, current price sections ... */}
      
      {/* Last Closing Price */}
      {stock.previousClose && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Prev Close</p>
              <p className="text-lg font-mono font-bold text-slate-300">
                ${stock.previousClose.toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Gap from Close */}
          {stock.gapFromClosePercent !== undefined && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Gap</p>
              <p className={cn(
                'text-lg font-bold flex items-center justify-end gap-1',
                stock.gapFromClosePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stock.gapFromClosePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stock.gapFromClosePercent >= 0 ? '+' : ''}{stock.gapFromClosePercent.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* ... existing sections ... */}
    </GlassCard>
  );
}
```

#### Compact Variant (Inline with Current Price)

```tsx
// Alternative: Inline display next to current price
<div className="flex items-baseline gap-2 mb-4">
  <span className="text-2xl font-mono font-bold text-white">
    ${stock.currentPrice?.toFixed(2)}
  </span>
  <span className={cn(
    'text-sm font-medium',
    stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
  )}>
    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
  </span>
  
  {/* Previous Close - Compact */}
  {stock.previousClose && (
    <span className="text-sm text-slate-500 ml-2">
      (Prev: ${stock.previousClose.toFixed(2)})
    </span>
  )}
</div>
```

#### Lambda Integration Notes (Planned)

Previous closing price will be fetched during the screening process:

```typescript
// Lambda: method1-step1-liquidity or method2-gate1
// Polygon API endpoint: /v2/aggs/ticker/{ticker}/prev

interface PolygonPrevClose {
  ticker: string;
  results: [{
    c: number;  // Close price
    h: number;  // High
    l: number;  // Low
    o: number;  // Open
    v: number;  // Volume
    t: number;  // Timestamp
  }];
}

interface PreviousCloseEnrichment {
  ticker: string;
  previousClose: number;
  gapFromClose: number;        // currentPrice - previousClose
  gapFromClosePercent: number; // ((current - prev) / prev) * 100
}

// Example output:
// {
//   ticker: "AAPL",
//   previousClose: 175.50,
//   gapFromClose: 3.25,
//   gapFromClosePercent: 1.85
// }
```

---

#### UI Placement Summary

The complete GlassStockCard structure with all planned features:

1. Header (ticker, company name, quality badge)
2. Current price & change %
3. **Last Closing Price & Gap %** ← Planned
4. Avg Target Price & Potential Growth % ✅ (implemented)
5. **Price Ranges (5D, 30D, 52W)** ← Planned
6. 52-Week Position Indicator ← Planned
7. **AI-Identified Entry & Exit Prices** ← Planned
8. Entry-to-Exit Progress Visual ← Planned
9. Trade levels grid (Entry, Stop, R:R)
