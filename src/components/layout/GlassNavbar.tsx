import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { cn } from '@/lib/utils';
import { GlassButton, GlassBadge } from '@/components/ui';
import { BarChart3, Menu, X, Sparkles, LogOut, User, Clock, XCircle, Shield } from 'lucide-react';

interface GlassNavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
  userName?: string;
  hasApprovedAccess?: boolean;
  hasPendingRequest?: boolean;
  hasRejectedRequest?: boolean;
  onLogin?: () => void;
  onSignUp?: () => void;
}

export function GlassNavbar({ 
  isLoggedIn, 
  isAdmin,
  userEmail,
  userName,
  hasApprovedAccess,
  hasPendingRequest,
  hasRejectedRequest,
  onLogin, 
  onSignUp 
}: GlassNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const renderAuthButtons = () => {
    if (!isLoggedIn) {
      return (
        <>
          <GlassButton variant="ghost" onClick={onLogin}>
            Sign In
          </GlassButton>
          <GlassButton variant="primary" onClick={onSignUp}>
            Sign Up
          </GlassButton>
        </>
      );
    }

    if (isAdmin) {
      return (
        <div className="flex items-center gap-3">
          <GlassBadge variant="purple" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </GlassBadge>
          <Link to="/admin">
            <GlassButton variant="primary">
              Admin Dashboard
            </GlassButton>
          </Link>
          <GlassButton 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            loading={signingOut}
          >
            <LogOut className="w-4 h-4" />
          </GlassButton>
        </div>
      );
    }

    if (hasApprovedAccess) {
      return (
        <div className="flex items-center gap-3">
          <Link to="/app">
            <GlassButton variant="primary">
              Go to Dashboard
            </GlassButton>
          </Link>
          <GlassButton 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            loading={signingOut}
          >
            <LogOut className="w-4 h-4" />
          </GlassButton>
        </div>
      );
    }

    if (hasPendingRequest) {
      return (
        <div className="flex items-center gap-3">
          <GlassBadge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Approval
          </GlassBadge>
          <Link to="/pending-approval">
            <GlassButton variant="outline" size="sm">
              Check Status
            </GlassButton>
          </Link>
          <GlassButton 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            loading={signingOut}
          >
            <LogOut className="w-4 h-4" />
          </GlassButton>
        </div>
      );
    }

    if (hasRejectedRequest) {
      return (
        <div className="flex items-center gap-3">
          <GlassBadge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </GlassBadge>
          <Link to="/pending-approval">
            <GlassButton variant="outline" size="sm">
              View Details
            </GlassButton>
          </Link>
          <GlassButton 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            loading={signingOut}
          >
            <LogOut className="w-4 h-4" />
          </GlassButton>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <User className="w-4 h-4" />
          <span className="hidden lg:inline">{userEmail}</span>
        </div>
        <Link to="/request-access">
          <GlassButton variant="primary" size="sm">
            Request Access
          </GlassButton>
        </Link>
        <GlassButton 
          variant="ghost" 
          size="sm"
          onClick={handleSignOut}
          loading={signingOut}
        >
          <LogOut className="w-4 h-4" />
        </GlassButton>
      </div>
    );
  };

  const renderMobileAuthButtons = () => {
    if (!isLoggedIn) {
      return (
        <>
          <GlassButton variant="ghost" onClick={onLogin} className="w-full">
            Sign In
          </GlassButton>
          <GlassButton variant="primary" onClick={onSignUp} className="w-full">
            Sign Up
          </GlassButton>
        </>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {userEmail && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <User className="w-4 h-4" />
            <span>{userEmail}</span>
          </div>
        )}
        
        {isAdmin ? (
          <>
            <GlassBadge variant="purple" className="flex items-center justify-center gap-1 py-2">
              <Shield className="w-3 h-3" />
              Admin
            </GlassBadge>
            <Link to="/admin" className="w-full">
              <GlassButton variant="primary" className="w-full">
                Admin Dashboard
              </GlassButton>
            </Link>
          </>
        ) : hasApprovedAccess ? (
          <Link to="/app" className="w-full">
            <GlassButton variant="primary" className="w-full">
              Go to Dashboard
            </GlassButton>
          </Link>
        ) : hasPendingRequest ? (
          <>
            <GlassBadge variant="warning" className="flex items-center justify-center gap-1 py-2">
              <Clock className="w-3 h-3" />
              Pending Approval
            </GlassBadge>
            <Link to="/pending-approval" className="w-full">
              <GlassButton variant="outline" className="w-full">
                Check Status
              </GlassButton>
            </Link>
          </>
        ) : hasRejectedRequest ? (
          <>
            <GlassBadge variant="destructive" className="flex items-center justify-center gap-1 py-2">
              <XCircle className="w-3 h-3" />
              Request Rejected
            </GlassBadge>
            <Link to="/pending-approval" className="w-full">
              <GlassButton variant="outline" className="w-full">
                View Details
              </GlassButton>
            </Link>
          </>
        ) : (
          <Link to="/request-access" className="w-full">
            <GlassButton variant="primary" className="w-full">
              Request Access
            </GlassButton>
          </Link>
        )}
        
        <GlassButton 
          variant="ghost" 
          className="w-full text-slate-400"
          onClick={handleSignOut}
          loading={signingOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </GlassButton>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'py-2 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'py-4 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">AI SmartScreener</span>
              <GlassBadge variant="purple" size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta
              </GlassBadge>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            
            <div className="flex items-center gap-3 ml-4">
              {renderAuthButtons()}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>
                Features
              </MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setIsMenuOpen(false)}>
                How It Works
              </MobileNavLink>
              <MobileNavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </MobileNavLink>
              
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                {renderMobileAuthButtons()}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-slate-300 hover:text-white transition-colors font-medium"
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-slate-300 hover:text-white transition-colors font-medium text-lg"
    >
      {children}
    </a>
  );
}

export default GlassNavbar;
