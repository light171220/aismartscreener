import { Navigate } from 'react-router-dom';
import { useFeatureAccess, FeatureId } from '@/hooks/useFeatureAccess';
import { PageLoader } from '@/components/ui';

interface FeatureRouteProps {
  feature: FeatureId;
  children: React.ReactNode;
}

export function FeatureRoute({ feature, children }: FeatureRouteProps) {
  const { hasFeature, isLoading, isCognitoAdmin } = useFeatureAccess();

  if (isLoading) {
    return <PageLoader message="Checking access..." />;
  }

  if (isCognitoAdmin) {
    return <>{children}</>;
  }

  if (!hasFeature(feature)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

export default FeatureRoute;
