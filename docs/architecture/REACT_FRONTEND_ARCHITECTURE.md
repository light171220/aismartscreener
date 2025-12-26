# React Frontend Architecture

## 1. Overview

The AI Smart Screener frontend is built with React 18+, TypeScript, and follows modern best practices for scalable, maintainable applications. It features a glassmorphism design system and role-based access control.

---

## 2. Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React 18 | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| TailwindCSS | Styling + Glassmorphism | 3.x |
| React Query | Server State | 5.x |
| Zustand | Client State | 4.x |
| React Router 6 | Routing | 6.x |
| React Hook Form | Form Handling | 7.x |
| Zod | Validation | 3.x |
| react-financial-charts | Stock Charts | Latest |
| Recharts | General Charts | 2.x |
| Sonner | Toast Notifications | Latest |
| Lucide React | Icons | Latest |

---

## 3. Project Structure

```
src/
├── app/                        # App-level configuration
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── components/                 # Shared UI components
│   ├── ui/                     # Base glassmorphism components
│   │   ├── glass-card.tsx
│   │   ├── glass-button.tsx
│   │   ├── glass-input.tsx
│   │   ├── glass-select.tsx
│   │   ├── glass-badge.tsx
│   │   ├── glass-table.tsx
│   │   ├── glass-dialog.tsx
│   │   ├── glass-tabs.tsx
│   │   └── index.ts
│   │
│   ├── charts/                 # Chart components
│   │   ├── CandlestickChart.tsx
│   │   ├── VolumeChart.tsx
│   │   ├── PLChart.tsx
│   │   ├── WinLossChart.tsx
│   │   ├── RMultipleChart.tsx
│   │   ├── Sparkline.tsx
│   │   └── index.ts
│   │
│   ├── forms/                  # Form components
│   │   ├── TradeForm.tsx
│   │   ├── ScreenerFilterForm.tsx
│   │   ├── AccessRequestForm.tsx
│   │   └── index.ts
│   │
│   ├── layout/                 # Layout components
│   │   ├── MainLayout.tsx        # Authenticated app layout
│   │   ├── PublicLayout.tsx      # Landing/auth pages layout
│   │   ├── AdminLayout.tsx       # Admin panel layout
│   │   ├── GlassSidebar.tsx
│   │   ├── GlassHeader.tsx
│   │   ├── MobileSidebar.tsx
│   │   ├── PageContainer.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── index.ts
│   │
│   ├── data-display/           # Data display components
│   │   ├── StockCard.tsx
│   │   ├── TradeCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── GlassDataTable.tsx
│   │   └── index.ts
│   │
│   ├── feedback/               # Feedback components
│   │   ├── GlassLoader.tsx
│   │   ├── GlassToast.tsx
│   │   ├── NotificationCenter.tsx
│   │   └── index.ts
│   │
│   └── auth/                   # Auth guard components
│       ├── ProtectedRoute.tsx
│       ├── AdminRoute.tsx
│       ├── FeatureRoute.tsx
│       └── index.ts
│
├── features/                   # Feature modules (domain-driven)
│   ├── landing/                # Public landing page
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── Footer.tsx
│   │   └── index.ts
│   │
│   ├── auth/                   # Authentication
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── index.ts
│   │
│   ├── access-request/         # Access request flow
│   │   ├── components/
│   │   │   ├── AccessRequestPage.tsx
│   │   │   ├── PendingApprovalPage.tsx
│   │   │   └── AccessRequestForm.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/              # Main dashboard
│   │   ├── components/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   ├── CombinedResultsCard.tsx
│   │   │   ├── TopMoversCard.tsx
│   │   │   ├── RecentActivityCard.tsx
│   │   │   └── PLChartCard.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   └── index.ts
│   │
│   ├── ai-screener/            # AI Screening module
│   │   ├── components/
│   │   │   ├── AIScreenerPage.tsx
│   │   │   ├── PipelinePage.tsx
│   │   │   ├── PipelineOverview.tsx
│   │   │   ├── Method1Results.tsx
│   │   │   ├── Method2Results.tsx
│   │   │   ├── AIScreeningResultsTable.tsx
│   │   │   └── StockDetailDialog.tsx
│   │   ├── hooks/
│   │   │   ├── useAIScreener.ts
│   │   │   ├── useMethod1Stocks.ts
│   │   │   └── useMethod2Stocks.ts
│   │   └── index.ts
│   │
│   ├── filter-screener/        # Filter-based screening
│   │   ├── components/
│   │   │   ├── HighUpsidePage.tsx
│   │   │   ├── UndervaluedPage.tsx
│   │   │   ├── FilterForm.tsx
│   │   │   └── FilterResults.tsx
│   │   ├── hooks/
│   │   │   └── useFilterScreener.ts
│   │   └── index.ts
│   │
│   ├── suggestions/            # Trade suggestions
│   │   ├── components/
│   │   │   ├── SuggestionsPage.tsx
│   │   │   ├── SuggestionCard.tsx
│   │   │   └── TakeTrade Dialog.tsx
│   │   ├── hooks/
│   │   │   └── useSuggestions.ts
│   │   └── index.ts
│   │
│   ├── trades/                 # Trade management
│   │   ├── components/
│   │   │   ├── OpenTradesPage.tsx
│   │   │   ├── TradeCard.tsx
│   │   │   ├── AddTradeDialog.tsx
│   │   │   ├── CloseTradeDialog.tsx
│   │   │   └── EditTradeDialog.tsx
│   │   ├── hooks/
│   │   │   ├── useTrades.ts
│   │   │   └── useAddTrade.ts
│   │   └── index.ts
│   │
│   ├── history/                # Trade history
│   │   ├── components/
│   │   │   ├── TradeHistoryPage.tsx
│   │   │   ├── TradeHistoryTable.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── TradeDetailDialog.tsx
│   │   ├── hooks/
│   │   │   └── useTradeHistory.ts
│   │   └── index.ts
│   │
│   ├── ai-assistant/           # AI Chat modules
│   │   ├── components/
│   │   │   ├── TradeAssistantPage.tsx
│   │   │   ├── TradeReviewerPage.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── AIResponseComponents.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── hooks/
│   │   │   └── useAIAssistant.ts
│   │   └── index.ts
│   │
│   └── admin/                  # Admin panel
│       ├── components/
│       │   ├── AdminDashboardPage.tsx
│       │   ├── AccessRequestsPage.tsx
│       │   ├── AccessRequestCard.tsx
│       │   ├── UserManagementPage.tsx
│       │   ├── UserTable.tsx
│       │   ├── EditPermissionsDialog.tsx
│       │   ├── ScreeningParametersPage.tsx
│       │   └── ParameterForm.tsx
│       ├── hooks/
│       │   ├── useAccessRequests.ts
│       │   ├── useUserManagement.ts
│       │   └── useScreeningParameters.ts
│       └── index.ts
│
├── hooks/                      # Shared hooks
│   ├── useAuth.ts
│   ├── useUserAccess.ts
│   ├── usePolygonData.ts
│   ├── useRealTime.ts
│   ├── useFeatureAccess.ts
│   └── index.ts
│
├── lib/                        # Utilities & clients
│   ├── amplify-client.ts
│   ├── polygon-client.ts
│   ├── utils.ts
│   ├── formatters.ts
│   └── constants.ts
│
├── stores/                     # Zustand stores
│   ├── authStore.ts
│   ├── tradeStore.ts
│   ├── uiStore.ts
│   └── permissionStore.ts
│
├── types/                      # TypeScript types
│   ├── stock.ts
│   ├── trade.ts
│   ├── screener.ts
│   ├── user.ts
│   ├── admin.ts
│   └── index.ts
│
└── styles/
    └── globals.css             # Glassmorphism CSS variables
```

