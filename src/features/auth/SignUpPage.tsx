import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
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
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export function SignUpPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { isApproved, isLoading: accessLoading } = useUserAccess();
  const { isPending: hasPendingRequest, isRejected: hasRejectedRequest, hasRequest, isLoading: requestLoading } = useAccessRequest();
  
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    preferredUsername: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }
      
      if (!accessLoading && !requestLoading) {
        if (isApproved) {
          navigate('/app', { replace: true });
        } else if (hasPendingRequest || hasRejectedRequest) {
          navigate('/pending-approval', { replace: true });
        } else if (!hasRequest) {
          navigate('/request-access', { replace: true });
        }
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, accessLoading, requestLoading, isApproved, hasPendingRequest, hasRejectedRequest, hasRequest, navigate]);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Contains special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test(formData.password));
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            preferred_username: formData.preferredUsername,
          },
          autoSignIn: true,
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            username: formData.preferredUsername,
            password: formData.password,
          } 
        });
      } else if (isSignUpComplete) {
        navigate('/request-access');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.name === 'UsernameExistsException') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Password does not meet requirements. Please check and try again.');
      } else if (err.name === 'InvalidParameterException') {
        setError(err.message || 'Invalid input. Please check your information.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <GlassCard className="w-full max-w-md">
        <GlassCardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <GlassCardTitle className="text-2xl">Create Account</GlassCardTitle>
          <GlassCardDescription>
            Sign up to start your trading journey with AI
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Display Name
              </label>
              <GlassInput
                type="text"
                placeholder="John Trader"
                icon={<User className="w-4 h-4" />}
                value={formData.preferredUsername}
                onChange={(e) => setFormData({ ...formData, preferredUsername: e.target.value })}
                required
                minLength={2}
                maxLength={50}
              />
              <p className="text-xs text-slate-500 mt-1">This will be displayed in the app</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <GlassInput
                type="email"
                placeholder="john@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs ${
                        req.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-3 h-3 ${req.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <GlassInput
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              {formData.confirmPassword && !doPasswordsMatch && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {doPasswordsMatch && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={!isPasswordValid || !doPasswordsMatch}
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Sign In
              </Link>
            </p>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default SignUpPage;
