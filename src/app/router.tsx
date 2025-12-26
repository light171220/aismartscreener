import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { FeatureRoute } from '@/components/auth/FeatureRoute';

import { PageLoader } from '@/components/ui';

import { HomePage } from '@/features/landing/HomePage';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const AIScreenerPage = lazy(() => import('@/features/ai-screener/AIScreenerPage'));
const PipelinePage = lazy(() => import('@/features/ai-screener/PipelinePage'));
const HighUpsidePage = lazy(() => import('@/features/filter-screener/HighUpsidePage'));
const UndervaluedPage = lazy(() => import('@/features/filter-screener/UndervaluedPage'));
const SuggestionsPage = lazy(() => import('@/features/suggestions/SuggestionsPage'));
const OpenTradesPage = lazy(() => import('@/features/trades/OpenTradesPage'));
const TradeHistoryPage = lazy(() => import('@/features/history/TradeHistoryPage'));
const TradeAssistantPage = lazy(() => import('@/features/ai-assistant/TradeAssistantPage'));
const TradeReviewerPage = lazy(() => import('@/features/ai-assistant/TradeReviewerPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const SignUpPage = lazy(() => import('@/features/auth/SignUpPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const RequestAccessPage = lazy(() => import('@/features/auth/RequestAccessPage'));
const PendingApprovalPage = lazy(() => import('@/features/auth/PendingApprovalPage'));

const AdminDashboardPage = lazy(() => import('@/features/admin/AdminDashboardPage'));
const AccessRequestsPage = lazy(() => import('@/features/admin/AccessRequestsPage'));
const UserManagementPage = lazy(() => import('@/features/admin/UserManagementPage'));
const ScreeningParametersPage = lazy(() => import('@/features/admin/ScreeningParametersPage'));

function LazyPage({ component: Component }: { component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<PageLoader message="Loading page..." />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LazyPage component={LoginPage} />,
      },
      {
        path: 'signup',
        element: <LazyPage component={SignUpPage} />,
      },
      {
        path: 'verify-email',
        element: <LazyPage component={VerifyEmailPage} />,
      },
      {
        path: 'forgot-password',
        element: <LazyPage component={ForgotPasswordPage} />,
      },
      {
        path: 'request-access',
        element: <LazyPage component={RequestAccessPage} />,
      },
      {
        path: 'pending-approval',
        element: <LazyPage component={PendingApprovalPage} />,
      },
    ],
  },

  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout isAdmin={false} />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage component={DashboardPage} />,
      },
      {
        path: 'ai-screener',
        element: (
          <FeatureRoute feature="ai_screener">
            <LazyPage component={AIScreenerPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'ai-screener/pipeline',
        element: (
          <FeatureRoute feature="ai_screener_pipeline">
            <LazyPage component={PipelinePage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'filter-screener',
        element: <Navigate to="/app/filter-screener/high-upside" replace />,
      },
      {
        path: 'filter-screener/high-upside',
        element: (
          <FeatureRoute feature="filter_high_upside">
            <LazyPage component={HighUpsidePage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'filter-screener/undervalued',
        element: (
          <FeatureRoute feature="filter_undervalued">
            <LazyPage component={UndervaluedPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'suggestions',
        element: (
          <FeatureRoute feature="suggestions">
            <LazyPage component={SuggestionsPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'trades',
        element: (
          <FeatureRoute feature="open_trades">
            <LazyPage component={OpenTradesPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <FeatureRoute feature="trade_history">
            <LazyPage component={TradeHistoryPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'assistant',
        element: (
          <FeatureRoute feature="trade_assistant">
            <LazyPage component={TradeAssistantPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'reviewer',
        element: (
          <FeatureRoute feature="trade_reviewer">
            <LazyPage component={TradeReviewerPage} />
          </FeatureRoute>
        ),
      },
      {
        path: 'settings',
        element: <LazyPage component={SettingsPage} />,
      },
      {
        path: 'profile',
        element: <LazyPage component={ProfilePage} />,
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <MainLayout isAdmin={true} />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <LazyPage component={AdminDashboardPage} />,
      },
      {
        path: 'access-requests',
        element: <LazyPage component={AccessRequestsPage} />,
      },
      {
        path: 'users',
        element: <LazyPage component={UserManagementPage} />,
      },
      {
        path: 'parameters',
        element: <LazyPage component={ScreeningParametersPage} />,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
