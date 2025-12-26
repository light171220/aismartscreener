import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/useAuth';
import { useAccessRequest, type TradingExperience } from '@/hooks/useAccessRequest';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSelectContent,
  GlassSelectItem,
  PageLoader,
} from '@/components/ui';
import { Sparkles, CheckCircle2, User, AlertCircle, LogOut } from 'lucide-react';

export function RequestAccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { accessRequest, hasRequest, isPending, isApproved, createRequest, isCreating, createError, isLoading: requestLoading } = useAccessRequest();

  const locationState = location.state as {
    email?: string;
    fullName?: string;
    fromSignUp?: boolean;
  } | null;

  const [formData, setFormData] = React.useState({
    fullName: '',
    tradingExperience: '' as TradingExperience | '',
    reason: '',
  });
  const [error, setError] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [nameInitialized, setNameInitialized] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signup', { state: { message: 'Please create an account first' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  React.useEffect(() => {
    if (!requestLoading && hasRequest) {
      if (isPending) {
        navigate('/pending-approval');
      } else if (isApproved) {
        navigate('/app');
      }
    }
  }, [requestLoading, hasRequest, isPending, isApproved, navigate]);

  React.useEffect(() => {
    if (!nameInitialized && !authLoading) {
      const nameFromState = locationState?.fullName;
      const nameFromUser = user?.name;
      const userEmail = user?.email || '';
      const emailPrefix = userEmail.split('@')[0];
      
      let nameToUse = '';
      
      if (nameFromState) {
        nameToUse = nameFromState;
      } else if (nameFromUser && nameFromUser !== emailPrefix && nameFromUser !== 'User') {
        nameToUse = nameFromUser;
      }
      
      if (nameToUse) {
        setFormData((prev) => ({ ...prev, fullName: nameToUse }));
        setNameInitialized(true);
      } else if (user?.email) {
        setNameInitialized(true);
      }
    }
  }, [authLoading, user?.name, user?.email, locationState?.fullName, nameInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tradingExperience) {
      setError('Please select your trading experience');
      return;
    }

    if (formData.reason.length < 20) {
      setError('Please provide a more detailed reason (at least 20 characters)');
      return;
    }

    try {
      await createRequest({
        fullName: formData.fullName,
        tradingExperience: formData.tradingExperience as TradingExperience,
        reason: formData.reason,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (authLoading || requestLoading) {
    return <PageLoader message="Loading..." fullScreen />;
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md text-center">
          <GlassCardContent className="py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-slate-400 mb-6">
              Thank you for your interest in AI Smart Screener. We'll review your request and get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Check your email at <span className="text-white">{user?.email}</span> for updates.
            </p>
            <div className="flex flex-col gap-2">
              <GlassButton variant="primary" onClick={() => navigate('/pending-approval')}>
                Check Request Status
              </GlassButton>
              <GlassButton variant="ghost" className="text-slate-500" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <GlassCard className="w-full max-w-lg">
        <GlassCardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <GlassCardTitle className="text-2xl">Request Access</GlassCardTitle>
          <GlassCardDescription>
            {locationState?.fromSignUp
              ? 'One more step! Tell us about your trading experience.'
              : 'Fill out the form below to request access to AI Smart Screener'}
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          {user?.email && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                Requesting access for: <span className="font-medium text-white">{user.email}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || createError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error || createError?.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <GlassInput
                placeholder="John Doe"
                icon={<User className="w-4 h-4" />}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Trading Experience
              </label>
              <GlassSelect
                value={formData.tradingExperience}
                onValueChange={(value) => setFormData({ ...formData, tradingExperience: value as TradingExperience })}
              >
                <GlassSelectTrigger>
                  <GlassSelectValue placeholder="Select your experience level" />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  <GlassSelectItem value="BEGINNER">Beginner (Less than 1 year)</GlassSelectItem>
                  <GlassSelectItem value="INTERMEDIATE">Intermediate (1-3 years)</GlassSelectItem>
                  <GlassSelectItem value="ADVANCED">Advanced (3-5 years)</GlassSelectItem>
                  <GlassSelectItem value="PROFESSIONAL">Professional (5+ years)</GlassSelectItem>
                </GlassSelectContent>
              </GlassSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Why do you want to join?
              </label>
              <GlassTextarea
                placeholder="Tell us about your trading goals and how AI Smart Screener can help..."
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                minLength={20}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.reason.length}/20 characters minimum
              </p>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={isCreating}
              disabled={!formData.tradingExperience || formData.reason.length < 20}
            >
              Submit Request
            </GlassButton>

            <div className="flex flex-col gap-2 pt-2">
              <p className="text-center text-sm text-slate-400">
                Already have an account with access?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Sign In
                </Link>
              </p>
              <div className="text-center">
                <GlassButton 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default RequestAccessPage;
