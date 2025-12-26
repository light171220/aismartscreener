import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
  GlassInput,
} from '@/components/ui';
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, Key } from 'lucide-react';

type Step = 'email' | 'code' | 'success';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>('email');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword({ username: email });
      setStep('code');
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.name === 'UserNotFoundException') {
        setError('No account found with this email address.');
      } else if (err.name === 'LimitExceededException') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });
      setStep('success');
    } catch (err: any) {
      console.error('Confirm reset error:', err);
      if (err.name === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new one.');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Password does not meet requirements. Please use a stronger password.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md text-center">
          <GlassCardContent className="py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-slate-400 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <GlassButton variant="primary" onClick={() => navigate('/login')}>
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md">
          <GlassCardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <GlassCardTitle className="text-2xl">Reset Password</GlassCardTitle>
            <GlassCardDescription>
              Enter the code sent to <span className="text-white">{email}</span> and your new password
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Verification Code
                </label>
                <GlassInput
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>
                <GlassInput
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm New Password
                </label>
                <GlassInput
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <GlassButton type="submit" variant="primary" className="w-full" loading={loading}>
                Reset Password
                <ArrowRight className="w-4 h-4 ml-2" />
              </GlassButton>

              <GlassButton
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </GlassButton>
            </form>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <GlassCardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <GlassCardTitle className="text-2xl">Forgot Password?</GlassCardTitle>
          <GlassCardDescription>
            Enter your email address and we'll send you a code to reset your password
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleRequestCode} className="space-y-4">
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
              />
            </div>

            <GlassButton type="submit" variant="primary" className="w-full" loading={loading}>
              Send Reset Code
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>

            <p className="text-center text-sm text-slate-400">
              Remember your password?{' '}
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

export default ForgotPasswordPage;
