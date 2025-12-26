import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAccessRequest } from '@/hooks/useAccessRequest';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
  GlassInput,
  PageLoader,
} from '@/components/ui';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, isAdmin, refetch } = useAuth();
  const { isApproved, isLoading: accessLoading } = useUserAccess();
  const { isPending: hasPendingRequest, isRejected: hasRejectedRequest, hasRequest, isLoading: requestLoading } = useAccessRequest();
  
  const locationState = location.state as { 
    message?: string; 
    email?: string;
    from?: { pathname: string };
  } | null;

  const [email, setEmail] = React.useState(locationState?.email || '');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState(locationState?.message || '');

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }
      
      if (!accessLoading && !requestLoading) {
        if (isApproved) {
          const from = locationState?.from?.pathname || '/app';
          navigate(from, { replace: true });
        } else if (hasPendingRequest || hasRejectedRequest) {
          navigate('/pending-approval', { replace: true });
        } else if (!hasRequest) {
          navigate('/request-access', { replace: true });
        }
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, accessLoading, requestLoading, isApproved, hasPendingRequest, hasRejectedRequest, hasRequest, navigate, locationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        await refetch();
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        navigate('/verify-email', { state: { email } });
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setError('You need to set a new password. Please contact support.');
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        setError('MFA verification required. Please enter your authenticator code.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.name === 'UserNotConfirmedException') {
        navigate('/verify-email', { state: { email } });
      } else if (err.name === 'PasswordResetRequiredException') {
        setError('Password reset required. Please reset your password.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (isAuthenticated && !isAdmin && (accessLoading || requestLoading))) {
    return <PageLoader message="Checking authentication..." fullScreen />;
  }

  if (isAuthenticated) {
    return <PageLoader message="Redirecting..." fullScreen />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <GlassCardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <GlassCardTitle className="text-2xl">Welcome Back</GlassCardTitle>
          <GlassCardDescription>
            Sign in to access your trading dashboard
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <GlassInput
                type="email"
                placeholder="john@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <GlassInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <GlassButton type="submit" variant="primary" className="w-full" loading={loading}>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                Sign Up
              </Link>
            </p>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default LoginPage;
