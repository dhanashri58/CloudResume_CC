import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '../../config/api';

export const LoginPage: React.FC<{ initialMode?: 'signin' | 'signup' }> = ({
  initialMode = 'signin',
}) => {
  const {
    loginWithCredentials,
    registerUser,
    loginWithGoogle,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Tab State: 'signin' | 'signup'
  const isDirectSignUp = location.pathname.includes('/signup') || location.pathname.includes('/register') || initialMode === 'signup';
  const [tab, setTab] = useState<'signin' | 'signup'>(isDirectSignUp ? 'signup' : 'signin');

  // Sync tab with URL if navigation occurs
  useEffect(() => {
    if (location.pathname.includes('/signup') || location.pathname.includes('/register')) {
      setTab('signup');
    } else if (location.pathname.includes('/login')) {
      setTab('signin');
    }
  }, [location.pathname]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google OAuth Loading
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check for redirect token and load GIS
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        setGoogleLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (profile) => {
            await loginWithGoogle({
              email: profile.email,
              name: profile.name,
              avatar: profile.picture,
            });
            window.history.replaceState(null, '', window.location.pathname);
            navigate(from, { replace: true });
          })
          .catch((err) => {
            console.error('Google profile fetch failed:', err);
            setErrorMessage('Failed to fetch Google profile. Please try again.');
          })
          .finally(() => setGoogleLoading(false));
      }
    }

    if (typeof window !== 'undefined' && !(window as any).google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.id = 'google-gis-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [from, loginWithGoogle, navigate]);

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    const google = (window as any).google;
    if (google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid profile email',
          callback: async (tokenResponse: { access_token?: string; error?: string }) => {
            if (tokenResponse.error) {
              setGoogleLoading(false);
              setErrorMessage('Google sign-in was cancelled or encountered an error.');
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const gUser = await gRes.json();
                await loginWithGoogle({
                  email: gUser.email,
                  name: gUser.name,
                  avatar: gUser.picture,
                });
                setGoogleLoading(false);
                navigate(from, { replace: true });
              } catch (err) {
                setGoogleLoading(false);
                setErrorMessage('Failed to authenticate Google user with backend server.');
                console.error(err);
              }
            }
          },
        });
        client.requestAccessToken();
        return;
      } catch (e) {
        console.warn('initTokenClient failed, using direct redirect:', e);
      }
    }

    // Direct OAuth 2.0 URL redirect fallback
    const redirectUri = window.location.origin + window.location.pathname;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20profile%20email&prompt=select_account`;
    window.location.href = authUrl;
  };

  // Password strength checks for sign up
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasMatch: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const result = await loginWithCredentials({
      email: email.trim(),
      password,
      rememberMe,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } else {
      setErrorMessage(result.error || 'Invalid email or password. Please try again.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!passwordCriteria.hasLetter || !passwordCriteria.hasNumber) {
      setErrorMessage('Password must contain both letters and numbers.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);
    const result = await registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Account created successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 600);
    } else {
      setErrorMessage(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-250">
      {/* Main Authentication Card */}
      <div className="max-w-md w-full bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl border border-[var(--border-subtle)] p-7 sm:p-9 shadow-xl space-y-6 transition-colors">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--border-subtle)] text-[var(--accent-primary)] text-xs font-semibold mb-1">
            <ShieldCheck size={14} className="text-[var(--accent-primary)]" />
            <span>Secure Cloud Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans">
            {tab === 'signin' ? 'Sign In to CloudResume' : 'Create Your Free Account'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {tab === 'signin'
              ? 'Enter your credentials to access your resumes and AI workspace'
              : 'Join to craft ATS-optimized cloud resumes and get Gemini AI advice'}
          </p>
        </div>

        {/* Interactive Tab Switcher: Sign In vs Create Account */}
        <div className="p-1 rounded-2xl bg-[var(--bg-subtle)] flex gap-1 border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'signin'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forms Container */}
        {tab === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                />
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  Keep me signed in for 30 days
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-full bg-[var(--accent-primary)] hover:opacity-90 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanmay Kumbhare"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters (letters & numbers)"
                  className="w-full pl-10 pr-11 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] transition-all shadow-2xs"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl space-y-1 text-[11px] text-[var(--text-secondary)] animate-fadeIn">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    <Check size={12} className={passwordCriteria.hasLength ? 'text-emerald-600' : 'text-[var(--text-muted)]'} />
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    <Check size={12} className={passwordCriteria.hasLetter ? 'text-emerald-600' : 'text-[var(--text-muted)]'} />
                    <span>Has Letters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    <Check size={12} className={passwordCriteria.hasNumber ? 'text-emerald-600' : 'text-[var(--text-muted)]'} />
                    <span>Has Numbers</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    <Check size={12} className={passwordCriteria.hasMatch ? 'text-emerald-600' : 'text-[var(--text-muted)]'} />
                    <span>Passwords Match</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-full bg-[var(--accent-primary)] hover:opacity-90 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--border-subtle)] w-full" />
          <span className="bg-[var(--bg-surface)] px-3 text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Or continue with
          </span>
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Footer Toggle text */}
        <div className="text-center pt-2 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">
            {tab === 'signin' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMessage(null);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Sign Up for Free
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMessage(null);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Sign In Instead
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
