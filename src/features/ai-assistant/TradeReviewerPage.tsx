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
import { useClosedTrades, useTradeStats, type Trade } from '@/hooks/useTrades';
import { useConversation } from '@/hooks/useConversation';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  XCircle,
  Brain,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface ScorecardGoal {
  name: string;
  target: string;
  current: string | number;
  passed: boolean;
}

export function TradeReviewerPage() {
  const { data: closedTrades = [], isLoading: tradesLoading, error, refetch } = useClosedTrades();
  const { data: stats, isLoading: statsLoading } = useTradeStats();
  const { messages, isLoading: aiLoading, sendMessage, clearConversation } = useConversation('TRADE_REVIEWER');
  
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [reviewType, setReviewType] = React.useState<'trade' | 'day' | null>(null);

  const isLoading = tradesLoading || statsLoading;

  // Get today's trades
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = closedTrades.filter(t => t.sellDate === today);
  
  // Calculate scorecard goals
  const scorecardGoals: ScorecardGoal[] = React.useMemo(() => {
    if (todayTrades.length === 0) {
      return [
        { name: 'Win Rate', target: '≥60%', current: 'N/A', passed: false },
        { name: 'Avg R', target: '≥1.5R', current: 'N/A', passed: false },
        { name: 'Max Loss', target: '≤-2R', current: 'N/A', passed: false },
        { name: 'Overtrades', target: '≤5', current: 0, passed: true },
      ];
    }

    const wins = todayTrades.filter(t => (t.profit || 0) > 0);
    const winRate = (wins.length / todayTrades.length) * 100;
    const avgR = todayTrades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / todayTrades.length;
    const maxLoss = Math.min(...todayTrades.map(t => t.rMultiple || 0), 0);

    return [
      { name: 'Win Rate', target: '≥60%', current: `${winRate.toFixed(0)}%`, passed: winRate >= 60 },
      { name: 'Avg R', target: '≥1.5R', current: `${avgR.toFixed(2)}R`, passed: avgR >= 1.5 },
      { name: 'Max Loss', target: '≤-2R', current: `${maxLoss.toFixed(2)}R`, passed: maxLoss >= -2 },
      { name: 'Overtrades', target: '≤5', current: todayTrades.length, passed: todayTrades.length <= 5 },
    ];
  }, [todayTrades]);

  // Generate AI review for a single trade
  const generateTradeReview = async (trade: Trade) => {
    setSelectedTrade(trade);
    setReviewType('trade');
    clearConversation();

    const isWinner = (trade.profit || 0) > 0;
    const prompt = `Please review this ${isWinner ? 'winning' : 'losing'} trade:

**Trade Details:**
- Ticker: ${trade.ticker}
- Direction: ${trade.direction}
- Entry: $${trade.buyPrice} on ${trade.buyDate}
- Exit: $${trade.sellPrice} on ${trade.sellDate}
- Quantity: ${trade.quantity} shares
- P&L: ${formatCurrency(trade.profit || 0)} (${formatPercent(trade.profitPercent || 0)})
- R-Multiple: ${(trade.rMultiple || 0).toFixed(2)}R
- Stop Loss: $${trade.stopLoss}
- Target: $${trade.targetPrice}
- Setup Type: ${trade.setupType || 'Not specified'}
- Setup Quality: ${trade.setupQuality || 'Not specified'}
${trade.entryNotes ? `- Entry Notes: ${trade.entryNotes}` : ''}
${trade.exitNotes ? `- Exit Notes: ${trade.exitNotes}` : ''}

Please analyze:
1. Was the entry well-timed?
2. Was the stop loss placement appropriate?
3. Did I follow my trading plan?
4. What did I do well?
5. What could I improve?`;

    await sendMessage(prompt);
  };

  // Generate AI review for the day
  const generateDaySummary = async () => {
    setSelectedTrade(null);
    setReviewType('day');
    clearConversation();

    if (todayTrades.length === 0) {
      await sendMessage('I have no closed trades today. Can you give me some general trading preparation tips for tomorrow?');
      return;
    }

    const wins = todayTrades.filter(t => (t.profit || 0) > 0).length;
    const losses = todayTrades.length - wins;
    const totalPL = todayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const avgR = todayTrades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / todayTrades.length;

    const tradesummary = todayTrades.map(t => 
      `- ${t.ticker}: ${(t.profit || 0) >= 0 ? '+' : ''}${formatCurrency(t.profit || 0)} (${(t.rMultiple || 0).toFixed(2)}R) - ${t.setupType || 'N/A'}`
    ).join('\n');

    const prompt = `Please review my trading day:

**Day Summary:**
- Total Trades: ${todayTrades.length}
- Wins/Losses: ${wins}W / ${losses}L (${((wins / todayTrades.length) * 100).toFixed(0)}% win rate)
- Total P&L: ${formatCurrency(totalPL)}
- Average R-Multiple: ${avgR.toFixed(2)}R

**Individual Trades:**
${tradesummary}

**Scorecard Results:**
${scorecardGoals.map(g => `- ${g.name}: ${g.current} (Target: ${g.target}) - ${g.passed ? '✓ PASSED' : '✗ FAILED'}`).join('\n')}

Please analyze:
1. Overall performance assessment
2. Patterns you notice (good or bad)
3. What I did well today
4. Areas for improvement
5. Specific recommendations for tomorrow`;

    await sendMessage(prompt);
  };

  if (isLoading) return <PageLoader message="Loading trade data..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white text-lg">Failed to load trade data</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Trade Reviewer
          </h1>
          <p className="text-slate-400">
            AI-powered analysis of your trading performance
          </p>
        </div>
        <GlassButton onClick={generateDaySummary} disabled={aiLoading}>
          {aiLoading && reviewType === 'day' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          Generate Day Summary
        </GlassButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Trades List & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4">
              <p className="text-sm text-slate-400">Total P&L</p>
              <p className={cn(
                'text-xl font-bold',
                (stats?.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {(stats?.netPL || 0) >= 0 ? '+' : ''}{formatCurrency(stats?.netPL || 0)}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-slate-400">Win Rate</p>
              <p className="text-xl font-bold text-white">{stats?.winRate?.toFixed(1) || 0}%</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-slate-400">Avg R-Multiple</p>
              <p className="text-xl font-bold text-white">{stats?.avgRMultiple?.toFixed(2) || 0}R</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-slate-400">Today's Trades</p>
              <p className="text-xl font-bold text-white">{todayTrades.length}</p>
            </GlassCard>
          </div>

          {/* Daily Scorecard */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Daily Scorecard
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {scorecardGoals.map((goal) => (
                  <div key={goal.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white">{goal.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'font-mono',
                        goal.passed ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {goal.current}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">({goal.target})</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Recent Trades */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Recent Closed Trades</GlassCardTitle>
              <GlassCardDescription>Click to review with AI</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              {closedTrades.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No closed trades yet</p>
                  <Link to="/app/trades" className="mt-4 inline-block">
                    <GlassButton variant="outline" size="sm">
                      Log a Trade
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {closedTrades.slice(0, 10).map((trade) => {
                    const isWinner = (trade.profit || 0) > 0;
                    const isSelected = selectedTrade?.id === trade.id;

                    return (
                      <button
                        key={trade.id}
                        onClick={() => generateTradeReview(trade)}
                        disabled={aiLoading}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg transition-all text-left',
                          isSelected
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            isWinner ? 'bg-emerald-500/20' : 'bg-red-500/20'
                          )}>
                            {isWinner ? (
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white">{trade.ticker}</p>
                            <p className="text-xs text-slate-400">{trade.sellDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'font-mono font-medium',
                            isWinner ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {isWinner ? '+' : ''}{formatCurrency(trade.profit || 0)}
                          </p>
                          <p className={cn(
                            'text-xs',
                            isWinner ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {(trade.rMultiple || 0).toFixed(2)}R
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Right Column - AI Review */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <GlassCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <GlassCardTitle>AI Analysis</GlassCardTitle>
                    <GlassCardDescription>
                      {reviewType === 'trade' && selectedTrade
                        ? `Reviewing ${selectedTrade.ticker} trade`
                        : reviewType === 'day'
                        ? 'Daily performance summary'
                        : 'Select a trade or generate a day summary'}
                    </GlassCardDescription>
                  </div>
                </div>
                {messages.length > 0 && (
                  <GlassButton variant="ghost" size="sm" onClick={clearConversation}>
                    Clear
                  </GlassButton>
                )}
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              {messages.length === 0 && !aiLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Brain className="w-16 h-16 text-slate-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Ready to Review</h3>
                  <p className="text-slate-400 max-w-md">
                    Click on a trade from the list to get a detailed AI review, or generate a day summary to see your overall performance analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {messages.filter(m => m.role === 'assistant').map((message) => (
                    <div key={message.id} className="glass rounded-lg p-4">
                      <FormattedReview content={message.content} />
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="glass rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function FormattedReview({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (line.startsWith('###')) {
          return <h4 key={index} className="text-md font-semibold text-white mt-4 mb-2">{line.replace(/^###\s*/, '')}</h4>;
        }
        if (line.startsWith('##')) {
          return <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>;
        }
        if (line.startsWith('#')) {
          return <h2 key={index} className="text-xl font-bold text-white mt-4 mb-2">{line.replace(/^#\s*/, '')}</h2>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={index} className="text-slate-300 ml-4 list-disc">{line.replace(/^[-•]\s*/, '')}</li>;
        }
        if (/^\d+\.\s/.test(line)) {
          return <li key={index} className="text-slate-300 ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="text-white font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-slate-300">{line}</p>;
      })}
    </div>
  );
}

export default TradeReviewerPage;
