# Page Layouts

## 1. Overview

Page layouts define the structure and organization of different page types in the application. Each layout is designed for specific use cases.

## 2. Main Layout

The primary layout wrapping all authenticated pages.

```tsx
// components/layout/MainLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
      
      {/* Main Content Area */}
      <div className={cn(
        'flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      )}>
        {/* Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

## 3. Page Container

Standard wrapper for page content.

```tsx
// components/layout/PageContainer.tsx
interface PageContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  breadcrumbs = true,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && <Breadcrumbs />}
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
      
      {/* Page Content */}
      {children}
    </div>
  );
}

// Usage
export function TradesPage() {
  return (
    <PageContainer
      title="Live Trades"
      description="Manage your open positions and track performance"
      actions={
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Trade
        </Button>
      }
    >
      <TradesContent />
    </PageContainer>
  );
}
```

## 4. Split Layout (Two Columns)

For pages with sidebar content.

```tsx
// components/layout/SplitLayout.tsx
interface SplitLayoutProps {
  sidebar: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export function SplitLayout({
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  children,
}: SplitLayoutProps) {
  const widths = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };
  
  const sidebarContent = (
    <aside className={cn(
      'flex-shrink-0 border-r bg-card',
      widths[sidebarWidth],
      'hidden lg:block'
    )}>
      {sidebar}
    </aside>
  );
  
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {sidebarPosition === 'left' && sidebarContent}
      
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
      
      {sidebarPosition === 'right' && sidebarContent}
    </div>
  );
}

// Usage: AI Assistant Page
export function AssistantPage() {
  return (
    <SplitLayout
      sidebar={<ConversationList />}
      sidebarWidth="md"
    >
      <ChatInterface />
    </SplitLayout>
  );
}
```

## 5. Dashboard Layout (Grid)

For dashboard pages with multiple widgets.

```tsx
// components/layout/DashboardLayout.tsx
interface DashboardLayoutProps {
  stats?: React.ReactNode;
  mainContent: React.ReactNode;
  sideContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export function DashboardLayout({
  stats,
  mainContent,
  sideContent,
  bottomContent,
}: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats}
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3 width) */}
        <div className={cn(
          'space-y-6',
          sideContent ? 'lg:col-span-2' : 'lg:col-span-3'
        )}>
          {mainContent}
        </div>
        
        {/* Side Content (1/3 width) */}
        {sideContent && (
          <div className="space-y-6">
            {sideContent}
          </div>
        )}
      </div>
      
      {/* Bottom Content (Full Width) */}
      {bottomContent && (
        <div className="mt-6">
          {bottomContent}
        </div>
      )}
    </div>
  );
}

// Usage
export function DashboardPage() {
  return (
    <PageContainer title="Dashboard">
      <DashboardLayout
        stats={<QuickStats />}
        mainContent={
          <>
            <CombinedResultsCard />
            <OpenTradesCard />
          </>
        }
        sideContent={
          <>
            <TopMoversCard />
            <RecentActivityCard />
          </>
        }
        bottomContent={<PLChartCard />}
      />
    </PageContainer>
  );
}
```

## 6. Table Layout

For pages primarily showing data tables.

```tsx
// components/layout/TablePageLayout.tsx
interface TablePageLayoutProps {
  title: string;
  description?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  pagination?: React.ReactNode;
}

export function TablePageLayout({
  title,
  description,
  filters,
  actions,
  children,
  pagination,
}: TablePageLayoutProps) {
  return (
    <PageContainer title={title} description={description}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filters */}
        {filters && (
          <div className="flex flex-wrap gap-2">
            {filters}
          </div>
        )}
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Table Content */}
      <Card>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          {pagination}
        </div>
      )}
    </PageContainer>
  );
}

// Usage
export function TradeHistoryPage() {
  return (
    <TablePageLayout
      title="Trade History"
      description="View all your past trades"
      filters={
        <>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <StatusFilter value={status} onChange={setStatus} />
          <SetupTypeFilter value={setupType} onChange={setSetupType} />
        </>
      }
      actions={
        <>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </>
      }
      pagination={<DataTablePagination table={table} />}
    >
      <TradeHistoryTable data={trades} />
    </TablePageLayout>
  );
}
```

## 7. Form Layout

For pages with forms.

```tsx
// components/layout/FormPageLayout.tsx
interface FormPageLayoutProps {
  title: string;
  description?: string;
  backLink?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FormPageLayout({
  title,
  description,
  backLink,
  children,
  maxWidth = 'lg',
}: FormPageLayoutProps) {
  const navigate = useNavigate();
  
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };
  
