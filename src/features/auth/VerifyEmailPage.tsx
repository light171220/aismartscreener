import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode, autoSignIn, signIn } from 'aws-amplify/auth';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassButton,
} from '@/components/ui';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, username, password } = (location.state as { 
    email?: string; 
    username?: string;
    password?: string;
  }) || {};

  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email!,
        confirmationCode: verificationCode,
      });

      if (isSignUpComplete) {
        setSuccess('Email verified successfully! Signing you in...');
        
        let signedIn = false;
        try {
          const autoSignInResult = await autoSignIn();
          if (autoSignInResult.isSignedIn) {
            signedIn = true;
          }
        } catch (autoSignInError) {
          console.log('Auto sign-in not available, trying manual sign-in');
        }

        if (!signedIn && password) {
          try {
            const signInResult = await signIn({ username: email!, password });
            if (signInResult.isSignedIn) {
              signedIn = true;
            }
          } catch (signInError) {
            console.log('Manual sign-in failed:', signInError);
          }
        }

        if (signedIn) {
          navigate('/request-access', { 
            state: { 
              email,
              fullName: username,
              fromSignUp: true,
            },
            replace: true,
          });
        } else {
          setSuccess('Email verified! Please sign in to continue.');
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email verified! Please sign in to continue.',
                email,
              },
              replace: true,
            });
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.name === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Verification code has expired. Please request a new code.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setResending(true);
    setError('');
    setSuccess('');

    try {
      await resendSignUpCode({ username: email! });
      setSuccess('A new verification code has been sent to your email.');
      setResendCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <GlassCardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <GlassCardTitle className="text-2xl">Verify Your Email</GlassCardTitle>
          <GlassCardDescription>
            We've sent a 6-digit code to{' '}
            <span className="text-white font-medium">{email}</span>
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-4 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={code.join('').length !== 6}
            >
              Verify Email
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">
                Didn't receive the code?
              </p>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                loading={resending}
                disabled={resendCooldown > 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </GlassButton>
            </div>

            <p className="text-center text-sm text-slate-400">
              Wrong email?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                Go back
              </Link>
            </p>
          </form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}

export default VerifyEmailPage;
