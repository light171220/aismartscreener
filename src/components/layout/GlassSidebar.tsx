import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassBadge } from '@/components/ui';
import { useFeatureAccess, FeatureId } from '@/hooks/useFeatureAccess';
import {
  LayoutDashboard,
  Sparkles,
  GitBranch,
  Filter,
  TrendingUp,
  ArrowDownCircle,
  Lightbulb,
  LineChart,
  History,
  MessageSquare,
  ClipboardCheck,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  feature?: FeatureId;
  badge?: number | string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app', icon: LayoutDashboard, feature: 'dashboard' },
    ],
  },
  {
    title: 'AI Screening',
    items: [
      {
        label: 'AI Screener',
        href: '/app/ai-screener',
        icon: Sparkles,
        feature: 'ai_screener',
        children: [
          { label: 'Results', href: '/app/ai-screener', icon: Sparkles, feature: 'ai_screener' },
          { label: 'Pipeline View', href: '/app/ai-screener/pipeline', icon: GitBranch, feature: 'ai_screener_pipeline' },
        ],
      },
    ],
  },
  {
    title: 'Filter Screening',
    items: [
      {
        label: 'Filter Screener',
        href: '/app/filter-screener',
        icon: Filter,
        feature: 'filter_screener',
        children: [
          { label: 'High Upside', href: '/app/filter-screener/high-upside', icon: TrendingUp, feature: 'filter_high_upside' },
          { label: 'Undervalued', href: '/app/filter-screener/undervalued', icon: ArrowDownCircle, feature: 'filter_undervalued' },
        ],
      },
    ],
  },
  {
    title: 'Trading',
    items: [
      { label: 'Suggestions', href: '/app/suggestions', icon: Lightbulb, feature: 'suggestions' },
      { label: 'Open Trades', href: '/app/trades', icon: LineChart, feature: 'open_trades' },
      { label: 'Trade History', href: '/app/history', icon: History, feature: 'trade_history' },
    ],
  },
  {
    title: 'AI Assistant',
    items: [
      { label: 'Trade Assistant', href: '/app/assistant', icon: MessageSquare, feature: 'trade_assistant' },
      { label: 'Trade Reviewer', href: '/app/reviewer', icon: ClipboardCheck, feature: 'trade_reviewer' },
    ],
  },
];

interface GlassSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isAdmin?: boolean;
  pendingRequests?: number;
}

export function GlassSidebar({
  collapsed = false,
  onToggle: _onToggle,
  isAdmin = false,
  pendingRequests = 0,
}: GlassSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const { hasFeature, isCognitoAdmin } = useFeatureAccess();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(href);
  };

  const canAccessItem = (item: NavItem): boolean => {
    if (isCognitoAdmin || isAdmin) return true;
    if (!item.feature) return true;
    return hasFeature(item.feature);
  };

  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!canAccessItem(item)) return false;
      if (item.children) {
        item.children = item.children.filter(child => canAccessItem(child));
        return item.children.length > 0;
      }
      return true;
    });
  };

  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: filterItems([...section.items]),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen glass-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-sm">AI Smart</h1>
              <p className="text-slate-400 text-xs">Screener</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h2 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h2>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItemComponent
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActiveRoute(item.href)}
                  isExpanded={expandedItems.includes(item.label)}
                  onToggleExpand={() => toggleExpand(item.label)}
                />
              ))}
            </div>
          </div>
        ))}

        {(isAdmin || isCognitoAdmin) && (
          <div>
            {!collapsed && (
              <h2 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </h2>
            )}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Shield className="w-5 h-5" />
              {!collapsed && (
                <>
                  <span className="flex-1">Admin Panel</span>
                  {pendingRequests > 0 && (
                    <GlassBadge variant="warning" size="sm">
                      {pendingRequests}
                    </GlassBadge>
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )
          }
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function NavItemComponent({
  item,
  collapsed,
  isActive,
  isExpanded,
  onToggleExpand,
}: NavItemComponentProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={onToggleExpand}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
            isActive
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="flex-1 text-left">{item.label}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
            {item.children!.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                end={child.href === '/app/ai-screener'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <child.icon className="w-4 h-4" />
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/app'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
          collapsed && 'justify-center',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        )
      }
    >
      <Icon className="w-5 h-5" />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <GlassBadge variant="primary" size="sm">
              {item.badge}
            </GlassBadge>
          )}
        </>
      )}
    </NavLink>
  );
}

interface MobileGlassSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
  pendingRequests?: number;
}

export function MobileGlassSidebar({
  open,
  onOpenChange,
  isAdmin,
  pendingRequests,
}: MobileGlassSidebarProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={() => onOpenChange(false)}
      />

      <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-slide-in-from-left">
        <div className="h-full glass-sidebar">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <GlassSidebar
            collapsed={false}
            isAdmin={isAdmin}
            pendingRequests={pendingRequests}
          />
        </div>
      </div>
    </>
  );
}