---

## 4. Routing Structure

### src/app/router.tsx
```tsx
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layouts
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Route Guards
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { FeatureRoute } from '@/components/auth/FeatureRoute';

// Loading component
import { GlassLoader } from '@/components/feedback/GlassLoader';

// Public Pages (not lazy - load immediately)
import { HomePage } from '@/features/landing';
import { LoginPage } from '@/features/auth';
import { AccessRequestPage, PendingApprovalPage } from '@/features/access-request';

// Lazy load protected pages
const DashboardPage = lazy(() => import('@/features/dashboard'));
const AIScreenerPage = lazy(() => import('@/features/ai-screener/components/AIScreenerPage'));
const PipelinePage = lazy(() => import('@/features/ai-screener/components/PipelinePage'));
const HighUpsidePage = lazy(() => import('@/features/filter-screener/components/HighUpsidePage'));
const UndervaluedPage = lazy(() => import('@/features/filter-screener/components/UndervaluedPage'));
const SuggestionsPage = lazy(() => import('@/features/suggestions'));
const OpenTradesPage = lazy(() => import('@/features/trades/components/OpenTradesPage'));
const TradeHistoryPage = lazy(() => import('@/features/history'));
const TradeAssistantPage = lazy(() => import('@/features/ai-assistant/components/TradeAssistantPage'));
const TradeReviewerPage = lazy(() => import('@/features/ai-assistant/components/TradeReviewerPage'));
const SettingsPage = lazy(() => import('@/features/settings'));
const ProfilePage = lazy(() => import('@/features/profile'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/components/AdminDashboardPage'));
const AccessRequestsPage = lazy(() => import('@/features/admin/components/AccessRequestsPage'));
const UserManagementPage = lazy(() => import('@/features/admin/components/UserManagementPage'));
const ScreeningParametersPage = lazy(() => import('@/features/admin/components/ScreeningParametersPage'));

export const router = createBrowserRouter([
  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC ROUTES (No authentication required)
  // ═══════════════════════════════════════════════════════════════════════
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'request-access', element: <AccessRequestPage /> },
      { path: 'pending-approval', element: <PendingApprovalPage /> },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PROTECTED APP ROUTES (Approved users with feature permissions)
  // ═══════════════════════════════════════════════════════════════════════
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard (always accessible for approved users)
      {
        index: true,
        element: (
          <Suspense fallback={<GlassLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },

      // ─────────────────────────────────────────────────────────────────────
      // AI Screener Routes
      // ─────────────────────────────────────────────────────────────────────
      {
        path: 'ai-screener',
        element: (
          <FeatureRoute feature="ai_screener">
            <Suspense fallback={<GlassLoader />}>
              <AIScreenerPage />
            </Suspense>
          </FeatureRoute>
        ),
      },
      {
        path: 'ai-screener/pipeline',
        element: (
          <FeatureRoute feature="ai_screener_pipeline">
            <Suspense fallback={<GlassLoader />}>
              <PipelinePage />
            </Suspense>
          </FeatureRoute>
        ),
      },

      // ─────────────────────────────────────────────────────────────────────
      // Filter Screener Routes
      // ─────────────────────────────────────────────────────────────────────
      {
        path: 'filter-screener/high-upside',
        element: (
          <FeatureRoute feature="filter_high_upside">
            <Suspense fallback={<GlassLoader />}>
              <HighUpsidePage />
            </Suspense>
          </FeatureRoute>
        ),
      },
      {
        path: 'filter-screener/undervalued',
        element: (
          <FeatureRoute feature="filter_undervalued">
            <Suspense fallback={<GlassLoader />}>
              <UndervaluedPage />
            </Suspense>
          </FeatureRoute>
        ),
      },

      // ─────────────────────────────────────────────────────────────────────
      // Trading Routes
      // ─────────────────────────────────────────────────────────────────────
      {
        path: 'suggestions',
        element: (
          <FeatureRoute feature="suggestions">
            <Suspense fallback={<GlassLoader />}>
              <SuggestionsPage />
            </Suspense>
          </FeatureRoute>
        ),
      },
      {
        path: 'trades',
        element: (
          <FeatureRoute feature="open_trades">
            <Suspense fallback={<GlassLoader />}>
              <OpenTradesPage />
            </Suspense>
          </FeatureRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <FeatureRoute feature="trade_history">
            <Suspense fallback={<GlassLoader />}>
              <TradeHistoryPage />
            </Suspense>
          </FeatureRoute>
        ),
      },

      // ─────────────────────────────────────────────────────────────────────
      // AI Assistant Routes
      // ─────────────────────────────────────────────────────────────────────
      {
        path: 'assistant',
        element: (
          <FeatureRoute feature="trade_assistant">
            <Suspense fallback={<GlassLoader />}>
              <TradeAssistantPage />
            </Suspense>
          </FeatureRoute>
        ),
      },
      {
        path: 'reviewer',
        element: (
          <FeatureRoute feature="trade_reviewer">
            <Suspense fallback={<GlassLoader />}>
              <TradeReviewerPage />
            </Suspense>
          </FeatureRoute>
        ),
      },

      // ─────────────────────────────────────────────────────────────────────
      // User Routes (always accessible)
      // ─────────────────────────────────────────────────────────────────────
      {
        path: 'settings',
        element: (
          <Suspense fallback={<GlassLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<GlassLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN ROUTES (Admin users only)
  // ═══════════════════════════════════════════════════════════════════════
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<GlassLoader />}>
            <AdminDashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'access-requests',
        element: (
          <Suspense fallback={<GlassLoader />}>
            <AccessRequestsPage />
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<GlassLoader />}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'parameters',
        element: (
          <Suspense fallback={<GlassLoader />}>
            <ScreeningParametersPage />
          </Suspense>
        ),
      },
    ],
  },
]);
```

