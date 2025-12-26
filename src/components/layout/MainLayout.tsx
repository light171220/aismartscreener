import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GlassSidebar, MobileGlassSidebar } from './GlassSidebar';
import { GlassHeader } from './GlassHeader';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAdminAccessRequests } from '@/hooks/useAdminAccessRequests';

interface MainLayoutProps {
  isAdmin?: boolean;
}

export function MainLayout({ isAdmin = false }: MainLayoutProps) {
  const { user, isAdmin: cognitoAdmin } = useAuth();
  const { userAccess } = useUserAccess();
  const { pendingCount } = useAdminAccessRequests();
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayUser = {
    name: userAccess?.fullName || user?.name || 'User',
    email: user?.email || '',
  };

  const showAdminFeatures = isAdmin || cognitoAdmin || userAccess?.role === 'ADMIN';

  return (
    <div className="min-h-screen">
      <div className="hidden md:block">
        <GlassSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isAdmin={showAdminFeatures}
          pendingRequests={showAdminFeatures ? pendingCount : 0}
        />
      </div>

      <MobileGlassSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        isAdmin={showAdminFeatures}
        pendingRequests={showAdminFeatures ? pendingCount : 0}
      />

      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        )}
      >
        <GlassHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          isAdmin={showAdminFeatures}
          user={displayUser}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