  return (
    <div className={cn('mx-auto', maxWidths[maxWidth])}>
      {/* Back Button */}
      {backLink && (
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(backLink)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

// Usage
export function AddTradePage() {
  return (
    <FormPageLayout
      title="Add New Trade"
      description="Enter your trade details"
      backLink="/trades"
      maxWidth="lg"
    >
      <TradeForm onSubmit={handleSubmit} />
    </FormPageLayout>
  );
}
```

## 8. Detail Layout

For detail/profile pages.

```tsx
// components/layout/DetailLayout.tsx
interface DetailLayoutProps {
  header: React.ReactNode;
  tabs?: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
  }>;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
}

export function DetailLayout({
  header,
  tabs,
  sidebar,
  children,
}: DetailLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          {header}
        </CardContent>
      </Card>
      
      {/* Content Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className={cn(
          sidebar ? 'lg:col-span-2' : 'lg:col-span-3'
        )}>
          {tabs ? (
            <Tabs defaultValue={tabs[0].value}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </div>
        
        {/* Sidebar */}
        {sidebar && (
          <div className="space-y-6">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage: Stock Detail Page
export function StockDetailPage() {
  return (
    <DetailLayout
      header={<StockHeader stock={stock} />}
      tabs={[
        { value: 'overview', label: 'Overview', content: <StockOverview /> },
        { value: 'chart', label: 'Chart', content: <StockChart /> },
        { value: 'news', label: 'News', content: <StockNews /> },
        { value: 'financials', label: 'Financials', content: <StockFinancials /> },
      ]}
      sidebar={
        <>
          <QuickTradeCard stock={stock} />
          <AnalystRatingsCard stock={stock} />
          <KeyStatsCard stock={stock} />
        </>
      }
    />
  );
}
```

## 9. Empty Layout

For auth pages and minimal layouts.

```tsx
// components/layout/EmptyLayout.tsx
interface EmptyLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export function EmptyLayout({ children, showLogo = true }: EmptyLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {showLogo && (
        <div className="mb-8 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">AI Smart Screener</span>
        </div>
      )}
      {children}
    </div>
  );
}

// Usage: Login Page
export function LoginPage() {
  return (
    <EmptyLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </EmptyLayout>
  );
}
```

## 10. Pipeline Layout

For the AI Screening Pipeline page showing results at each stage.

```tsx
// components/layout/PipelineLayout.tsx
interface PipelineLayoutProps {
  title: string;
  description?: string;
  pipelineOverview: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomPanel?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PipelineLayout({
  title,
  description,
  pipelineOverview,
  leftPanel,
  rightPanel,
  bottomPanel,
  actions,
}: PipelineLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      
      {/* Pipeline Overview - Full Width */}
      <div className="w-full">
        {pipelineOverview}
      </div>
      
      {/* Two Column Layout for Method Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Method 1 */}
        <div>{leftPanel}</div>
        
        {/* Right Panel - Method 2 */}
        <div>{rightPanel}</div>
      </div>
      
      {/* Bottom Panel - Final Results (Full Width) */}
      {bottomPanel && (
        <div className="w-full">
          {bottomPanel}
        </div>
      )}
    </div>
  );
}

// Usage: AI Screening Pipeline Page
export function ScreeningPipelinePage() {
  return (
    <PipelineLayout
      title="AI Screening Pipeline"
      description="View detailed results from each screening stage"
      actions={
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
      pipelineOverview={<PipelineOverview stats={pipelineStats} />}
      leftPanel={<Method1Results />}
      rightPanel={<Method2Results />}
      bottomPanel={<AIScreeningResultsTable />}
    />
  );
}
```

### Pipeline Overview Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI SCREENING PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     PIPELINE OVERVIEW (Full Width)                     │  │
│  │  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐      │  │
│  │  │ M1  │───►│ G1  │───►│ G2  │───►│ G3  │───►│ G4  │───►│FINAL│      │  │
│  │  │ 45  │    │ 50  │    │ 18  │    │  8  │    │  6  │    │  4  │      │  │
│  │  └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐          │
│  │   METHOD 1 RESULTS          │  │   METHOD 2 RESULTS          │          │
│  │   (Left Panel)              │  │   (Right Panel)             │          │
│  │                             │  │                             │          │
│  │   Tabs: All | Liquidity |   │  │   Tabs: Gate1 | Gate2 |    │          │
│  │   Volatility | Catalyst     │  │   Gate3 | Gate4 | Final    │          │
│  │                             │  │                             │          │
│  │   ┌───────────────────┐     │  │   ┌───────────────────┐     │          │
│  │   │ Results Table     │     │  │   │ Results Table     │     │          │
│  │   └───────────────────┘     │  │   └───────────────────┘     │          │
│  └─────────────────────────────┘  └─────────────────────────────┘          │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    FINAL INTERSECTION RESULTS (Full Width)             │  │
│  │   Stocks that passed BOTH Method 1 AND Method 2                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Responsive Considerations

```tsx
// All layouts should be responsive
// Use these breakpoint utilities:

// Hidden on mobile, visible on desktop
<div className="hidden md:block">Desktop only</div>

// Visible on mobile, hidden on desktop
<div className="md:hidden">Mobile only</div>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Left/Top</div>
  <div>Right/Bottom</div>
</div>

// Full width on mobile, constrained on desktop
<div className="w-full max-w-2xl mx-auto">Centered content</div>

// Different columns based on screen size
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

---

## 12. Public Layout

Layout for unauthenticated pages (landing, login, access request).

```tsx
// components/layout/PublicLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      
      {/* Public Navigation */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Smart Screener</span>
            </Link>
            
            {/* Right Nav */}
            <div className="flex items-center gap-4">
              <Link to="/login">
                <GlassButton variant="ghost">Sign In</GlassButton>
              </Link>
              <Link to="/request-access">
                <GlassButton variant="primary" glow>
                  Request Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlassButton>
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Page Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">AI Smart Screener</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Harness the power of AI to identify high-probability day trading setups.
                Dual-method screening for maximum confidence.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/request-access" className="text-slate-400 hover:text-white transition-colors">Request Access</Link></li>
                <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} AI Smart Screener. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### Public Layout Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PUBLIC LAYOUT                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER                                                               │    │
│  │ [Logo] AI Smart Screener              [Sign In] [Request Access →] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║                                                                     ║    │
│  ║                       PAGE CONTENT                                  ║    │
│  ║                                                                     ║    │
│  ║                    (Landing / Login /                               ║    │
│  ║                     Access Request /                                ║    │
│  ║                     Pending Approval)                               ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOOTER                                                               │    │
│  │ Brand / Description      Platform Links      Legal Links            │    │
│  │                                                                      │    │
│  │ © 2025 AI Smart Screener                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Admin Layout

Layout for admin-only pages with admin-specific navigation.

```tsx
// components/layout/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Settings,
  ArrowLeft,
  Shield,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { cn } from '@/lib/utils';

const ADMIN_NAV_ITEMS = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: '/admin/access-requests',
    label: 'Access Requests',
    icon: UserCheck,
    badge: 'pendingCount', // Will be replaced with actual count
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: Users,
  },
  {
    path: '/admin/parameters',
    label: 'Screening Parameters',
    icon: Settings,
  },
];

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingRequests] = useState(3); // Would come from API
  
  const isActivePath = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r border-white/10 glass-subtle relative z-10">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-amber-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Admin Panel</p>
                <p className="text-xs text-slate-400">AI Smart Screener</p>
              </div>
            </div>
            
            {/* Back to App */}
            <GlassButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/app')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </GlassButton>
          </div>
          
          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = isActivePath(item.path, item.exact);
              const Icon = item.icon;
              const badgeCount = item.badge === 'pendingCount' ? pendingRequests : null;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount !== null && badgeCount > 0 && (
                    <GlassBadge variant="warning" size="sm">
                      {badgeCount}
                    </GlassBadge>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
          
          {/* Admin User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Admin Header */}
          <header className="h-16 border-b border-white/10 glass-subtle relative z-10">
            <div className="h-full px-6 flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Link to="/admin" className="text-slate-400 hover:text-white">
                  Admin
                </Link>
                {location.pathname !== '/admin' && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-white">
                      {ADMIN_NAV_ITEMS.find(item => 
                        isActivePath(item.path, item.exact)
                      )?.label || 'Page'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-3">
                <GlassButton variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </GlassButton>
                <Link to="/app">
                  <GlassButton variant="outline" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    View App
                  </GlassButton>
                </Link>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto relative z-10">
            <div className="max-w-7xl mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### Admin Layout Visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN LAYOUT                                      │
├────────────────────┬────────────────────────────────────────────────────────┤
│                    │  HEADER                                                 │
│  ADMIN SIDEBAR     │  Admin > Current Page           [🔔] [View App →]      │
│                    ├────────────────────────────────────────────────────────┤
│  🛡️ Admin Panel    │                                                        │
│  AI Smart Screener │                                                        │
│                    │                                                        │
│  [← Back to App]   │               PAGE CONTENT                             │
│                    │                                                        │
│  ───────────────   │          (Admin Dashboard /                            │
│                    │           Access Requests /                            │
│  ▶ Dashboard       │           User Management /                            │
│  ○ Access Requests │           Screening Parameters)                        │
│    (3)             │                                                        │
│  ○ User Management │                                                        │
│  ○ Parameters      │                                                        │
│                    │                                                        │
│                    │                                                        │
│                    │                                                        │
│  ───────────────   │                                                        │
│  👤 Admin Name     │                                                        │
│  Administrator     │                                                        │
└────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 14. Pending Approval Layout

Special layout for users waiting for access approval.

```tsx
// features/access-request/components/PendingApprovalPage.tsx
export function PendingApprovalPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Access Request Pending
          </h1>
          <p className="text-slate-400">
            Thank you for your interest in AI Smart Screener!
            Your access request is being reviewed by our team.
          </p>
        </div>
        
        {/* Status Card */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Status</span>
            <GlassBadge variant="warning">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Under Review
            </GlassBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Submitted</span>
            <span className="text-white">Just now</span>
          </div>
        </GlassCard>
        
        <p className="text-slate-500 text-sm mb-6">
          We typically review requests within 24-48 hours.
          You'll receive an email once your access is approved.
        </p>
        
        <Link to="/">
          <GlassButton variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}
```