---

## 5. Route Guards

### 5.1 ProtectedRoute (Approved Users)
```tsx
// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { GlassLoader } from '@/components/feedback/GlassLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { userAccess, isLoading: accessLoading } = useUserAccess();
  const location = useLocation();

  // Show loader while checking auth
  if (authLoading || accessLoading) {
    return <GlassLoader fullScreen />;
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no UserAccess record - redirect to request access
  if (!userAccess) {
    return <Navigate to="/request-access" replace />;
  }

  // Has UserAccess but status is PENDING - redirect to pending page
  if (userAccess.accessStatus === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Has UserAccess but status is REVOKED - redirect to home with message
  if (userAccess.accessStatus === 'REVOKED') {
    return <Navigate to="/?revoked=true" replace />;
  }

  // Approved - render children
  return <>{children}</>;
}
```

### 5.2 AdminRoute
```tsx
// components/auth/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { GlassLoader } from '@/components/feedback/GlassLoader';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { userAccess, isLoading: accessLoading } = useUserAccess();

  if (authLoading || accessLoading) {
    return <GlassLoader fullScreen />;
  }

  if (!user || !userAccess) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role
  if (userAccess.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
```

### 5.3 FeatureRoute (Permission-based)
```tsx
// components/auth/FeatureRoute.tsx
import { Navigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { GlassLoader } from '@/components/feedback/GlassLoader';

interface FeatureRouteProps {
  feature: string;
  children: React.ReactNode;
}

export function FeatureRoute({ feature, children }: FeatureRouteProps) {
  const { hasFeature, isLoading } = useFeatureAccess();

  if (isLoading) {
    return <GlassLoader />;
  }

  // Check if user has permission for this feature
  if (!hasFeature(feature)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
```

