import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  BarChart3,
  Download,
  ArrowRight,
  Cloud,
  Github,
  Linkedin,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import { Badge } from '../../components/ui';

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Sparkles size={20} className="text-blue-600" />,
    title: 'AI-Powered Writing',
    desc: 'Generate compelling bullet points and summaries tailored to each role you apply for.',
  },
  {
    icon: <Target size={20} className="text-blue-600" />,
    title: 'ATS Optimisation',
    desc: 'Scan your resume against job descriptions and surface missing keywords instantly.',
  },
  {
    icon: <FileText size={20} className="text-blue-600" />,
    title: 'Premium Templates',
    desc: '20+ designer-crafted templates that pass ATS scanners and impress human reviewers.',
  },
  {
    icon: <BarChart3 size={20} className="text-blue-600" />,
    title: 'Real-time Analytics',
    desc: 'See how many recruiters viewed your resume and which version performs best.',
  },
  {
    icon: <Download size={20} className="text-blue-600" />,
    title: 'One-click Export',
    desc: 'Export to clean PDF or DOCX instantly. Share with a link or download directly.',
  },
  {
    icon: <Shield size={20} className="text-blue-600" />,
    title: 'Privacy First',
    desc: 'Your data stays yours. We never sell or share your resume data with third parties.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose a template',
    desc: 'Pick from 20+ professionally designed templates suited to your industry.',
  },
  {
    step: '02',
    title: 'Fill in your details',
    desc: 'Use our structured editor to add your experience, education, and skills.',
  },
  {
    step: '03',
    title: 'Let AI enhance it',
    desc: 'Ask the AI assistant to improve your bullet points and tailor content for roles.',
  },
  {
    step: '04',
    title: 'Export and apply',
    desc: 'Download a polished PDF and start applying with confidence.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Priya Kapoor',
    role: 'Software Engineer at Spotify',
    quote:
      'CloudResumeAI helped me land 3 interviews in a week. The AI bullet improvements were incredible.',
    avatar: 'PK',
    stars: 5,
  },
  {
    name: 'James Liu',
    role: 'Product Manager at Figma',
    quote:
      'Best resume tool I\'ve used. The ATS score feature alone saved me countless rejections.',
    avatar: 'JL',
    stars: 5,
  },
  {
    name: 'Sara Okafor',
    role: 'Data Scientist at Stripe',
    quote:
      'The templates are beautiful and actually pass automated screening. Highly recommend.',
    avatar: 'SO',
    stars: 5,
  },
];

// ─── Template preview card ────────────────────────────────────────────────────

const TemplatePreviewCard: React.FC<{
  name: string;
  primary: string;
  accent: string;
  bg: string;
}> = ({ name, primary, accent, bg }) => (
  <div
    className="rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    style={{ background: bg }}
  >
    {/* Header bar */}
    <div
      className="h-2 w-full"
      style={{ background: accent }}
    />
    <div className="p-4 space-y-2">
      <div
        className="h-2.5 w-28 rounded-full"
        style={{ background: primary, opacity: 0.8 }}
      />
      <div
        className="h-1.5 w-20 rounded-full"
        style={{ background: accent, opacity: 0.6 }}
      />
      <div className="mt-3 space-y-1.5">
        {[80, 64, 56, 72].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{
              width: `${w}%`,
              background: primary,
              opacity: 0.15 + i * 0.05,
            }}
          />
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div
          className="h-1.5 w-16 rounded-full mb-1.5"
          style={{ background: primary, opacity: 0.5 }}
        />
        {[72, 60].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full mb-1"
            style={{ width: `${w}%`, background: primary, opacity: 0.12 }}
          />
        ))}
      </div>
    </div>
    <div className="px-4 pb-3">
      <p className="text-xs font-medium" style={{ color: primary }}>
        {name}
      </p>
    </div>
  </div>
);

// ─── Landing page ─────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  return (
    <div className="text-slate-900">
      {/* Hero */}
      <section className="pt-20 pb-24 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-6">
          <Zap size={12} />
          Powered by GPT-4o · Now in public beta
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Build resumes that{' '}
          <span className="text-blue-600">get interviews</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          CloudResumeAI combines professional templates, AI-powered writing
          assistance, and real-time ATS scoring to help you land your dream role
          faster.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Start building for free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Browse templates
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">
          No credit card required · Free forever plan available
        </p>
      </section>

      {/* Template previews */}
      <section className="py-16 bg-slate-50 border-y border-slate-200 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Templates designed to impress
            </h2>
            <p className="text-slate-500 text-sm">
              Each template is crafted for ATS compatibility and human appeal.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {RESUME_TEMPLATES.slice(0, 4).map((t) => (
              <TemplatePreviewCard
                key={t.id}
                name={t.name}
                primary={t.colorScheme.primary}
                accent={t.colorScheme.accent}
                bg={t.colorScheme.bg}
              />
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              to="/templates"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              View all templates
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="blue" className="mb-4">Features</Badge>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Everything you need to land the role
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Professional tools that used to require expensive career coaches, now
            available to everyone.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-slate-50 border-y border-slate-200"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="blue" className="mb-4">Process</Badge>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              From blank page to first interview in 4 steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-black text-blue-100 leading-none mb-3">
                  {step.step}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 -right-3 text-slate-200">
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loved by job seekers
          </h2>
          <p className="text-slate-500 text-sm">Join thousands who landed offers with CloudResumeAI.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Start building your perfect resume today
          </h2>
          <p className="text-blue-200 text-sm mb-8">
            Free to start. No credit card required.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cloud size={14} className="text-white" />
                </div>
                <span className="font-bold text-white text-sm">
                  CloudResumeAI
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs">
                AI-powered resume builder for modern professionals.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-white font-medium mb-2 text-xs">Product</p>
                <div className="space-y-1.5">
                  <Link to="/templates" className="block hover:text-white transition-colors text-xs">Templates</Link>
                  <Link to="/dashboard" className="block hover:text-white transition-colors text-xs">Dashboard</Link>
                  <Link to="/ai" className="block hover:text-white transition-colors text-xs">AI Assistant</Link>
                </div>
              </div>
              <div>
                <p className="text-white font-medium mb-2 text-xs">Company</p>
                <div className="space-y-1.5">
                  <a href="#" className="block hover:text-white transition-colors text-xs">About</a>
                  <a href="#" className="block hover:text-white transition-colors text-xs">Blog</a>
                  <a href="#" className="block hover:text-white transition-colors text-xs">Careers</a>
                </div>
              </div>
              <div>
                <p className="text-white font-medium mb-2 text-xs">Legal</p>
                <div className="space-y-1.5">
                  <a href="#" className="block hover:text-white transition-colors text-xs">Privacy</a>
                  <a href="#" className="block hover:text-white transition-colors text-xs">Terms</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© 2026 CloudResumeAI. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

