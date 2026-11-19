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
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import MeadowRiseFooter from '../../components/ui/meadow-rise-footer';

// ─── Interactive Hero Preview Card (Golden Hour Edition) ──────────────────────

const HeroGlassPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'improved' | 'original'>('improved');

  return (
    <div className="relative mx-auto w-full max-w-4xl mt-14 sm:mt-16 group">
      {/* Warm ambient aura beneath the card */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/20 via-orange-400/15 to-amber-600/20 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Pure White & Sand Card Container */}
      <div className="relative rounded-3xl border border-[#E7DFD5] bg-white shadow-2xl shadow-stone-300/40 overflow-hidden p-5 sm:p-8 text-left transition-all duration-300">
        
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#EFEAE2]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <span className="text-xs text-stone-500 font-mono pl-2 border-l border-stone-200">
              alex_morgan_cloud_architect.pdf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ATS Score: 98%
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
              <Sparkles size={11} className="text-amber-600" />
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
                <h3 className="text-lg font-bold text-[#1C1917] tracking-tight">Alex Morgan</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300/50 font-semibold">
                  Senior Cloud Architect
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Seattle, WA · linkedin.com/in/alex-cloud · alex.morgan@example.com
              </p>
            </div>

            {/* AI Bullet Improvement Diff Box */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Experience Bullet Optimization</span>
                </div>
                <div className="flex rounded-lg bg-[#EFEAE2] p-0.5 text-[11px]">
                  <button
                    onClick={() => setActiveTab('improved')}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeTab === 'improved'
                        ? 'bg-white text-[#1C1917] shadow-sm'
                        : 'text-stone-500 hover:text-[#1C1917]'
                    }`}
                  >
                    AI Enhanced
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                      activeTab === 'original'
                        ? 'bg-white text-[#1C1917] shadow-sm'
                        : 'text-stone-500 hover:text-[#1C1917]'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {activeTab === 'improved' ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <p className="text-xs text-emerald-800 font-mono leading-relaxed bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/80">
                    + Architected serverless Google Cloud Run microservices using Terraform IaC, decreasing deployment latency by 68% and achieving 99.99% availability.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/60 font-semibold">
                      Google XYZ Formula
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 font-semibold">
                      Quantified Metric (+68%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <p className="text-xs text-stone-500 line-through font-mono leading-relaxed bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                    - Helped deploy application containers to the cloud and assisted with infrastructure code.
                  </p>
                  <p className="text-[10px] text-amber-700 mt-1 font-medium">
                    Lacks measurable business outcome and active power verbs.
                  </p>
                </div>
              )}
            </div>

            {/* Keyword Match Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-600">
                <span>ATS Target Role Alignment</span>
                <span className="text-[#1C1917] font-bold">98% Match</span>
              </div>
              <div className="h-2 w-full bg-[#EFEAE2] rounded-full overflow-hidden p-0.5 border border-[#E7DFD5]">
                <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full w-[98%]" />
              </div>
            </div>
          </div>

          {/* Right Column: Mini Resume Template Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5]">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2] mb-3">
                <span className="text-xs font-semibold text-stone-800">Matched ATS Keywords</span>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  15 / 15 present
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Google Cloud Run', 'Cloud SQL', 'Docker', 'PostgreSQL', 'OAuth 2.0 / OIDC', 'Terraform', 'CI/CD Pipelines', 'REST APIs'].map(
                  (tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white border border-[#E7DFD5] text-stone-800 shadow-2xs font-medium"
                    >
                      <Check size={10} className="text-emerald-600 font-bold" />
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] text-stone-500 font-mono">ReportLab Engine Active</span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
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

// ─── Bento Grid Feature Cards (Golden Hour Edition) ───────────────────────────

const BentoFeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-semibold mb-4">
          <Cpu size={13} className="text-amber-700" />
          Engineered for Modern Hiring
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] tracking-tight mb-4 font-serif">
          Everything required to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600">
            dominate the applicant pool
          </span>
        </h2>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          Traditional resume builders export broken HTML or clunky tables. CloudResumeAI utilizes serverless Gemini AI, in-memory vector PDF rendering, and Google Cloud infrastructure.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Bento 1: Large Featured Card - AI Bullet Enhancer (Span 7) */}
        <div className="md:col-span-7 rounded-3xl border border-[#E7DFD5] bg-white p-6 sm:p-8 relative overflow-hidden group hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Sparkles size={20} />
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-semibold">
              gemini-3.5-flash-lite
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] mb-2 tracking-tight">
            AI-Powered Bullet Point Optimization
          </h3>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            Automatically transform weak, passive responsibilities into quantified business results using Google's proven XYZ methodology.
          </p>

          {/* Interactive Visual Widget */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5]">
            <div className="flex items-start gap-2.5 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <span className="font-mono font-bold text-rose-600">RAW:</span>
              <span>"Created REST API endpoints in Python for user authentication."</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="font-mono font-bold text-emerald-600">AI:</span>
              <span>"Engineered stateless Python Flask REST API with Google OIDC token verification, accelerating authentication throughput by 3.4x."</span>
            </div>
          </div>
        </div>

        {/* Bento 2: ATS Scanner & Score Radar (Span 5) */}
        <div className="md:col-span-5 rounded-3xl border border-[#E7DFD5] bg-white p-6 sm:p-8 relative overflow-hidden group hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-sm">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917] mb-2 tracking-tight">
              Real-Time ATS Score Radar
            </h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Scan candidate text against recruiter job postings to detect missing keywords before submitting applications.
            </p>
          </div>

          {/* Radial score gauge visual */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-emerald-700">
                98 / 100
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">Optimal Interview Probability</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                15 matched
              </span>
              <span className="text-[11px] text-amber-800 font-mono">0 gaps detected</span>
            </div>
          </div>
        </div>

        {/* Bento 3: Server-Side Vector PDF Engine (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[#E7DFD5] bg-white p-6 group hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
            <Download size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917] mb-1.5 tracking-tight">
            Vector PDF Engine
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
            Compiled server-side using Python ReportLab. Clean vector typography, zero blurry raster images, and two-pass page numbering.
          </p>
          <div className="text-[11px] font-mono text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
            <span>A4 Document Buffer</span>
            <span className="text-amber-800 font-bold">100% Vector</span>
          </div>
        </div>

        {/* Bento 4: Google Cloud Identity & Security (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[#E7DFD5] bg-white p-6 group hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
            <Shield size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917] mb-1.5 tracking-tight">
            Cloud Identity & Privacy
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
            Google Cloud Identity & OIDC authentication with public JWKS validation and strict multi-tenant data isolation.
          </p>
          <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between">
            <span>RS256 JWT Signed</span>
            <span className="text-emerald-800 font-bold">Zero Leaks</span>
          </div>
        </div>

        {/* Bento 5: Observability & Telemetry (Span 4) */}
        <div className="md:col-span-4 rounded-3xl border border-[#E7DFD5] bg-white p-6 group hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1C1917] mb-1.5 tracking-tight">
            Observability & Analytics
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
            Structured JSON logging, end-to-end `X-Request-ID` correlation, Server-Timing latency metrics, and Cloud Logging.
          </p>
          <div className="text-[11px] font-mono text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
            <span>Serverless Latency</span>
            <span className="text-amber-800 font-bold">&lt; 1.2s API</span>
          </div>
        </div>

      </div>
    </section>
  );
};

// ─── Template Preview Card (Golden Hour Edition) ──────────────────────────────

const DarkTemplatePreviewCard: React.FC<{
  name: string;
  primary: string;
  accent: string;
  bg: string;
  category?: string;
}> = ({ name, primary, accent, category }) => (
  <div className="group rounded-3xl border border-[#E7DFD5] overflow-hidden bg-white hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl">
    {/* Colored header line */}
    <div className="h-2 w-full" style={{ background: accent }} />
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#1C1917] tracking-tight">{name}</p>
        {category && (
          <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-semibold">
            {category}
          </span>
        )}
      </div>

      {/* Miniature preview canvas representation */}
      <div className="rounded-2xl p-4 space-y-2 border border-[#E7DFD5] bg-[#FAF8F5]">
        <div className="h-2.5 w-24 rounded-full" style={{ background: accent, opacity: 0.9 }} />
        <div className="h-1.5 w-16 rounded-full" style={{ background: primary, opacity: 0.6 }} />
        <div className="mt-3 space-y-1.5 pt-2 border-t border-[#EFEAE2]">
          {[88, 72, 60, 78].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-stone-300"
              style={{
                width: `${w}%`,
                opacity: 0.4 + i * 0.1,
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
    <div className="text-[#1C1917] overflow-hidden relative">
      {/* Warm Ambient Radiant Glow Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-amber-300/20 via-orange-200/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center relative">
        {/* Release Pill with Sun Icon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5EFE6] border border-[#E7DFD5] text-stone-800 text-xs font-semibold mb-8 hover:border-amber-400 transition-colors shadow-2xs">
          <Sun size={14} className="text-amber-600" />
          <span>YOUR SUNNY LITTLE CORNER OF RESUME ENGINEERING</span>
          <ArrowRight size={12} className="text-stone-500" />
        </div>

        {/* Editorial Headline (Reference: Hostinger Golden Hour) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1C1917] mb-6 leading-[1.08] font-serif">
          Good resumes. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600">
            All career long.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Get interviews at top companies with AI-crafted, ATS-optimized cloud resumes. Powered by
          Google Gemini and designed for modern cloud careers.
        </p>

        {/* Action Buttons (Pill Style) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-semibold rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Start building for free ↗
          </Link>
          <Link
            to="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#1C1917] text-sm font-semibold rounded-full border border-[#DCD3C7] shadow-sm hover:border-stone-400 transition-all"
          >
            Explore templates
          </Link>
        </div>

        {/* Reassurance text */}
        <p className="mt-5 text-xs text-stone-500 font-mono">
          Free development access · Google Cloud Run & Secret Manager · ReportLab PDF
        </p>

        {/* Floating Paper Mockup Hero Preview Card */}
        <HeroGlassPreview />
      </section>

      {/* ─── Bento Grid Feature Section ───────────────────────────────────── */}
      <BentoFeaturesSection />

      {/* ─── Template Gallery Previews ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#E7DFD5]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-3 tracking-tight font-serif">
            Templates designed to impress recruiters
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
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
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors bg-amber-50 px-4 py-2 rounded-full border border-amber-200"
          >
            Explore all {RESUME_TEMPLATES.length} templates
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ─── How It Works (Step Workflow) ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-[#FAF8F5] border-y border-[#E7DFD5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 mb-2 block font-semibold">
              Execution Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mb-3 font-serif">
              From blank draft to job interviews in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-[#E7DFD5] bg-white relative group hover:border-amber-400 transition-all shadow-sm"
              >
                <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600 mb-3">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-[#1C1917] mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-3 tracking-tight font-serif">
            Loved by software engineers and professionals
          </h2>
          <p className="text-stone-600 text-sm">
            Join candidates who boosted their ATS pass rates and landed offers with CloudResumeAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-[#E7DFD5] bg-white hover:border-amber-300 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={14} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#EFEAE2]">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0 border border-amber-200">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">{t.name}</p>
                  <p className="text-[11px] text-stone-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA Banner (Warm Sand Luxury) ─────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#E7DFD5] bg-gradient-to-r from-[#FAF6F0] via-[#F5EFE6] to-[#FAF6F0] p-8 sm:p-14 text-center relative overflow-hidden shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] mb-4 tracking-tight font-serif">
            Start building your interview-winning resume today
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Free forever in development mode. Zero credit card required. Experience cutting-edge AI career engineering.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-white text-sm font-semibold rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get started for free ↗
          </Link>
        </div>
      </section>

      {/* ─── Footer: Meadow Rise Animated Canvas Footer (Golden Theme) ────── */}
      <MeadowRiseFooter
        name="CloudResumeAI"
        preset="golden"
        tagline="Next-generation cloud resume engineering powered by Google Cloud Platform & Gemini AI."
        subheading="Optimize for ATS scanners, craft impact bullets, and export vector PDFs in milliseconds."
        cta={{ label: "Start Building Free", href: "/dashboard" }}
      />
    </div>
  );
};

export default LandingPage;
