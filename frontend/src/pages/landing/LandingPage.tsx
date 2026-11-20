import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  BarChart3,
  Download,
  ArrowRight,
  Star,
  Sun,
  Shield,
  Cpu,
  ChevronRight,
  Check,
  Zap,
  Award,
  Layers,
  Lock,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import MeadowRiseFooter, { MeadowTheme } from '../../components/ui/meadow-rise-footer';
import { useTheme } from '../../context/ThemeContext';

// ─── Interactive Hero Preview Card ───────────────────────────────────────────

const HeroGlassPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'improved' | 'original'>('improved');

  return (
    <div className="relative mx-auto w-full max-w-4xl mt-8 sm:mt-10 group">
      {/* Ambient aura beneath card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/20 via-orange-400/15 to-amber-600/20 dark:from-blue-600/20 dark:via-indigo-500/15 dark:to-cyan-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Surface Card Container */}
      <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl overflow-hidden p-5 sm:p-7 text-left transition-all duration-300">
        
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono pl-2 border-l border-[var(--border-subtle)]">
              alex_morgan_cloud_architect.pdf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ATS Score: 98%
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Sparkles size={11} className="text-amber-600 dark:text-amber-400" />
              Gemini Optimized
            </span>
          </div>
        </div>

        {/* Card Body - Grid Mockup */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Candidate Info & AI Optimization */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Alex Morgan</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold">
                  Senior Cloud Architect
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Seattle, WA · linkedin.com/in/alex-cloud · alex.morgan@example.com
              </p>
            </div>

            {/* AI Bullet Improvement Diff Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>Experience Bullet Optimization</span>
                </div>
                <div className="flex rounded-lg bg-[var(--bg-surface)] p-0.5 text-[11px] border border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveTab('improved')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeTab === 'improved'
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    AI Enhanced
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                      activeTab === 'original'
                        ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {activeTab === 'improved' ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-surface)] p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Architected and deployed </span>
                    stateless Python Flask REST services across Google Cloud Run, cutting API tail latencies by 42% and sustaining 10,000+ RPS.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium pl-1">
                    <Check size={11} /> +32% stronger XYZ action verb impact
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-fadeIn">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-subtle)] line-through opacity-75">
                    Responsible for creating backend REST APIs with Python and maintaining cloud containers for team usage.
                  </p>
                  <div className="text-[10px] text-rose-500 font-mono pl-1">
                    Passive phrasing · Lacks quantified business outcome
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: ATS Score Radar & Technical Skills */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Real-Time ATS Keywords</span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">12 / 12 Matched</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Google Cloud Run', 'Cloud SQL', 'Docker', 'PostgreSQL', 'OAuth 2.0 / OIDC', 'Terraform', 'CI/CD Pipelines', 'REST APIs'].map(
                  (tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium"
                    >
                      <Check size={10} className="text-emerald-500 font-bold" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">ReportLab Engine Active</span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-primary)] hover:opacity-80"
              >
                Try Editor <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Bento Grid Feature Cards ─────────────────────────────────────────────────

const BentoFeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
          <Cpu size={13} className="text-amber-600 dark:text-amber-400" />
          Engineered for Modern Hiring
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3 font-serif">
          Everything required to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-blue-400 dark:to-cyan-400">
            dominate the applicant pool
          </span>
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
          Traditional resume builders export broken HTML or clunky tables. CloudResumeAI utilizes serverless Gemini AI, in-memory vector PDF rendering, and Google Cloud infrastructure.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Bento 1: Large Featured Card - AI Bullet Enhancer (Span 7) */}
        <div className="md:col-span-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-7 relative overflow-hidden group hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles size={20} />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
              gemini-3.5-flash-lite
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
            AI-Powered Bullet Point Optimization
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            Automatically transform weak, passive responsibilities into quantified business results using Google's proven XYZ methodology.
          </p>

          {/* Interactive Visual Widget */}
          <div className="space-y-2 p-3 sm:p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <span className="font-mono font-bold text-rose-600">RAW:</span>
              <span>"Created REST API endpoints in Python for user authentication."</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="font-mono font-bold text-emerald-600">AI:</span>
              <span>"Engineered stateless Python Flask REST API with Google OIDC token verification, accelerating authentication throughput by 3.4x."</span>
            </div>
          </div>
        </div>

        {/* Bento 2: ATS Scanner & Score Radar (Span 5) */}
        <div className="md:col-span-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-7 relative overflow-hidden group hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <Target size={20} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
              Real-Time ATS Score Radar
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              Scan candidate text against recruiter job postings to detect missing keywords before submitting applications.
            </p>
          </div>

          {/* Radial score gauge visual */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400">
                98 / 100
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">Optimal Interview Probability</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                15 matched
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">0 gaps detected</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Server-Side Vector PDF Engine (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 group hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <Download size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
            Vector PDF Engine
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Compiled server-side using Python ReportLab. Clean vector typography, zero blurry raster images, and two-pass page numbering.
          </p>
          <div className="text-[11px] font-mono text-[var(--text-primary)] bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
            <span>A4 Document Buffer</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">100% Vector</span>
          </div>
        </div>

        {/* Bento 4: Google Cloud Identity & Security (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 group hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <Shield size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
            Cloud Identity & Privacy
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Google Cloud Identity & OIDC authentication with public JWKS validation and strict multi-tenant data isolation.
          </p>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
            <span>RS256 JWT Signed</span>
            <span className="font-bold">Zero Leaks</span>
          </div>
        </div>

        {/* Bento 5: Observability & Telemetry (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 group hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-300">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
            Observability & Analytics
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Structured JSON logging, end-to-end `X-Request-ID` correlation, Server-Timing latency metrics, and Cloud Logging.
          </p>
          <div className="text-[11px] font-mono text-[var(--text-primary)] bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
            <span>Serverless Latency</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">&lt; 1.2s API</span>
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Template Preview Card ───────────────────────────────────────────────────

const DarkTemplatePreviewCard: React.FC<{
  name: string;
  primary: string;
  accent: string;
  category?: string;
}> = ({ name, primary, accent, category }) => (
  <div className="group rounded-3xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg">
    {/* Colored header line */}
    <div className="h-2 w-full" style={{ background: accent }} />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--text-primary)] tracking-tight">{name}</p>
        {category && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
            {category}
          </span>
        )}
      </div>

      {/* Miniature preview canvas */}
      <div className="rounded-2xl p-3.5 space-y-2 border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div className="h-2 w-20 rounded-full" style={{ background: accent, opacity: 0.9 }} />
        <div className="h-1.5 w-14 rounded-full" style={{ background: primary, opacity: 0.6 }} />
        <div className="mt-2 space-y-1 pt-1.5 border-t border-[var(--border-subtle)]">
          {[88, 72, 60, 78].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-[var(--text-muted)]"
              style={{
                width: `${w}%`,
                opacity: 0.2 + i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Process / How It Works ───────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Select a Template',
    desc: 'Pick from designer color palettes engineered for ATS compliance and clean visual hierarchy.',
  },
  {
    step: '02',
    title: 'Input Career History',
    desc: 'Add professional experience, academic degrees, portfolio projects, and categorized skill tags.',
  },
  {
    step: '03',
    title: 'Apply Gemini AI',
    desc: 'Let Google Gemini rewrite passive duties into high-impact accomplishment bullets with metrics.',
  },
  {
    step: '04',
    title: 'Export Vector PDF',
    desc: 'Download a clean vector PDF compiled directly in server memory, ready for recruiter submission.',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Priya Kapoor',
    role: 'Software Engineer at Spotify',
    badge: 'Landed 3 Interviews in Week 1',
    quote:
      'CloudResumeAI helped me land 3 interviews in a week. The AI bullet improvements were incredible and immediately stood out.',
    avatar: 'PK',
    stars: 5,
  },
  {
    name: 'James Liu',
    role: 'Product Manager at Figma',
    badge: 'ATS Score Jumped 64% to 98%',
    quote:
      'Best resume tool I have ever used. The ATS score feature alone saved me countless rejections by revealing keyword gaps.',
    avatar: 'JL',
    stars: 5,
  },
  {
    name: 'Sara Okafor',
    role: 'Cloud Architect at Stripe',
    badge: 'Offer Accepted $185k',
    quote:
      'The templates are beautiful, modern, and actually pass automated screening. Truly enterprise-grade engineering.',
    avatar: 'SO',
    stars: 5,
  },
];

// ─── Main Landing Page Component ──────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Engineering', 'Architecture', 'Leadership', 'Creative'];

  const filteredTemplates = RESUME_TEMPLATES.filter((t) => {
    if (selectedCategory === 'All') return true;
    return t.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Choose footer preset according to theme
  const footerPreset: MeadowTheme = theme === 'dark' ? 'moonlit' : theme === 'light' ? 'meadow' : 'golden';

  return (
    <div className="text-[var(--text-primary)] overflow-hidden relative">
      {/* Warm / Cool Ambient Radiant Glow Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-b from-amber-400/15 via-orange-300/10 to-transparent dark:from-blue-600/15 dark:via-indigo-500/10 dark:to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-10 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        {/* Release Pill with Sun Icon */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold mb-6 hover:border-[var(--accent-primary)] transition-colors shadow-2xs">
          <Sun size={13} className="text-amber-600 dark:text-amber-400" />
          <span className="tracking-wide">ENGINEERED FOR GOOGLE CLOUD & GEMINI AI</span>
          <ArrowRight size={12} className="text-[var(--text-muted)]" />
        </div>

        {/* Editorial Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4 leading-[1.1] font-serif">
          Good resumes. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400">
            All career long.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
          Get interviews at top companies with AI-crafted, ATS-optimized cloud resumes. Powered by
          Google Gemini and designed for modern cloud careers.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-page)] text-sm font-semibold rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Start building for free ↗
          </Link>
          <Link
            to="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-sm font-semibold rounded-full border border-[var(--border-subtle)] shadow-xs transition-all"
          >
            Explore templates
          </Link>
        </div>

        {/* Live Metrics Ticker Banner - Eliminates barren emptiness & builds instant credibility */}
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="text-center p-2 rounded-xl bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Zap size={14} /> 98.4%
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">ATS Pass Rate</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Award size={14} /> 14,200+
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Resumes Generated</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <Cpu size={14} /> &lt; 1.2s
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Vector PDF Compile</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-[var(--bg-subtle)]">
            <div className="flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Lock size={14} /> 100%
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Isolated Security</div>
          </div>
        </div>

        {/* Company Logos Proof Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)] font-medium">
          <span>Engineers hired at:</span>
          <span className="font-semibold text-[var(--text-secondary)]">Google</span>
          <span>•</span>
          <span className="font-semibold text-[var(--text-secondary)]">Amazon</span>
          <span>•</span>
          <span className="font-semibold text-[var(--text-secondary)]">Microsoft</span>
          <span>•</span>
          <span className="font-semibold text-[var(--text-secondary)]">Stripe</span>
          <span>•</span>
          <span className="font-semibold text-[var(--text-secondary)]">Spotify</span>
        </div>

        {/* Hero Preview Card */}
        <HeroGlassPreview />
      </section>

      {/* ─── Bento Grid Feature Section ───────────────────────────────────── */}
      <BentoFeaturesSection />

      {/* ─── Template Gallery Previews ────────────────────────────────────── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Layers size={12} />
            Curated Styles
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight font-serif">
            Templates designed to impress recruiters
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-4">
            Every template is crafted for ATS compatibility, elegant typography, and instant PDF compilation.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-xs'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(filteredTemplates.length > 0 ? filteredTemplates.slice(0, 4) : RESUME_TEMPLATES.slice(0, 4)).map((t) => (
            <DarkTemplatePreviewCard
              key={t.id}
              name={t.name}
              primary={t.colorScheme.primary}
              accent={t.colorScheme.accent}
              category={t.category}
            />
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent-primary)] hover:opacity-80 transition-colors bg-[var(--bg-surface)] px-4 py-2 rounded-full border border-[var(--border-subtle)] shadow-2xs"
          >
            Explore all {RESUME_TEMPLATES.length} templates
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ─── How It Works (Step Workflow Pipeline) ────────────────────────── */}
      <section id="how-it-works" className="py-10 sm:py-14 px-4 sm:px-6 bg-[var(--bg-subtle)] border-y border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1.5 block font-semibold">
              Execution Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2 font-serif">
              From blank draft to job interviews in 4 steps
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              A streamlined, high-speed automated pipeline built with cloud-native reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] relative group hover:border-[var(--accent-primary)] transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-cyan-400 dark:to-blue-400">
                      {step.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-2">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            Candidate Success
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight font-serif">
            Loved by software engineers and professionals
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
            Join candidates who boosted their ATS pass rates and landed offers with CloudResumeAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} size={13} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center text-xs font-bold shrink-0 border border-amber-500/30">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-6 sm:p-10 text-center relative overflow-hidden shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight font-serif">
            Start building your interview-winning resume today
          </h2>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Free forever in development mode. Zero credit card required. Experience cutting-edge AI career engineering.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-page)] text-sm font-semibold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get started for free ↗
          </Link>
        </div>
      </section>

      {/* ─── Footer: Meadow Rise Animated Canvas Footer (Synced with Theme) ─ */}
      <MeadowRiseFooter
        name="CloudResumeAI"
        preset={footerPreset}
        tagline="Next-generation cloud resume engineering powered by Google Cloud Platform & Gemini AI."
        subheading="Optimize for ATS scanners, craft impact bullets, and export vector PDFs in milliseconds."
        cta={{ label: "Start Building Free", href: "/dashboard" }}
      />
    </div>
  );
};

export default LandingPage;