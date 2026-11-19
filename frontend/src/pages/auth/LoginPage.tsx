import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  Sun,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, show user info and redirect button
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7DFD5] p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 font-bold text-xl flex items-center justify-center mx-auto border-2 border-amber-200">
            {user.avatar || 'AM'}
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 font-semibold">
              Signed in
            </span>
            <h2 className="text-2xl font-bold text-[#1C1917] mt-3">{user.name}</h2>
            <p className="text-xs text-stone-500 mt-1">{user.email}</p>
            {user.role && (
              <p className="text-xs text-amber-800 font-medium mt-1">
                {user.role}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(from, { replace: true })}
            className="w-full py-3 px-6 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Workspace</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await login({
      email,
      name: name.trim() || undefined,
      role: tab === 'register' ? 'New Member' : 'Member',
    });
    setLoading(false);
    navigate(from, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await loginWithGoogle();
    setLoading(false);
    navigate(from, { replace: true });
  };

  const handleDemoSignIn = async (persona: 'student' | 'evaluator' | 'recruiter') => {
    setLoading(true);
    await loginAsDemo(persona);
    setLoading(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Warm ambient radiant glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-200/25 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E7DFD5] p-6 sm:p-9 shadow-xl shadow-stone-200/40 relative">
        {/* Header with Sun Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-3 shadow-inner">
            <Sun size={24} />
          </div>
          <span className="block text-[11px] font-semibold text-amber-700 tracking-widest uppercase">
            Golden Hour Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight mt-1">
            CloudResumeAI
          </h1>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            AI-orchestrated resume intelligence on Google Cloud Platform
          </p>
        </div>

        {/* Google Cloud Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white border border-[#DCD3C7] hover:bg-[#FAF7F2] text-[#1C1917] text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99]"
        >
          {/* Official Google G Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E7DFD5]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
            or sign in with email
          </span>
        </div>

        {/* Tabs for Sign In / Register */}
        <div className="flex bg-[#F5EFE6] p-1 rounded-xl mb-4 border border-[#E7DFD5]/70">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{tab === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* 1-Click Academic Demo & Evaluator Picker */}
        <div className="mt-6 pt-5 border-t border-[#E7DFD5]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 mb-2.5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Instant Demo Access (For Presentation / Viva)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7DFD5] bg-[#FAF8F5] hover:bg-[#F5EFE6] text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <GraduationCap size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900 group-hover:text-amber-900">
                    Alex Mercer
                  </p>
                  <p className="text-[10px] text-stone-500">Student & Cloud Architect</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                Use Demo
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('evaluator')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7DFD5] bg-[#FAF8F5] hover:bg-[#F5EFE6] text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900 group-hover:text-amber-900">
                    Prof. H. Sharma
                  </p>
                  <p className="text-[10px] text-stone-500">Project Evaluator / Reviewer</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                Use Demo
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('recruiter')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#E7DFD5] bg-[#FAF8F5] hover:bg-[#F5EFE6] text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Briefcase size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900 group-hover:text-amber-900">
                    Sarah Jenkins
                  </p>
                  <p className="text-[10px] text-stone-500">Technical Recruiter</p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                Use Demo
              </span>
            </button>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
