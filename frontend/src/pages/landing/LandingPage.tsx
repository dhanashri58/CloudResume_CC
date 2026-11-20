import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Clock,
  Briefcase,
  Check,
  CheckCircle2,
  Wand2,
  Globe,
  TrendingUp,
  ArrowUpRight,
  Star,
  Zap,
} from 'lucide-react';
import OptimizeResumeModal from '../../components/modals/OptimizeResumeModal';
import MeadowRiseFooter, { MeadowPreset } from '../../components/ui/meadow-rise-footer';
import { useTheme } from '../../context/ThemeContext';

// ─── Color Swatches for Hero Resume Preview ───────────────────────────────────
const HERO_PALETTES = [
  { id: 'cream', name: 'Warm Cream', hex: '#A38F78' },
  { id: 'maroon', name: 'Executive Crimson', hex: '#991B1B' },
  { id: 'charcoal', name: 'Charcoal Slate', hex: '#1E293B' },
  { id: 'amber', name: 'Burnt Amber', hex: '#D97706' },
  { id: 'emerald', name: 'Forest Emerald', hex: '#059669' },
];

// ─── Hero Resume Document Preview ─────────────────────────────────────────────
const HeroResumeDocument: React.FC<{
  activeColor: string;
  onSelectColor: (hex: string) => void;
  onOpenOptimize: () => void;
}> = ({ activeColor, onSelectColor, onOpenOptimize }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none select-none">
      
      {/* Decorative Golden/Green Scribble Behind Top Left */}
      <svg
        className="absolute -top-7 -left-7 w-24 h-24 text-amber-500/70 dark:text-amber-400/50 pointer-events-none -z-10"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path d="M15,10 Q35,45 20,80" />
        <path d="M30,10 Q50,45 35,80" />
        <path d="M45,10 Q65,45 50,80" />
        <path d="M60,10 Q80,45 65,80" />
      </svg>

      {/* Floating Burnt-Amber Pill (Top Right): Enhance with AI */}
      <button
        onClick={onOpenOptimize}
        className="absolute -top-3 right-6 z-30 flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full text-xs font-bold shadow-lg shadow-amber-600/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Sparkles size={12} className="fill-white" />
        <span>Enhance with AI</span>
      </button>

      {/* Floating Left Callout: Step-by-step content recommendations */}
      <div className="hidden sm:block absolute -left-8 top-44 z-30 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-300 dark:border-amber-700/60 shadow-xl rounded-2xl p-3 text-[10px] text-slate-700 dark:text-slate-300 leading-tight">
        <div className="flex items-start gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[9px] shrink-0">
            <Check size={9} />
          </div>
          <p className="font-bold text-slate-900 dark:text-white">
            Google XYZ recommendations:
          </p>
        </div>
        <p className="text-slate-500 dark:text-slate-400 pl-5">
          Hand-crafted bullet points for maximum recruiter impact.
        </p>
        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 pl-1 text-[9px] text-amber-700 dark:text-amber-400 font-semibold">
          <Zap size={10} className="text-amber-500 shrink-0" />
          <span>Hand-crafted for maximum ATS scoring</span>
        </div>
      </div>

      {/* White A4 Resume Card with Warm Shadow */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-[#EAE3D5] dark:border-slate-800 overflow-hidden text-slate-800 transition-all duration-300">
        
        {/* Top Header Banner with Active Accent Color */}
        <div
          className="p-4 sm:p-5 text-white flex items-center justify-between transition-colors duration-300"
          style={{ backgroundColor: activeColor }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/avatars/candidate-avatar.png"
              alt="Tanmay Kumbhare"
              className="w-11 h-11 rounded-xl object-cover border-2 border-white/40 shadow-sm shrink-0"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wider uppercase leading-none font-sans">
                TANMAY KUMBHARE
              </h3>
              <p className="text-[10px] text-white/80 mt-1">
                Pune, India · tanmay.kumbhare24@vit.edu · Cloud Engineer
              </p>
            </div>
          </div>
        </div>

        {/* Resume Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5 text-left">
          
          {/* Summary */}
          <div>
            <p
              className="text-[9.5px] font-black uppercase tracking-wider mb-0.5"
              style={{ color: activeColor }}
            >
              PROFESSIONAL SUMMARY
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Customer-focused Cloud Engineer with 5+ years of experience architecting high-throughput microservices, serverless APIs, and automated CI/CD pipelines. Proven track record of boosting system reliability to 99.99%.
            </p>
          </div>

          {/* Two Columns: Skills & Experience */}
          <div className="grid grid-cols-12 gap-3 pt-0.5">
            {/* Skills */}
            <div className="col-span-5 space-y-1">
              <p
                className="text-[9.5px] font-black uppercase tracking-wider"
                style={{ color: activeColor }}
              >
                SKILLS
              </p>
              <div className="text-[9px] text-slate-600 space-y-0.5">
                <p>• Google Cloud Run &amp; GCS</p>
                <p>• Python, Flask &amp; FastAPI</p>
                <p>• React, TypeScript &amp; Tailwind</p>
                <p>• Docker &amp; CI/CD Pipelines</p>
                <p>• Vector PDF Engine</p>
              </div>
            </div>

            {/* Experience */}
            <div className="col-span-7 space-y-1">
              <p
                className="text-[9.5px] font-black uppercase tracking-wider"
                style={{ color: activeColor }}
              >
                EXPERIENCE
              </p>
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-900 leading-tight">
                  <span>Senior Cloud Engineer</span>
                  <span className="text-[8.5px] text-slate-400">2021 – Present</span>
                </div>
                <p className="text-[9px] text-slate-500 italic">Cloud Tech Systems · New Delhi, India</p>
                <ul className="text-[9px] text-slate-600 space-y-0.5 mt-1">
                  <li>• Architected serverless REST API on Cloud Run, cutting latency by 42%.</li>
                  <li>• Implemented Google OIDC authentication with 99.99% system uptime.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="pt-1 border-t border-slate-100">
            <p
              className="text-[9.5px] font-black uppercase tracking-wider mb-0.5"
              style={{ color: activeColor }}
            >
              EDUCATION
            </p>
            <div className="flex items-center justify-between text-[9px]">
              <div>
                <span className="font-bold text-slate-800">B.Tech in Computer Science &amp; Engineering</span>
                <span className="text-slate-500 block">Indian Institute of Technology (IIT)</span>
              </div>
              <span className="text-slate-400">2017 – 2021</span>
            </div>
          </div>

        </div>

        {/* Floating Candidate Circular Photo Avatar (Right edge) */}
        <div className="absolute right-5 top-12 z-20">
          <div
            className="w-14 h-14 rounded-full border-2 p-0.5 shadow-lg bg-white overflow-hidden"
            style={{ borderColor: activeColor }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-700 flex items-center justify-center text-white font-extrabold text-sm">
              AS
            </div>
          </div>
        </div>

        {/* Color Palette Switcher Pill (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-md rounded-full px-2.5 py-1.5 flex items-center gap-1.5">
          {HERO_PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectColor(p.hex)}
              title={p.name}
              className={`w-4 h-4 rounded-full transition-all flex items-center justify-center ${
                activeColor === p.hex
                  ? 'ring-2 ring-offset-1 ring-amber-600 scale-110'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: p.hex }}
            >
              {activeColor === p.hex && <Check size={8} className="text-white font-black" />}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};

// ─── Main Landing Page Component ──────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const [activeColor, setActiveColor] = useState(HERO_PALETTES[3].hex);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const { theme } = useTheme();

  // Map application theme into Meadow preset
  const footerPreset: MeadowPreset = theme === 'dark' ? 'moonlit' : 'golden';

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200 font-sans">
      
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtitle, Burnt-Amber CTA Buttons, Rating */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-[1.08] font-sans">
              India's Top
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-amber-500 bg-clip-text text-transparent">
                Resume Templates
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Get the job 2x as fast.¹ Use recruiter-approved templates and step-by-step content recommendations to create a new resume or optimize your current one.
            </p>

            {/* Warm Burnt-Amber / Charcoal CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/editor/new" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold rounded-full shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <span>Create new resume</span>
                  <ArrowUpRight size={16} />
                </button>
              </Link>

              <button
                onClick={() => setIsOptimizeOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border-2 border-[var(--border-subtle)] hover:border-amber-600 text-sm font-bold rounded-full shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Optimize my resume</span>
              </button>
            </div>

            {/* Authentic Project Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-xs">
              <span className="font-bold text-[var(--text-primary)] uppercase text-[11px] tracking-wide">
                VIT PUNE
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                Cloud Computing Course Project (CP)
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px] flex items-center gap-0.5">
                ★ Live Deployment
              </span>
            </div>

          </div>

          {/* Right Column: Hero Resume Preview Canvas */}
          <div className="lg:col-span-6">
            <HeroResumeDocument
              activeColor={activeColor}
              onSelectColor={setActiveColor}
              onOpenOptimize={() => setIsOptimizeOpen(true)}
            />
          </div>

        </div>
      </section>

      {/* ─── Section 2: "Create a resume that gets results" ─────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Heading with Curvy Hand-drawn Arrow and Deep Charcoal Pill */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 mb-14 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight font-sans">
              Create a resume
              <br />
              <span className="relative inline-block">
                that gets results
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2 text-amber-500"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10, 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h2>

            {/* Hand-drawn Curvy Arrow & Charcoal Pill Button with Directional Arrow */}
            <div className="flex items-center gap-3">
              <span className="text-2xl text-[var(--text-muted)] hidden md:inline transform rotate-12">
                ⤹
              </span>
              <Link to="/templates">
                <button className="px-8 py-3.5 bg-[#18181B] dark:bg-amber-600 hover:bg-black dark:hover:bg-amber-700 text-white rounded-full font-bold text-sm shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <span>Choose a template</span>
                  <ArrowUpRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* 3 Refined Feature Pillars with Warm Aesthetic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Column 1: Recruiter-Approved Resume */}
            <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-amber-500/40 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center shadow-xs">
                <Camera size={22} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Recruiter-Approved Resume
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We work with recruiters to design resume templates that format automatically and pass modern ATS parsers.
              </p>
            </div>

            {/* Column 2: Finish Your Resume in 15 Minutes */}
            <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-amber-500/40 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center shadow-xs">
                <Clock size={22} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Finish Your Resume in 15 Minutes
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                CloudResumeAI helps you tackle your work experience by reminding you what you did at your job with intelligent suggestions.
              </p>
            </div>

            {/* Column 3: Land an Interview */}
            <div className="p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-amber-500/40 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 flex items-center justify-center shadow-xs">
                <Briefcase size={22} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Land an Interview
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We suggest the skills you should add. It helped over a million people get interviews.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Section 3: "6 features to boost your job search" ───────────────── */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3 border border-amber-500/20">
            <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
            <span>Golden Hour Architecture Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight font-sans">
            6 features to boost your job search
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Everything required to dominate the applicant pool and accelerate your cloud engineering career.
          </p>
        </div>

        {/* 6 Refined Elevated Cards (2 Rows of 3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: 35+ Template Designs */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="relative w-full max-w-[200px] h-28 flex items-center justify-center">
                <div className="absolute w-24 h-28 bg-white dark:bg-slate-700 rounded-md shadow-md border border-slate-200 dark:border-slate-600 -rotate-12 translate-x-[-20px] p-2">
                  <div className="w-8 h-1.5 bg-amber-600 rounded-full mb-1.5" />
                  <div className="w-14 h-1 bg-slate-300 dark:bg-slate-500 rounded mb-1" />
                  <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
                <div className="absolute w-24 h-28 bg-white dark:bg-slate-700 rounded-md shadow-md border border-slate-200 dark:border-slate-600 rotate-6 translate-x-[20px] p-2">
                  <div className="w-8 h-1.5 bg-orange-500 rounded-full mb-1.5" />
                  <div className="w-14 h-1 bg-slate-300 dark:bg-slate-500 rounded mb-1" />
                  <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
                <div className="relative w-28 h-32 bg-white dark:bg-slate-700 rounded-md shadow-xl border border-slate-300 dark:border-slate-500 z-10 p-2.5">
                  <div className="w-12 h-2 bg-emerald-600 rounded-full mb-2" />
                  <div className="w-20 h-1 bg-slate-300 dark:bg-slate-500 rounded mb-1" />
                  <div className="w-16 h-1 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                  <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-600 my-1.5" />
                  <div className="w-22 h-1 bg-slate-200 dark:bg-slate-600 rounded" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">35+ Template Designs</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Recruiter-vetted layouts that highlight your strengths and pass automated ATS screening tests.
              </p>
            </div>
          </div>

          {/* Card 2: Enhance with AI */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="w-full max-w-[220px] bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-3.5 space-y-2 text-[10px]">
                <p className="font-bold text-slate-800 dark:text-slate-100 pb-1.5 border-b border-slate-100 dark:border-slate-600">
                  Here are a few options for AI enhanced grammar, clarity and readability
                </p>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Grammar &amp; impact rewrite</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Google XYZ formula applied</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Enhance with AI</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Instantly turn passive job duties into high-impact accomplishments using Google Gemini AI.
              </p>
            </div>
          </div>

          {/* Card 3: Resume Review */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="w-full max-w-[220px] bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-3.5 text-[10px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Review Diagnostic</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                    98 / 100
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-600 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-600 h-full w-[98%]" />
                </div>
                <p className="text-[9.5px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  ATS formatting is clean. All keywords properly matched to target cloud role.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Resume Review</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Diagnostic scoring on readability, keyword density, and hiring manager appeal.
              </p>
            </div>
          </div>

          {/* Card 4: AI Cover Letter Builder */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="w-full max-w-[210px] bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-3.5 space-y-1.5 text-[9.5px]">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <Wand2 size={13} />
                  <span>Matching Cover Letter</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  "Dear Hiring Team, I am thrilled to apply for the Senior Cloud Engineer position. My background in serverless systems..."
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">AI Cover Letter Builder</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Generate tailored cover letters matched to specific job roles and job descriptions in seconds.
              </p>
            </div>
          </div>

          {/* Card 5: Resume Website */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="w-full max-w-[220px] bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 overflow-hidden text-[9px]">
                <div className="bg-slate-100 dark:bg-slate-600 px-2 py-1.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-500 font-mono text-[8px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <Globe size={11} className="text-amber-600 dark:text-amber-400" />
                    <span>cloudresume.ai/u/aarav</span>
                  </div>
                  <span className="text-[7.5px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                    Your resume URL
                  </span>
                </div>
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-amber-500/30">
                      <img src="/avatars/candidate-avatar.png" alt="Tanmay Kumbhare" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Tanmay Kumbhare</p>
                      <p className="text-[8px] text-slate-500 dark:text-slate-400">Cloud Portfolio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Resume Website</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Publish a personalized, live web resume URL you can add directly to LinkedIn and outreach emails.
              </p>
            </div>
          </div>

          {/* Card 6: Resume Tracking */}
          <div className="rounded-3xl border border-[#EAE3D5] dark:border-slate-800 bg-[var(--bg-surface)] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/50 hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden mb-4 p-4">
              <div className="w-full max-w-[210px] bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 p-3 text-[9.5px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" />
                    Employers clicking your resume
                  </span>
                </div>
                <p className="text-[8px] text-slate-500 dark:text-slate-400 mb-1">for jobs you applied to</p>
                <div className="h-10 flex items-end gap-1.5 pt-2">
                  <div className="flex-1 bg-amber-200 dark:bg-amber-900/60 rounded-t h-[35%]" />
                  <div className="flex-1 bg-amber-300 dark:bg-amber-800/60 rounded-t h-[50%]" />
                  <div className="flex-1 bg-amber-400 dark:bg-amber-700/60 rounded-t h-[70%]" />
                  <div className="flex-1 bg-amber-600 dark:bg-amber-600 rounded-t h-[95%]" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Resume Tracking</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Receive real-time notifications when hiring managers view or download your resume.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ─── NEW FULL-BLEED CTA + EDITORIAL MEADOW RISE FOOTER SECTION ──────── */}
      <MeadowRiseFooter
        name="CloudResumeAI"
        brandHref="/"
        scrollParallax={false}
        preset={footerPreset}
        height="920px"
        heroHeight="clamp(440px, 50vh, 560px)"
        heading={"Engineering\nHigh-Impact Cloud\nCareers with Gemini AI"}
        subheading="Optimize for ATS scanners, craft impact bullets, and export vector PDFs in milliseconds."
        tagline="Next-generation cloud resume engineering powered by Google Cloud Platform & Gemini AI."
        placeholder="Enter your university / work email"
        cta={{ label: "Start Building Free", href: "/dashboard" }}
        columns={[
          {
            title: "Navigate",
            links: [
              { label: "Home", href: "/" },
              { label: "About", href: "/#features" },
              { label: "Templates", href: "/templates" },
              { label: "Dashboard", href: "/dashboard" },
            ],
          },
          {
            title: "Cloud",
            links: [
              { label: "Google Cloud Platform", href: "/#architecture" },
              { label: "Cloud Run", href: "/#architecture" },
              { label: "Cloud Storage", href: "/#architecture" },
            ],
          },
          {
            title: "AI Assistant",
            links: [
              { label: "Gemini AI", href: "/ai" },
              { label: "ATS Scorer", href: "/ai" },
              { label: "Career Coach", href: "/ai" },
            ],
          },
        ]}
        socials={[
          { icon: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
          { icon: "instagram", href: "https://instagram.com", label: "Instagram" },
          { icon: "facebook", href: "https://facebook.com", label: "Facebook" },
          { icon: "x", href: "https://twitter.com", label: "X" },
        ]}
        legal={[
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Use", href: "#" },
        ]}
      />

      {/* ─── OPTIMIZE RESUME MODAL WIZARD ───────────────────────────────────── */}
      <OptimizeResumeModal
        isOpen={isOptimizeOpen}
        onClose={() => setIsOptimizeOpen(false)}
      />

    </div>
  );
};

export default LandingPage;