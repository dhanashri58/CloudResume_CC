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
  GraduationCap,
  Briefcase,
  X,
  Check,
} from 'lucide-react';
import { GoogleOAuthModal } from '../../components/auth/GoogleOAuthModal';
import { PersonaModal, PersonaType } from '../../components/auth/PersonaModal';

export const LoginPage: React.FC<{ initialMode?: 'signin' | 'signup' }> = ({
  initialMode = 'signin',
}) => {
  const {
    loginWithCredentials,
    registerUser,
    loginWithGoogle,
    loginAsDemo,
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

  // Modals
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaType | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

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

  const handleGoogleSelect = async (account: { name: string; email: string; avatar?: string }) => {
    await loginWithGoogle(account);
    navigate(from, { replace: true });
  };

  const handlePersonaSelect = async (persona: PersonaType) => {
    await loginAsDemo(persona);
    navigate(from, { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      setForgotStatus(data.message || 'If an account exists with that email, reset instructions have been sent.');
    } catch {
      setForgotStatus('Network error. Please try again later.');
    } finally {
      setForgotLoading(false);
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-[var(--accent-primary)] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
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
                  placeholder="e.g. Alex Mercer"
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
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-2.5 px-4 rounded-full border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs"
        >
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
          <span>Continue with Google</span>
        </button>

        {/* 1-Click Academic Demo Personas for Quick Evaluation */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center mb-2">
            1-Click Academic Demo Personas
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActivePersona('student')}
              className="p-2.5 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold text-[11px]">
                <GraduationCap size={14} />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">Alex Mercer</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePersona('evaluator')}
              className="p-2.5 rounded-2xl border border-[var(--border-subtle)] hover:border-emerald-500 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <ShieldCheck size={14} />
                <span>Evaluator</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">Prof. Sharma</p>
            </button>

            <button
              type="button"
              onClick={() => setActivePersona('recruiter')}
              className="p-2.5 rounded-2xl border border-[var(--border-subtle)] hover:border-purple-500 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                <Briefcase size={14} />
                <span>Recruiter</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">Sarah Jenkins</p>
            </button>
          </div>
        </div>

        {/* Footer Toggle text */}
        <div className="text-center pt-1 border-t border-[var(--border-subtle)]">
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

      {/* Google OAuth Chooser Modal */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleSelect}
      />

      {/* Persona Detail Modal */}
      <PersonaModal
        isOpen={Boolean(activePersona)}
        persona={activePersona}
        onClose={() => setActivePersona(null)}
        onConfirm={handlePersonaSelect}
      />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email address and we'll send you recovery instructions.
            </p>
            {forgotStatus ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                {forgotStatus}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-full transition-all shadow-sm disabled:opacity-60"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
