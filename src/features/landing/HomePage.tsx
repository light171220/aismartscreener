import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import { GlassCard, GlassButton, GlassBadge } from '@/components/ui';
import { GlassNavbar } from '@/components/layout/GlassNavbar';
import {
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  Brain,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  LineChart,
  Bot,
  Lock,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Dual-Method AI Screening',
    description: 'Two parallel screening methods validate each other. Only stocks passing both appear as top picks.',
    color: 'from-blue-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Real-Time Market Analysis',
    description: 'Pre-market scans at 8:45 AM ET, continuous validation checks every 5 minutes until 11:00 AM.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Target,
    title: 'Smart Entry & Exit Points',
    description: 'Calculated VWAP entries, ATR-based stops, and dual profit targets for every setup.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Shield,
    title: 'Risk Management Built-In',
    description: 'VIX monitoring, position sizing, and R:R validation before any trade suggestion.',
    color: 'from-red-500 to-pink-600',
  },
];

const capabilities = [
  {
    icon: LineChart,
    title: 'Method 1: Catalyst + Technical',
    items: [
      'Liquidity & volatility screening',
      'Catalyst detection (earnings, news, upgrades)',
      'Technical setup validation (VWAP, EMAs)',
      'Market alignment checks',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Method 2: 4-Gate System',
    items: [
      'Gate 1: Pre-market volume & gaps',
      'Gate 2: Technical confirmation',
      'Gate 3: Price action validation',
      'Gate 4: Risk management check',
    ],
  },
  {
    icon: Bot,
    title: 'AI Trade Assistant',
    items: [
      'Conversational trade analysis',
      'Setup quality explanations',
      'Risk assessment guidance',
      'Trade review & improvement',
    ],
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    items: [
      'Your trades stay private',
      'No data selling or sharing',
      'Secure AWS infrastructure',
      'Role-based access control',
    ],
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Auth state
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { isApproved, isLoading: accessLoading } = useUserAccess();
  const { isPending: hasPendingRequest, isRejected: hasRejectedRequest, isLoading: requestLoading } = useAccessRequest();
  
  const wasRevoked = searchParams.get('revoked') === 'true';
  const wasRejected = searchParams.get('rejected') === 'true';
  const [showRevokedBanner, setShowRevokedBanner] = React.useState(wasRevoked);
  const [showRejectedBanner, setShowRejectedBanner] = React.useState(wasRejected);

  const isLoading = authLoading || (isAuthenticated && (accessLoading || requestLoading));

  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute bottom-40 right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000" />
      </div>

      {/* Floating Glass Navbar */}
      <GlassNavbar
        isLoggedIn={isAuthenticated}
        isAdmin={isAdmin}
        userEmail={user?.email}
        userName={user?.name}
        hasApprovedAccess={isApproved}
        hasPendingRequest={hasPendingRequest}
        hasRejectedRequest={hasRejectedRequest}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      {/* Revoked Access Banner */}
      {showRevokedBanner && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium">Access Revoked</p>
                <p className="text-red-200 text-sm">Your access has been revoked. Please contact support if you believe this is an error.</p>
              </div>
              <button
                onClick={() => setShowRevokedBanner(false)}
                className="text-red-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Access Banner */}
      {showRejectedBanner && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
              <XCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium">Access Request Rejected</p>
                <p className="text-amber-200 text-sm">Your access request was not approved at this time. You may reapply after 30 days or contact support for more information.</p>
              </div>
              <button
                onClick={() => setShowRejectedBanner(false)}
                className="text-amber-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <GlassBadge variant="purple" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </GlassBadge>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Winning Trades
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Before the Market Opens
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            AI-powered dual-method stock screening identifies high-probability setups with calculated entry points, 
            stop losses, and profit targets. Trade smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              isAdmin ? (
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/admin')}
                  className="text-lg px-8 py-4"
                >
                  Admin Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GlassButton>
              ) : isApproved ? (
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/app')}
                  className="text-lg px-8 py-4"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GlassButton>
              ) : (hasPendingRequest || hasRejectedRequest) ? (
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/pending-approval')}
                  className="text-lg px-8 py-4"
                >
                  Check Request Status
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GlassButton>
              ) : (
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/request-access')}
                  className="text-lg px-8 py-4"
                >
                  Request Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GlassButton>
              )
            ) : (
              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleSignUp}
                className="text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlassButton>
            )}
            <GlassButton
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </GlassButton>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-white font-medium">Dual AI Methods</p>
              <p className="text-slate-400 text-sm">Cross-validated picks</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-medium">Smart Entries</p>
              <p className="text-slate-400 text-sm">Calculated levels</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-white font-medium">Pre-Market Scans</p>
              <p className="text-slate-400 text-sm">Ready at 8:45 AM ET</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-white font-medium">Risk Built-In</p>
              <p className="text-slate-400 text-sm">VIX & position sizing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GlassBadge variant="info" className="mb-4">Features</GlassBadge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Trade Smarter
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our dual-method AI screening system combines scanner-based analysis with a 4-gate validation system
              to identify only the highest probability setups.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-6 hover:bg-white/10 transition-colors group">
                <div className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform',
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GlassBadge variant="success" className="mb-4">How It Works</GlassBadge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              From Market Open to Trade Ready in Minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pre-Market Scan</h3>
              <p className="text-slate-400">
                At 8:45 AM ET, both methods simultaneously scan thousands of stocks for pre-market activity, volume spikes, and gaps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Dual Validation</h3>
              <p className="text-slate-400">
                Method 1 checks catalysts and technicals. Method 2 runs a 4-gate system. Only stocks passing both appear as picks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Trade Ready</h3>
              <p className="text-slate-400">
                Get entry price, stop loss, and two profit targets. Real-time updates as stocks pass additional validation checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <GlassBadge variant="warning" className="mb-4">Capabilities</GlassBadge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What's Under the Hood
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A comprehensive trading toolkit designed for serious day traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <GlassCard key={index} className="p-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <capability.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-4">{capability.title}</h3>
                <ul className="space-y-2">
                  {capability.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 md:p-12 text-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Better Trades?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Join our early access program and get AI-powered trade setups delivered before the market opens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                isAdmin ? (
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/admin')}
                    className="text-lg px-8"
                  >
                    Admin Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                ) : isApproved ? (
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/app')}
                    className="text-lg px-8"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                ) : (hasPendingRequest || hasRejectedRequest) ? (
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/pending-approval')}
                    className="text-lg px-8"
                  >
                    Check Request Status
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                ) : (
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/request-access')}
                    className="text-lg px-8"
                  >
                    Request Access
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                )
              ) : (
                <>
                  <GlassButton
                    variant="primary"
                    size="lg"
                    onClick={handleSignUp}
                    className="text-lg px-8"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="lg"
                    onClick={handleLogin}
                    className="text-lg"
                  >
                    Already have an account? Sign In
                  </GlassButton>
                </>
              )}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">AI SmartScreener</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} AI SmartScreener. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
          <p className="text-center text-slate-600 text-xs mt-8">
            Trading involves risk. This is not financial advice. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>

      {/* CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