### 5.4 Feature Access Hook
```tsx
// hooks/useFeatureAccess.ts
import { useUserAccess } from './useUserAccess';

const FEATURE_IDS = [
  'dashboard',
  'ai_screener',
  'ai_screener_pipeline',
  'filter_screener',
  'filter_high_upside',
  'filter_undervalued',
  'suggestions',
  'open_trades',
  'trade_history',
  'trade_assistant',
  'trade_reviewer',
] as const;

type FeatureId = typeof FEATURE_IDS[number];

export function useFeatureAccess() {
  const { userAccess, isLoading } = useUserAccess();

  const hasFeature = (feature: FeatureId): boolean => {
    if (!userAccess) return false;
    
    // Admins have all features
    if (userAccess.role === 'ADMIN') return true;
    
    // Dashboard is always available for approved users
    if (feature === 'dashboard') return true;
    
    // Check permissions array
    return userAccess.permissions?.includes(feature) ?? false;
  };

  const availableFeatures = FEATURE_IDS.filter((f) => hasFeature(f));

  return { hasFeature, availableFeatures, isLoading };
}
```

---

## 6. State Management Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Server State (React Query)                                              │
│  ├── AI Screening Results (Method1Stock, Method2Stock, AIScreeningResult)│
│  ├── Filter Screening Results (SuggestedStock, FilteredStock)            │
│  ├── User Trades (Trade, TradeHistory)                                   │
│  ├── User Access (UserAccess)                                            │
│  ├── Admin Data (AccessRequest, ScreeningParameters)                     │
│  └── Polygon Market Data                                                 │
│                                                                          │
│  Client State (Zustand)                                                  │
│  ├── UI State (modals, sidebar, theme)                                   │
│  ├── Form State                                                          │
│  ├── User Preferences                                                    │
│  └── Permission Cache                                                    │
│                                                                          │
│  URL State (React Router)                                                │
│  ├── Current Route                                                       │
│  ├── Query Parameters (filters, pagination)                              │
│  └── Search State                                                        │
│                                                                          │
│  Form State (React Hook Form)                                            │
│  ├── Trade Entry Form                                                    │
│  ├── Screener Filter Form                                                │
│  ├── Access Request Form                                                 │
│  └── Admin Configuration Forms                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Architectural Patterns

