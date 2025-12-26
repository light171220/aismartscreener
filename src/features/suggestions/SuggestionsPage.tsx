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
  PageLoader,
} from '@/components/ui';
import { useHighUpsideStocks, useUndervaluedStocks } from '@/hooks/useFilteredStocks';
import { useBothMethodsResults } from '@/hooks/useScreeningResults';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  ArrowDownCircle, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export function SuggestionsPage() {
  const [activeTab, setActiveTab] = React.useState<'ai-picks' | 'high-upside' | 'undervalued'>('ai-picks');
  
  const { data: aiResults = [], isLoading: aiLoading, error: aiError } = useBothMethodsResults();
  const { data: highUpsideStocks = [], isLoading: highUpsideLoading, error: highUpsideError } = useHighUpsideStocks();
  const { data: undervaluedStocks = [], isLoading: undervaluedLoading, error: undervaluedError } = useUndervaluedStocks();

  const isLoading = aiLoading || highUpsideLoading || undervaluedLoading;
  const error = aiError || highUpsideError || undervaluedError;

  if (isLoading) return <PageLoader message="Loading trade suggestions..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-amber-400" />
          Trade Suggestions
        </h1>
        <p className="text-slate-400">
          Stocks identified by our screening systems
        </p>
      </div>

      {/* Disclaimer Banner */}
      <GlassCard className="border-amber-500/30 bg-amber-500/5">
        <GlassCardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium">Manual Trade Logging</p>
              <p className="text-sm text-amber-400/80 mt-1">
                This app does NOT execute trades. Review suggestions → Execute on your broker (Robinhood, TD Ameritrade, etc.) → Log your trade here for tracking.
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('ai-picks')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
            activeTab === 'ai-picks'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Sparkles className="w-4 h-4" />
          AI Picks (Both Methods)
          <GlassBadge variant="purple" size="sm">{aiResults.length}</GlassBadge>
        </button>
        <button
          onClick={() => setActiveTab('high-upside')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
            activeTab === 'high-upside'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <TrendingUp className="w-4 h-4" />
          High Upside (100%+)
          <GlassBadge variant="success" size="sm">{highUpsideStocks.length}</GlassBadge>
        </button>
        <button
          onClick={() => setActiveTab('undervalued')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
            activeTab === 'undervalued'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Undervalued
          <GlassBadge variant="info" size="sm">{undervaluedStocks.length}</GlassBadge>
        </button>
      </div>

      {/* Content */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <GlassCardTitle>
                {activeTab === 'ai-picks' && 'AI Screening Results'}
                {activeTab === 'high-upside' && '100%+ Upside Potential'}
                {activeTab === 'undervalued' && 'Undervalued Stocks'}
              </GlassCardTitle>
              <GlassCardDescription>
                {activeTab === 'ai-picks' && 'Stocks passing dual-method AI screening'}
                {activeTab === 'high-upside' && 'Stocks with analyst targets suggesting 100%+ upside'}
                {activeTab === 'undervalued' && 'Stocks trading below analyst low target'}
              </GlassCardDescription>
            </div>
            <Link to={
              activeTab === 'ai-picks' ? '/app/ai-screener' :
              activeTab === 'high-upside' ? '/app/filter-screener/high-upside' :
              '/app/filter-screener/undervalued'
            }>
              <GlassButton variant="outline" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </GlassButton>
            </Link>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-white">Error loading suggestions</p>
              <p className="text-slate-400 text-sm">{(error as Error).message}</p>
            </div>
          )}

          {!error && activeTab === 'ai-picks' && (
            aiResults.length === 0 ? (
              <EmptyState 
                icon={Sparkles}
                title="No AI picks yet"
                description="AI screening results appear at 9:35 AM ET when both methods identify qualifying stocks."
              />
            ) : (
              <div className="space-y-3">
                {aiResults.slice(0, 10).map((stock) => (
                  <SuggestionRow
                    key={stock.id}
                    ticker={stock.ticker}
                    companyName={stock.companyName}
                    price={stock.currentPrice}
                    change={stock.changePercent}
                    badge={stock.setupQuality || 'N/A'}
                    badgeVariant={stock.setupQuality === 'A_PLUS' ? 'success' : stock.setupQuality === 'A' ? 'success' : 'warning'}
                    subtext={stock.setupType?.replace(/_/g, ' ')}
                    entry={stock.suggestedEntry}
                    stop={stock.suggestedStop}
                    target={stock.suggestedTarget1}
                  />
                ))}
              </div>
            )
          )}

          {!error && activeTab === 'high-upside' && (
            highUpsideStocks.length === 0 ? (
              <EmptyState 
                icon={TrendingUp}
                title="No high upside stocks found"
                description="Stocks with 100%+ analyst upside targets will appear here."
              />
            ) : (
              <div className="space-y-3">
                {highUpsideStocks.slice(0, 10).map((stock) => (
                  <SuggestionRow
                    key={stock.id}
                    ticker={stock.ticker}
                    companyName={stock.companyName}
                    price={stock.lastPrice}
                    change={stock.changePercent}
                    badge={`+${stock.upsidePct?.toFixed(0)}%`}
                    badgeVariant="success"
                    subtext={`Target: ${formatCurrency(stock.avgTargetPrice || 0)}`}
                  />
                ))}
              </div>
            )
          )}

          {!error && activeTab === 'undervalued' && (
            undervaluedStocks.length === 0 ? (
              <EmptyState 
                icon={ArrowDownCircle}
                title="No undervalued stocks found"
                description="Stocks trading below analyst low targets will appear here."
              />
            ) : (
              <div className="space-y-3">
                {undervaluedStocks.slice(0, 10).map((stock) => (
                  <SuggestionRow
                    key={stock.id}
                    ticker={stock.ticker}
                    companyName={stock.companyName}
                    price={stock.lastPrice}
                    change={stock.changePercent}
                    badge={`-${stock.belowLowTargetPct?.toFixed(0)}%`}
                    badgeVariant="warning"
                    subtext={`Low Target: ${formatCurrency(stock.lowTargetPrice || 0)}`}
                  />
                ))}
              </div>
            )
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 mx-auto mb-4 text-slate-500" />
      <p className="text-white font-medium">{title}</p>
      <p className="text-slate-400 text-sm mt-2">{description}</p>
    </div>
  );
}

interface SuggestionRowProps {
  ticker: string;
  companyName?: string;
  price: number;
  change?: number;
  badge: string;
  badgeVariant: 'success' | 'warning' | 'info';
  subtext?: string;
  entry?: number;
  stop?: number;
  target?: number;
}

function SuggestionRow({ 
  ticker, 
  companyName, 
  price, 
  change, 
  badge, 
  badgeVariant, 
  subtext,
  entry,
  stop,
  target,
}: SuggestionRowProps) {
  const isPositive = (change || 0) >= 0;
  
  // Build trade URL with prefilled values
  const tradeUrl = entry && stop && target
    ? `/app/trades?ticker=${ticker}&entry=${entry}&stop=${stop}&target=${target}`
    : `/app/trades?ticker=${ticker}`;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
      <div className="flex items-center gap-4">
        <div className="min-w-[100px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{ticker}</span>
            <GlassBadge variant={badgeVariant} size="sm">
              {badge}
            </GlassBadge>
          </div>
          <span className="text-sm text-slate-400">{companyName || subtext}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {entry && stop && target && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div>
              <p className="text-slate-500">Entry</p>
              <p className="font-mono text-white">{formatCurrency(entry)}</p>
            </div>
            <div>
              <p className="text-slate-500">Stop</p>
              <p className="font-mono text-red-400">{formatCurrency(stop)}</p>
            </div>
            <div>
              <p className="text-slate-500">Target</p>
              <p className="font-mono text-emerald-400">{formatCurrency(target)}</p>
            </div>
          </div>
        )}

        <div className="text-right min-w-[80px]">
          <p className="font-mono text-white">{formatCurrency(price)}</p>
          {change !== undefined && (
            <p className={cn('text-sm', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {isPositive ? '+' : ''}{formatPercent(change)}
            </p>
          )}
        </div>

        <Link to={tradeUrl}>
          <GlassButton variant="primary" size="sm">
            Trade
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}

export default SuggestionsPage;
