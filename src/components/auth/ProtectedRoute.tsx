import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import { PageLoader } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading, isAdmin: cognitoAdmin } = useAuth();
  const { userAccess, isLoading: accessLoading, isApproved, isRevoked } = useUserAccess();
  const { hasRequest, isPending: requestPending, isRejected: requestRejected, isLoading: requestLoading } = useAccessRequest();
  const location = useLocation();

  if (authLoading || accessLoading || requestLoading) {
    return <PageLoader message="Checking authentication..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (cognitoAdmin) {
    return <>{children}</>;
  }

  if (userAccess && isApproved) {
    return <>{children}</>;
  }

  if (userAccess && isRevoked) {
    return <Navigate to="/?revoked=true" replace />;
  }

  if (hasRequest) {
    if (requestPending || requestRejected) {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  return <Navigate to="/request-access" replace />;
}

export default ProtectedRoute;
