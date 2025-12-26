import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { PageLoader } from '@/components/ui';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading: authLoading, isAdmin: cognitoAdmin } = useAuth();
  const { userAccess, isLoading: accessLoading, isApproved } = useUserAccess();

  if (authLoading || accessLoading) {
    return <PageLoader message="Checking permissions..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdminRole = userAccess?.role === 'ADMIN';
  const hasAdminAccess = cognitoAdmin || isAdminRole;

  if (!hasAdminAccess) {
    if (isApproved) {
      return <Navigate to="/app" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
