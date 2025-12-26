# Sidebar Component - Glassmorphism Design

## 1. Overview

The Sidebar provides the main navigation for the application with a modern glassmorphism design. It supports:
- Regular user navigation
- Admin-only navigation (conditional)
- Collapsible state
- Mobile responsive sheet

---

## 2. Visual Design

### User Navigation

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐    │
│  │      AI Smart           │    │
│  │      Screener     🔳    │    │  ← Glass header with logo
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  📊 Dashboard           │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ SCREENING ━━━━━━━━     │
│  ┌─────────────────────────┐    │
│  │  🤖 AI Screener      ▼  │    │
│  │     ├─ AI Results       │    │
│  │     └─ Pipeline View    │    │
│  │  🔍 Filter Screener  ▼  │    │
│  │     ├─ High Upside      │    │
│  │     └─ Undervalued      │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ TRADING ━━━━━━━━━━     │
│  ┌─────────────────────────┐    │
│  │  📋 Suggestions         │    │
│  │  📈 Open Trades         │    │
│  │  📜 Trade History       │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ AI ASSISTANT ━━━━━     │
│  ┌─────────────────────────┐    │
│  │  💬 Trade Assistant     │    │
│  │  📝 Trade Reviewer      │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ ADMIN ━━━━━━━━━━━━     │  ← Only visible to admins
│  ┌─────────────────────────┐    │
│  │  🛡️ Admin Panel     →   │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│  ┌─────────────────────────┐    │
│  │  ⚙️ Settings            │    │
│  │  👤 Profile             │    │
│  │  🌙 Dark Mode       ○   │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

### Admin Navigation (Admin Panel)

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐    │
│  │  ← Back to App          │    │
│  │      Admin Panel        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  📊 Admin Dashboard     │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ USER MANAGEMENT ━━━     │
│  ┌─────────────────────────┐    │
│  │  ⏳ Access Requests  🔴 │    │  ← Badge for pending count
│  │  👥 All Users           │    │
│  └─────────────────────────┘    │
│                                 │
│  ━━━━━━ CONFIGURATION ━━━━     │
│  ┌─────────────────────────┐    │
│  │  ⚙️ Screening Params    │    │
│  │  📊 System Logs         │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Glassmorphism Sidebar Component

