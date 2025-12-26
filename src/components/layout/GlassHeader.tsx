import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { cn, getMarketStatus, getCurrentETTime } from '@/lib/utils';
import { GlassButton, GlassBadge, GlassSearchInput } from '@/components/ui';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface GlassHeaderProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  notificationCount?: number;
}

export function GlassHeader({
  onMenuClick,
  isAdmin = false,
  user,
  notificationCount = 0,
}: GlassHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const marketStatus = getMarketStatus();
  const currentTime = getCurrentETTime();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const breadcrumbs = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];

    const labels: Record<string, string> = {
      app: 'Home',
      'ai-screener': 'AI Screener',
      pipeline: 'Pipeline',
      'filter-screener': 'Filter Screener',
      'high-upside': 'High Upside',
      undervalued: 'Undervalued',
      suggestions: 'Suggestions',
      trades: 'Open Trades',
      history: 'Trade History',
      assistant: 'AI Assistant',
      reviewer: 'Trade Reviewer',
      settings: 'Settings',
      admin: 'Admin',
    };

    let href = '';
    pathSegments.forEach((segment) => {
      href += `/${segment}`;
      crumbs.push({
        label: labels[segment] || segment,
        href,
      });
    });

    return crumbs;
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 h-16 glass-header">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {}
        <div className="flex items-center gap-4">
          {}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {}
        <div className="flex-1 max-w-xl mx-4 hidden lg:flex items-center gap-4">
          {}
          <div className="flex-1 relative">
            <GlassSearchInput
              placeholder="Search stocks, commands... (⌘K)"
              className="w-full"
              onFocus={() => setShowSearch(true)}
            />
          </div>

          {}
          <MarketStatusBadge status={marketStatus} time={currentTime} />
        </div>

        {}
        <div className="flex items-center gap-2">
          {}
          <button className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Search className="w-5 h-5" />
          </button>

          {}
          {isAdmin && (
            <Link to="/admin" className="hidden sm:block">
              <GlassButton variant="ghost" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </GlassButton>
            </Link>
          )}

          {}
          <div className="relative">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>

          {}
          <Link
            to="/app/settings"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all hidden sm:block"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </button>

            {}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 z-50 glass-modal rounded-xl p-2">
                  {}
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                    <p className="text-slate-400 text-sm">{user?.email || ''}</p>
                  </div>

                  {}
                  <Link
                    to="/app/profile"
                    className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-white/10 my-2" />

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface MarketStatusBadgeProps {
  status: 'pre-market' | 'open' | 'after-hours' | 'closed';
  time: string;
}

function MarketStatusBadge({ status, time }: MarketStatusBadgeProps) {
  const statusConfig = {
    'pre-market': {
      label: 'Pre-Market',
      variant: 'warning' as const,
      pulse: true,
    },
    open: {
      label: 'Market Open',
      variant: 'success' as const,
      pulse: true,
    },
    'after-hours': {
      label: 'After Hours',
      variant: 'info' as const,
      pulse: true,
    },
    closed: {
      label: 'Market Closed',
      variant: 'default' as const,
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <GlassBadge variant={config.variant}>
        <span
          className={cn(
            'w-2 h-2 rounded-full mr-2',
            config.variant === 'success' && 'bg-emerald-400',
            config.variant === 'warning' && 'bg-amber-400',
            config.variant === 'info' && 'bg-cyan-400',
            config.variant === 'default' && 'bg-slate-400',
            config.pulse && 'animate-pulse'
          )}
        />
        {config.label}
      </GlassBadge>
      <span className="text-xs text-slate-500">{time} ET</span>
    </div>
  );
}