### 7.1 Feature-First Organization
```
✅ Good (Feature-based)
├── features/
│   ├── ai-screener/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   ├── trades/
│   └── admin/

❌ Bad (Type-based)
├── components/
├── hooks/
├── pages/
```

### 7.2 Component Composition
```tsx
// Presentational component (stateless)
interface StockCardProps {
  ticker: string;
  price: number;
  setupQuality: 'A+' | 'A' | 'B' | 'C';
}

function StockCard({ ticker, price, setupQuality }: StockCardProps) {
  return (
    <GlassCard hover>
      <h3 className="text-xl font-bold text-white">{ticker}</h3>
      <p className="text-2xl font-mono text-white">${price.toFixed(2)}</p>
      <GlassBadge variant={setupQuality === 'A+' ? 'success' : 'default'}>
        {setupQuality}
      </GlassBadge>
    </GlassCard>
  );
}

// Container component (stateful)
function StockCardContainer({ stockId }: { stockId: string }) {
  const { data, isLoading } = useAIScreeningResult(stockId);
  
  if (isLoading) return <StockCardSkeleton />;
  
  return (
    <StockCard
      ticker={data.ticker}
      price={data.currentPrice}
      setupQuality={data.setupQuality}
    />
  );
}
```

### 7.3 Custom Hooks for Logic
```tsx
// hooks/useAIScreeningResults.ts
export function useAIScreeningResults(date?: string) {
  const today = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['ai-screening', today],
    queryFn: () => client.models.AIScreeningResult.list({
      filter: { screenDate: { eq: today }, isActive: { eq: true } },
    }),
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000, // Auto-refresh every minute
  });
}

// hooks/useTrades.ts
export function useTrades() {
  const queryClient = useQueryClient();
  
  const { data: openTrades } = useQuery({
    queryKey: ['trades', 'open'],
    queryFn: () => client.models.Trade.list({
      filter: { status: { eq: 'OPEN' } },
    }),
  });
  
  const addTrade = useMutation({
    mutationFn: (trade: TradeInput) => client.models.Trade.create(trade),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Trade added successfully');
    },
  });
  
  const closeTrade = useMutation({
    mutationFn: (params: CloseTradeParams) =>
      client.models.Trade.update({
        id: params.id,
        sellPrice: params.sellPrice,
        sellDate: params.sellDate,
        status: 'CLOSED',
        profit: params.profit,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['trades']);
      toast.success('Trade closed');
    },
  });
  
  return { openTrades, addTrade, closeTrade };
}
```