```tsx
// components/layout/GlassSidebar.tsx
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sparkles,
  Filter,
  TrendingUp,
  History,
  MessageSquare,
  ClipboardCheck,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  GitBranch,
  ArrowDownCircle,
  Lightbulb,
  Shield,
  Clock,
  Users,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUserAccess } from '@/hooks/useUserAccess';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: Omit<NavItem, 'children'>[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// User navigation sections
const userNavSections: NavSection[] = [
  {
    title: '',
    items: [
      { title: 'Dashboard', href: '/app', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Screening',
    items: [
      { 
        title: 'AI Screener', 
        href: '/app/ai-screener', 
        icon: Sparkles,
        children: [
          { title: 'AI Results', href: '/app/ai-screener', icon: Sparkles },
          { title: 'Pipeline View', href: '/app/ai-screener/pipeline', icon: GitBranch },
        ],
      },
      { 
        title: 'Filter Screener', 
        href: '/app/filter-screener', 
        icon: Filter,
        children: [
          { title: 'High Upside', href: '/app/filter-screener/high-upside', icon: TrendingUp },
          { title: 'Undervalued', href: '/app/filter-screener/undervalued', icon: ArrowDownCircle },
        ],
      },
    ],
  },
  {
    title: 'Trading',
    items: [
      { title: 'Suggestions', href: '/app/suggestions', icon: Lightbulb },
      { title: 'Open Trades', href: '/app/trades', icon: TrendingUp },
      { title: 'Trade History', href: '/app/history', icon: History },
    ],
  },
  {
    title: 'AI Assistant',
    items: [
      { title: 'Trade Assistant', href: '/app/assistant', icon: MessageSquare },
      { title: 'Trade Reviewer', href: '/app/reviewer', icon: ClipboardCheck },
    ],
  },
];

// Admin navigation sections
const adminNavSections: NavSection[] = [
  {
    title: '',
    items: [
      { title: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'User Management',
    items: [
      { title: 'Access Requests', href: '/admin/access-requests', icon: Clock },
      { title: 'All Users', href: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { title: 'Screening Parameters', href: '/admin/parameters', icon: Settings },
      { title: 'System Logs', href: '/admin/logs', icon: Activity },
    ],
  },
];

interface GlassSidebarProps {
  isAdmin?: boolean;
  pendingRequestsCount?: number;
}

export function GlassSidebar({ isAdmin = false, pendingRequestsCount = 0 }: GlassSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { userAccess } = useUserAccess();
  
  const navSections = isAdmin ? adminNavSections : userNavSections;
  
  // Add badge to Access Requests if there are pending
  if (isAdmin && pendingRequestsCount > 0) {
    const userMgmtSection = navSections.find(s => s.title === 'User Management');
    const accessReqItem = userMgmtSection?.items.find(i => i.title === 'Access Requests');
    if (accessReqItem) {
      accessReqItem.badge = pendingRequestsCount;
    }
  }
  
  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    );
  };
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen',
        'bg-slate-900/85 backdrop-blur-xl',
        'border-r border-white/10',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        'flex items-center h-16 px-4',
        'border-b border-white/10',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigate('/app')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>
                <div>
                  <span className="font-semibold text-white">Admin Panel</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">AI Smart</span>
                  <span className="font-bold text-blue-400">Screener</span>
                </div>
              </>
            )}
          </div>
        )}
        
        {collapsed && !isAdmin && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        )}
        
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
      
      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-20 p-1 rounded-full bg-slate-800 border border-white/10 hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </button>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section, index) => (
          <div key={index} className="mb-6">
            {section.title && !collapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
                  isExpanded={expandedItems.includes(item.href)}
                  onToggleExpand={() => toggleExpanded(item.href)}
                  currentPath={location.pathname}
                />
              ))}
            </ul>
          </div>
        ))}
        
        {/* Admin Link (for non-admin view) */}
        {!isAdmin && userAccess?.role === 'ADMIN' && !collapsed && (
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Admin
            </h3>
            <NavLink
              to="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'text-sm font-medium transition-all duration-200',
                'text-slate-400 hover:text-white',
                'hover:bg-white/5',
                'group'
              )}
            >
              <Shield className="w-5 h-5" />
              <span>Admin Panel</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </div>
        )}
      </nav>
      
      {/* Bottom Section */}
      <div className="border-t border-white/10 p-2">
        {/* Settings & Profile */}
        <ul className="space-y-1 mb-2">
          <SidebarNavItem
            item={{ title: 'Settings', href: '/app/settings', icon: Settings }}
            collapsed={collapsed}
            isActive={location.pathname === '/app/settings'}
            isExpanded={false}
            onToggleExpand={() => {}}
            currentPath={location.pathname}
          />
          <SidebarNavItem
            item={{ title: 'Profile', href: '/app/profile', icon: User }}
            collapsed={collapsed}
            isActive={location.pathname === '/app/profile'}
            isExpanded={false}
            onToggleExpand={() => {}}
            currentPath={location.pathname}
          />
        </ul>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            'text-slate-400 hover:text-white hover:bg-white/5',
            collapsed && 'justify-center'
          )}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              {!collapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              {!collapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentPath: string;
}

function SidebarNavItem({
  item,
  collapsed,
  isActive,
  isExpanded,
  onToggleExpand,
  currentPath,
}: SidebarNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  
  // Check if any child is active
  const isChildActive = item.children?.some(child => currentPath === child.href);
  const showAsActive = isActive || isChildActive;
  
  if (collapsed) {
    return (
      <li>
        <NavLink
          to={item.href}
          className={cn(
            'flex items-center justify-center p-2.5 rounded-xl',
            'transition-all duration-200',
            showAsActive
              ? 'bg-blue-500/20 text-blue-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
          title={item.title}
        >
          <Icon className="w-5 h-5" />
        </NavLink>
      </li>
    );
  }
  
  return (
    <li>
      {hasChildren ? (
        <>
          <button
            onClick={onToggleExpand}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-sm font-medium transition-all duration-200',
              showAsActive
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          
          {/* Children */}
          {isExpanded && (
            <ul className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildItemActive = currentPath === child.href;
                
                return (
                  <li key={child.href}>
                    <NavLink
                      to={child.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg',
                        'text-sm transition-all duration-200',
                        isChildItemActive
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-500 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <ChildIcon className="w-4 h-4" />
                      <span>{child.title}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <NavLink
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            showAsActive
              ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Icon className="w-5 h-5" />
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
        </NavLink>
      )}
    </li>
  );
}
```

