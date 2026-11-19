import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  BarChart3,
  Download,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Cpu,
  ChevronRight,
  Check,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import MeadowRiseFooter from '../../components/ui/meadow-rise-footer';

// ─── Interactive Hero Glass Preview Card ──────────────────────────────────────

const HeroGlassPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'improved' | 'original'>('improved');

  return (
    <div className="relative mx-auto w-full max-w-4xl mt-14 sm:mt-16 group">
      {/* Glow aura beneath the card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-violet-600/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Glass card container */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0d1427]/80 backdrop-blur-xl shadow-2xl overflow-hidden p-4 sm:p-7 text-left transition-all duration-300">
        
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs text-slate-400 font-mono pl-2 border-l border-white/10">
              alex_morgan_cloud_architect.pdf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ATS Score: 96%
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles size={11} />
              Gemini Optimized
            </span>
          </div>
        </div>

        {/* Card Body - Grid Mockup */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Candidate Info & AI Optimization */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Alex Morgan</h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Senior Cloud Architect
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seattle, WA · linkedin.com/in/alex-cloud · alex.morgan@example.com
              </p>
            </div>

            {/* AI Bullet Improvement Diff Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles size={13} className="text-indigo-400" />
                  <span>Experience Bullet Optimization</span>
                </div>
                <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-[11px]">
                  <button
                    onClick={() => setActiveTab('improved')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      activeTab === 'improved'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Enhanced
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      activeTab === 'original'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {activeTab === 'improved' ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <p className="text-xs text-emerald-300 font-mono leading-relaxed">
                    + Architected serverless Google Cloud Run microservices using Terraform IaC, decreasing deployment latency by 68% and achieving 99.99% availability.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Google XYZ Formula
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Quantified Metric (+68%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <p className="text-xs text-slate-400 line-through font-mono leading-relaxed">
                    - Helped deploy application containers to the cloud and assisted with infrastructure code.
                  </p>
                  <p className="text-[10px] text-amber-400 mt-1">
                    Lacks measurable business outcome and active power verbs.
                  </p>
                </div>
              )}
            </div>

            {/* Keyword Match Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>ATS Target Role Alignment</span>
                <span className="text-white font-semibold">96% Match</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full w-[96%]" />
              </div>
            </div>
          </div>

          {/* Right Column: Mini Resume Template Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
                <span className="text-xs font-semibold text-slate-300">Matched ATS Keywords</span>
                <span className="text-[10px] text-blue-400">14 / 15 present</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Azure Bicep', 'PostgreSQL', 'Docker', 'Kubernetes', 'OAuth2 / OIDC', 'Terraform', 'CI/CD Pipelines', 'REST APIs'].map(
                  (tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300"
                    >
                      <Check size={10} className="text-emerald-400" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] text-slate-400 font-mono">ReportLab Engine Active</span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
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
    <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
          <Cpu size={13} />
          Engineered for Modern Hiring
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Everything required to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
            dominate the applicant pool
          </span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Traditional resume builders export broken HTML or clunky tables. CloudResumeAI utilizes serverless AI, vector rendering, and enterprise cloud architecture.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Bento 1: Large Featured Card - AI Bullet Enhancer (Span 7) */}
        <div className="md:col-span-7 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-colors" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles size={20} />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
              gemini-3.5-flash-lite
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            AI-Powered Bullet Point Optimization
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Automatically transform weak, passive responsibilities into quantified business results using Google's proven XYZ methodology.
          </p>

          {/* Interactive Visual Widget */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#080d1a] border border-white/[0.08]">
            <div className="flex items-start gap-2.5 text-xs text-rose-300/80 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10">
              <span className="font-mono text-rose-400">RAW:</span>
              <span>"Created REST API endpoints in Python for user authentication."</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-300 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
              <span className="font-mono text-emerald-400">AI:</span>
              <span>"Engineered stateless Python Flask REST API with RS256 token verification, accelerating authentication throughput by 3.4x."</span>
            </div>
          </div>
        </div>

        {/* Bento 2: ATS Scanner & Score Radar (Span 5) */}
        <div className="md:col-span-5 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-colors" />

          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Real-Time ATS Score Radar
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Scan candidate text against raw recruiter job descriptions to detect keyword omissions before submitting.
            </p>
          </div>

          {/* Radial score gauge visual */}
          <div className="p-4 rounded-xl bg-[#080d1a] border border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                94 / 100
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">High Interview Probability</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-emerald-400 font-mono">18 matched</span>
              <span className="text-[11px] text-rose-400 font-mono">1 keyword gap</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Server-Side Vector PDF Engine (Span 4) */}
        <div className="md:col-span-4 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 backdrop-blur-xl group hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <Download size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
            Vector PDF Engine
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            Compiled server-side using Python ReportLab. Clean vector typography, zero blurry images, and two-pass page numbering.
          </p>
          <div className="text-[11px] font-mono text-violet-300 bg-violet-500/10 p-2.5 rounded-lg border border-violet-500/20 flex items-center justify-between">
            <span>A4 Document Buffer</span>
            <span className="text-white font-bold">100% Vector</span>
          </div>
        </div>

        {/* Bento 4: Enterprise Identity & Zero-Trust Privacy (Span 4) */}
        <div className="md:col-span-4 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 backdrop-blur-xl group hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
            Microsoft Entra ID & Privacy
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            Enterprise OAuth 2.0 / OpenID Connect token authentication with public JWKS key validation and multi-tenant database isolation.
          </p>
          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
            <span>RS256 JWT Signed</span>
            <span className="text-white font-bold">Zero Leaks</span>
          </div>
        </div>

        {/* Bento 5: Cloud-Native Observability & Telemetry (Span 4) */}
        <div className="md:col-span-4 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 backdrop-blur-xl group hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
            Observability & Analytics
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            Structured logging, end-to-end `X-Request-ID` correlation, Server-Timing latency metrics, and real-time view tracking.
          </p>
          <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-center justify-between">
            <span>Latency Monitored</span>
            <span className="text-white font-bold">&lt; 1.2s API</span>
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Template Preview Card ────────────────────────────────────────────────────

const DarkTemplatePreviewCard: React.FC<{
  name: string;
  primary: string;
  accent: string;
  bg: string;
  category?: string;
}> = ({ name, primary, accent, bg, category }) => (
  <div className="group rounded-2xl border border-white/10 overflow-hidden bg-[#0d1427]/80 backdrop-blur-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg">
    {/* Colored header line */}
    <div className="h-2 w-full" style={{ background: accent }} />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white tracking-tight">{name}</p>
        {category && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
            {category}
          </span>
        )}
      </div>

      {/* Miniature preview canvas representation */}
      <div className="rounded-lg p-3 space-y-2 border border-white/5" style={{ background: bg ? `${bg}15` : 'rgba(0,0,0,0.3)' }}>
        <div className="h-2.5 w-24 rounded-full" style={{ background: accent, opacity: 0.9 }} />
        <div className="h-1.5 w-16 rounded-full" style={{ background: primary, opacity: 0.5 }} />
        <div className="mt-3 space-y-1.5 pt-2 border-t border-white/5">
          {[88, 72, 60, 78].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${w}%`,
                background: '#94a3b8',
                opacity: 0.2 + i * 0.05,
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
    desc: 'Pick from 8 designer color palettes engineered for ATS compliance and clean visual hierarchy.',
  },
  {
    step: '02',
    title: 'Input Your Career History',
    desc: 'Add your professional experience, academic degrees, portfolio projects, and categorized skill tags.',
  },
  {
    step: '03',
    title: 'Apply Gemini AI Enhancements',
    desc: 'Let Google Gemini rewrite passive duties into high-impact accomplishment bullets with quantified metrics.',
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
    quote:
      'CloudResumeAI helped me land 3 interviews in a week. The AI bullet improvements were incredible and immediately stood out.',
    avatar: 'PK',
    stars: 5,
  },
  {
    name: 'James Liu',
    role: 'Product Manager at Figma',
    quote:
      'Best resume tool I have ever used. The ATS score feature alone saved me countless rejections by revealing keyword gaps.',
    avatar: 'JL',
    stars: 5,
  },
  {
    name: 'Sara Okafor',
    role: 'Cloud Architect at Stripe',
    quote:
      'The templates are beautiful, modern, and actually pass automated screening. Truly enterprise-grade engineering.',
    avatar: 'SO',
    stars: 5,
  },
];

// ─── Main Landing Page Component ──────────────────────────────────────────────

const LandingPage: React.FC = () => {
  return (
    <div className="text-slate-100 overflow-hidden relative">
      {/* Background Radial Glow Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-20 sm:pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium mb-8 hover:border-indigo-500/40 transition-colors shadow-glow-sm">
          <Zap size={13} className="text-amber-400" />
          <span>Powered by Google Gemini AI · Public Beta</span>
          <ArrowRight size={12} className="text-slate-400" />
        </div>

        {/* High-Contrast Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
          Build resumes that{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
            get interviews
          </span>
        </h1>

        {/* Refined Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          CloudResumeAI combines designer vector templates, serverless Gemini AI rewriting, and real-time ATS compatibility scoring to accelerate your job hunt.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-glow-md hover:scale-[1.02] active:scale-[0.98] border border-white/15"
          >
            Start building for free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-sm font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            Browse templates
          </Link>
        </div>

        {/* Reassurance text */}
        <p className="mt-5 text-xs text-slate-400 font-mono">
          No credit card required · Free forever development plan
        </p>

        {/* Floating Glassmorphism Hero Preview Card */}
        <HeroGlassPreview />
      </section>

      {/* ─── Bento Grid Feature Section ───────────────────────────────────── */}
      <BentoFeaturesSection />

      {/* ─── Template Gallery Previews ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Templates designed to impress recruiters
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every template is crafted for ATS compatibility, elegant typography, and instant PDF compilation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {RESUME_TEMPLATES.slice(0, 4).map((t) => (
            <DarkTemplatePreviewCard
              key={t.id}
              name={t.name}
              primary={t.colorScheme.primary}
              accent={t.colorScheme.accent}
              bg={t.colorScheme.bg}
              category={t.category}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Explore all {RESUME_TEMPLATES.length} templates
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ─── How It Works (Step Workflow) ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white/[0.01] border-y border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2 block">
              Execution Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              From blank draft to job interviews in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-white/[0.08] bg-[#0d1427]/50 backdrop-blur-sm relative group hover:border-indigo-500/30 transition-colors"
              >
                <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-3">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-white mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Loved by software engineers and professionals
          </h2>
          <p className="text-slate-400 text-sm">
            Join candidates who boosted their ATS pass rates and landed offers with CloudResumeAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/10 bg-[#0d1427]/60 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA Banner ────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-violet-900/40 p-8 sm:p-14 text-center backdrop-blur-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Start building your interview-winning resume today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Free forever in development mode. Zero credit card required. Experience cutting-edge AI career engineering.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white text-sm font-semibold rounded-xl shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── Footer: Meadow Rise Animated Canvas Footer ───────────────────── */}
      <MeadowRiseFooter
        name="CloudResumeAI"
        preset="moonlit"
        tagline="Next-generation cloud resume engineering powered by Google Cloud Platform & Gemini AI."
        subheading="Optimize for ATS scanners, craft impact bullets, and export vector PDFs in milliseconds."
        cta={{ label: "Start Building Free", href: "/dashboard" }}
      />
    </div>
  );
};

export default LandingPage;