---

## 8. Performance Optimizations

### 8.1 Code Splitting
```tsx
// Lazy load heavy components
const CandlestickChart = lazy(() => 
  import('@/components/charts/CandlestickChart')
);

// Route-based splitting (automatic with lazy imports in router)
```

### 8.2 Memoization
```tsx
// Memoize expensive computations
const sortedResults = useMemo(
  () => results?.sort((a, b) => {
    const qualityOrder = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3 };
    return qualityOrder[a.setupQuality] - qualityOrder[b.setupQuality];
  }),
  [results]
);

// Memoize callbacks
const handleTradeSubmit = useCallback(
  (trade: TradeInput) => addTrade.mutate(trade),
  [addTrade]
);

// Memoize components
const TradeRow = memo(function TradeRow({ trade }: { trade: Trade }) {
  return (/* ... */);
});
```

### 8.3 Virtual Lists
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualStockList({ stocks }: { stocks: AIScreeningResult[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: stocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <StockRow
            key={virtualRow.key}
            stock={stocks[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 9. Error Handling

### 9.1 Error Boundary
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <GlassCard className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-slate-400 mb-4">{error.message}</p>
      <GlassButton onClick={resetErrorBoundary}>Try again</GlassButton>
    </GlassCard>
  );
}

// Usage
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <AIScreenerPage />
</ErrorBoundary>
```

### 9.2 Query Error Handling
```tsx
function AIScreeningResults() {
  const { data, error, isLoading, refetch } = useAIScreeningResults();
  
  if (error) {
    return (
      <GlassCard className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-white mb-4">Failed to load screening results</p>
        <GlassButton variant="outline" onClick={() => refetch()}>
          Retry
        </GlassButton>
      </GlassCard>
    );
  }
  
  // ...
}
```

---

## 10. Testing Strategy

```
├── Unit Tests (Vitest)
│   ├── hooks/
│   ├── utils/
│   └── stores/
│
├── Component Tests (React Testing Library)
│   ├── components/
│   └── features/
│
└── E2E Tests (Playwright)
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    ├── ai-screener.spec.ts
    ├── trades.spec.ts
    └── admin.spec.ts
```

---

## 11. Route Summary

| Route | Access | Permission | Description |
|-------|--------|------------|-------------|
| `/` | Public | - | Landing page |
| `/login` | Public | - | Login page |
| `/request-access` | Public | - | Access request form |
| `/pending-approval` | Auth (pending) | - | Waiting page |
| `/app` | Approved | `dashboard` | Main dashboard |
| `/app/ai-screener` | Approved | `ai_screener` | AI results |
| `/app/ai-screener/pipeline` | Approved | `ai_screener_pipeline` | Pipeline view |
| `/app/filter-screener/high-upside` | Approved | `filter_high_upside` | High upside stocks |
| `/app/filter-screener/undervalued` | Approved | `filter_undervalued` | Undervalued stocks |
| `/app/suggestions` | Approved | `suggestions` | Trade suggestions |
| `/app/trades` | Approved | `open_trades` | Open positions |
| `/app/history` | Approved | `trade_history` | Closed trades |
| `/app/assistant` | Approved | `trade_assistant` | AI chat |
| `/app/reviewer` | Approved | `trade_reviewer` | Performance review |
| `/admin` | Admin | - | Admin dashboard |
| `/admin/access-requests` | Admin | - | Pending requests |
| `/admin/users` | Admin | - | User management |
| `/admin/parameters` | Admin | - | Screening config |