---

## 4. Mobile Sidebar (Sheet)

```tsx
// components/layout/MobileGlassSidebar.tsx
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GlassSidebar } from './GlassSidebar';

export function MobileGlassSidebar({ isAdmin, pendingRequestsCount }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/80 backdrop-blur-lg border border-white/10"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Sheet */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 md:hidden',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <GlassSidebar isAdmin={isAdmin} pendingRequestsCount={pendingRequestsCount} />
        
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </>
  );
}
```

---

## 5. Route Configuration Update

```tsx
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RequestAccessPage } from '@/pages/RequestAccessPage';
import { PendingApprovalPage } from '@/pages/PendingApprovalPage';

// App Pages
import { DashboardPage } from '@/pages/app/DashboardPage';
import { AIScreenerPage } from '@/pages/app/AIScreenerPage';
import { PipelinePage } from '@/pages/app/PipelinePage';
// ... other app pages

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AccessRequestsPage } from '@/pages/admin/AccessRequestsPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { ScreeningParametersPage } from '@/pages/admin/ScreeningParametersPage';

export const router = createBrowserRouter([
  // ═══════════════════════════════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════════════════════════════
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'request-access', element: <RequestAccessPage /> },
      { path: 'pending-approval', element: <PendingApprovalPage /> },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════
  // PROTECTED APP ROUTES (Approved Users)
  // ═══════════════════════════════════════════════════════════════
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      
      // AI Screener
      { path: 'ai-screener', element: <AIScreenerPage /> },
      { path: 'ai-screener/pipeline', element: <PipelinePage /> },
      
      // Filter Screener
      { path: 'filter-screener/high-upside', element: <HighUpsidePage /> },
      { path: 'filter-screener/undervalued', element: <UndervaluedPage /> },
      
      // Trading
      { path: 'suggestions', element: <SuggestionsPage /> },
      { path: 'trades', element: <OpenTradesPage /> },
      { path: 'history', element: <TradeHistoryPage /> },
      
      // AI Assistant
      { path: 'assistant', element: <TradeAssistantPage /> },
      { path: 'reviewer', element: <TradeReviewerPage /> },
      
      // User
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ADMIN ROUTES (Admin Users Only)
  // ═══════════════════════════════════════════════════════════════
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'access-requests', element: <AccessRequestsPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'parameters', element: <ScreeningParametersPage /> },
      { path: 'logs', element: <SystemLogsPage /> },
    ],
  },
]);
```

---

## 6. Access Control Summary

| Route | Access Level | Description |
|-------|-------------|-------------|
| `/` | Public | Landing page with features & access request |
| `/login` | Public | Login page |
| `/request-access` | Public | Access request form |
| `/pending-approval` | Authenticated (Pending) | Waiting for approval page |
| `/app/*` | Authenticated (Approved) | Main application |
| `/admin/*` | Admin Only | Admin panel |

---

## 7. Responsive Behavior

| Breakpoint | Sidebar Behavior |
|------------|------------------|
| < 768px (Mobile) | Hidden, opens as sheet |
| 768px - 1024px | Collapsed by default |
| > 1024px | Expanded by default |

---

## 8. Glassmorphism Styling

```css
/* Sidebar glass effect */
.glass-sidebar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* Active nav item glow */
.nav-item-active {
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

/* Hover effect */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
```
