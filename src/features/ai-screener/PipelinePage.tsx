import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassBadge,
  PageLoader,
} from '@/components/ui';
import { 
  useMethod1Stocks, 
  useMethod2Stocks, 
  usePipelineStats,
  useRefreshScreeningResults,
} from '@/hooks/useScreeningResults';
import {
  GitBranch,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Sparkles,
  Target,
  Shield,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export function PipelinePage() {
  const { data: method1Stocks = [], isLoading: m1Loading } = useMethod1Stocks();
  const { data: method2Stocks = [], isLoading: m2Loading } = useMethod2Stocks();
  const { data: pipelineStats, isLoading: statsLoading } = usePipelineStats();
  const { refresh } = useRefreshScreeningResults();

  const isLoading = m1Loading || m2Loading || statsLoading;

  // Determine step status based on real data
  const getStepStatus = (passed: number, total: number): 'completed' | 'running' | 'pending' => {
    if (total === 0) return 'pending';
    if (passed > 0) return 'completed';
    return 'running';
  };

  const method1Steps = React.useMemo(() => [
    {
      id: 'm1-1',
      name: 'Pre-Market Scan',
      description: 'Liquidity, volume, gap, and ATR checks',
      time: '8:45 AM ET',
      status: getStepStatus(pipelineStats?.method1.liquidityPassed || 0, pipelineStats?.method1.total || 0),
      stocksIn: 10000, // Initial universe
      stocksOut: pipelineStats?.method1.liquidityPassed || 0,
      icon: Activity,
    },
    {
      id: 'm1-2',
      name: 'AI News Analysis',
      description: 'Claude analyzes catalysts and news sentiment',
      time: '9:15 AM ET',
      status: getStepStatus(pipelineStats?.method1.catalystPassed || 0, pipelineStats?.method1.liquidityPassed || 0),
      stocksIn: pipelineStats?.method1.volatilityPassed || 0,
      stocksOut: pipelineStats?.method1.catalystPassed || 0,
      icon: Sparkles,
    },
    {
      id: 'm1-3',
      name: 'Technical Filter',
      description: 'VWAP, ORB, and setup validation',
      time: '9:35 AM ET',
      status: getStepStatus(pipelineStats?.method1.finalPassed || 0, pipelineStats?.method1.catalystPassed || 0),
      stocksIn: pipelineStats?.method1.catalystPassed || 0,
      stocksOut: pipelineStats?.method1.finalPassed || 0,
      icon: TrendingUp,
    },
  ], [pipelineStats]);

  const method2Steps = React.useMemo(() => [
    {
      id: 'm2-1',
      name: 'Gate 1: Universe',
      description: 'Pre-market universe filtering',
      time: '8:45 AM ET',
      status: getStepStatus(pipelineStats?.method2.gate1Passed || 0, pipelineStats?.method2.total || 0),
      stocksIn: 10000,
      stocksOut: pipelineStats?.method2.gate1Passed || 0,
      icon: Target,
    },
    {
      id: 'm2-2',
      name: 'Gate 2: Technical',
      description: 'Technical alignment check',
      time: '9:25 AM ET',
      status: getStepStatus(pipelineStats?.method2.gate2Passed || 0, pipelineStats?.method2.gate1Passed || 0),
      stocksIn: pipelineStats?.method2.gate1Passed || 0,
      stocksOut: pipelineStats?.method2.gate2Passed || 0,
      icon: TrendingUp,
    },
    {
      id: 'm2-3',
      name: 'Gate 3: Execution',
      description: 'Real-time execution criteria',
      time: '9:35-11:00 AM',
      status: getStepStatus(pipelineStats?.method2.gate3Passed || 0, pipelineStats?.method2.gate2Passed || 0),
      stocksIn: pipelineStats?.method2.gate2Passed || 0,
      stocksOut: pipelineStats?.method2.gate3Passed || 0,
      icon: Activity,
    },
    {
      id: 'm2-4',
      name: 'Gate 4: Risk',
      description: 'Position sizing and risk validation',
      time: 'On Pass',
      status: getStepStatus(pipelineStats?.method2.gate4Passed || 0, pipelineStats?.method2.gate3Passed || 0),
      stocksIn: pipelineStats?.method2.gate3Passed || 0,
      stocksOut: pipelineStats?.method2.allGatesPassed || 0,
      icon: Shield,
    },
  ], [pipelineStats]);

  if (isLoading) {
    return <PageLoader message="Loading pipeline data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/app/ai-screener"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-purple-400" />
            Screening Pipeline
          </h1>
          <p className="text-slate-400">
            Dual-method screening process running in parallel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </GlassButton>
          <GlassBadge variant={method1Stocks.length > 0 || method2Stocks.length > 0 ? 'success' : 'default'}>
            <span className={cn(
              'w-2 h-2 rounded-full mr-2',
              method1Stocks.length > 0 || method2Stocks.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            )} />
            {method1Stocks.length > 0 || method2Stocks.length > 0 ? 'Pipeline Active' : 'Waiting for Data'}
          </GlassBadge>
        </div>
      </div>

      {/* Pipeline Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Method 1 */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <GlassCardTitle>Method 1: Scanner-Based</GlassCardTitle>
                  <p className="text-sm text-slate-400">Sequential 3-step process</p>
                </div>
              </div>
              <GlassBadge variant="primary">LOCKS at 9:35</GlassBadge>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {method1Steps.map((step, index) => (
                <PipelineStepCard
                  key={step.id}
                  step={step}
                  isLast={index === method1Steps.length - 1}
                />
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Method 2 */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <GlassCardTitle>Method 2: GATE System</GlassCardTitle>
                  <p className="text-sm text-slate-400">4-gate continuous monitoring</p>
                </div>
              </div>
              <GlassBadge variant="info">Every 5 min</GlassBadge>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {method2Steps.map((step, index) => (
                <PipelineStepCard
                  key={step.id}
                  step={step}
                  isLast={index === method2Steps.length - 1}
                />
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Intersection Results */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <GlassCardTitle>Intersection Results (A+ Setups)</GlassCardTitle>
              <p className="text-sm text-slate-400">
                Stocks that passed BOTH methods receive highest priority
              </p>
            </div>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="glass-subtle rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-400">
                {pipelineStats?.method1.finalPassed || 0}
              </p>
              <p className="text-sm text-slate-400">Method 1 Passed</p>
            </div>
            <div className="glass-subtle rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-400">
                {pipelineStats?.method2.allGatesPassed || 0}
              </p>
              <p className="text-sm text-slate-400">Method 2 Passed</p>
            </div>
            <div className="glass-subtle rounded-lg p-4 border border-emerald-500/30">
              <p className="text-3xl font-bold text-emerald-400">
                {pipelineStats?.intersection.inBothMethods || 0}
              </p>
              <p className="text-sm text-slate-400">A+ (Both Methods)</p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Schedule */}
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <GlassCardTitle>Daily Schedule (ET)</GlassCardTitle>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-slate-400 font-medium">Time</th>
                  <th className="text-left py-2 text-slate-400 font-medium">Function</th>
                  <th className="text-left py-2 text-slate-400 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-2 font-mono text-blue-400">8:45 AM</td>
                  <td className="py-2">method1-step1 + method2-gate1</td>
                  <td className="py-2">Pre-market scans start</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 font-mono text-blue-400">9:15 AM</td>
                  <td className="py-2">method1-step2</td>
                  <td className="py-2">AI news scoring</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 font-mono text-blue-400">9:25 AM</td>
                  <td className="py-2">method2-gate2</td>
                  <td className="py-2">Technical alignment check</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 font-mono text-emerald-400">9:35 AM</td>
                  <td className="py-2">method1-step3 (LOCKS)</td>
                  <td className="py-2">Technical filter - Method 1 locks</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 font-mono text-purple-400">9:35-11:00</td>
                  <td className="py-2">method2-gate3 + intersection</td>
                  <td className="py-2">Execution filter (every 5 min)</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-amber-400">On Pass</td>
                  <td className="py-2">method2-gate4</td>
                  <td className="py-2">Risk validation (event-driven)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  time: string;
  status: 'completed' | 'running' | 'pending' | 'error';
  stocksIn?: number;
  stocksOut?: number;
  icon: React.ElementType;
}

function PipelineStepCard({ step, isLast }: { step: PipelineStep; isLast: boolean }) {
  const Icon = step.icon;

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
    },
    running: {
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    pending: {
      icon: Clock,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      borderColor: 'border-slate-500/30',
    },
    error: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
    },
  };

  const config = statusConfig[step.status];
  const StatusIcon = config.icon;

  return (
    <div className="relative">
      {!isLast && (
        <div className={cn(
          'absolute left-5 top-12 bottom-0 w-0.5',
          step.status === 'completed' ? 'bg-emerald-500/30' : 'bg-slate-500/20'
        )} />
      )}

      <div className={cn(
        'relative flex items-start gap-4 p-4 rounded-lg border',
        config.bgColor,
        config.borderColor
      )}>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
          {step.status === 'running' ? (
            <Activity className={cn('w-5 h-5 animate-pulse', config.color)} />
          ) : (
            <StatusIcon className={cn('w-5 h-5', config.color)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-white">{step.name}</h4>
            <span className="text-xs text-slate-500">{step.time}</span>
          </div>
          <p className="text-sm text-slate-400 mb-2">{step.description}</p>

          {(step.stocksIn !== undefined || step.stocksOut !== undefined) && (
            <div className="flex items-center gap-4 text-xs">
              {step.stocksIn !== undefined && (
                <span className="text-slate-500">
                  In: <span className="text-white">{step.stocksIn.toLocaleString()}</span>
                </span>
              )}
              {step.stocksOut !== undefined && (
                <span className="text-slate-500">
                  Out: <span className={config.color}>{step.stocksOut.toLocaleString()}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PipelinePage;
