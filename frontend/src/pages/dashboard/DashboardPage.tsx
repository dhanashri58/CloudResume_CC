import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  MOCK_RESUMES,
  RESUME_TEMPLATES,
} from '../../data/mockData';
import { listResumes, deleteResume } from '../../services/resumesApi';
import type { ResumeCard, ResumeStatus } from '../../types';
import { useAuth } from '../../auth/AuthContext';

// ─── Stat Card Component ────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  badgeBg?: string;
  badgeText?: string;
}> = ({ label, value, icon, trend, badgeBg = 'bg-blue-500/10', badgeText = 'text-blue-600 dark:text-blue-400' }) => (
  <div className="relative group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent-primary)]/50 transition-all duration-200 shadow-xs overflow-hidden">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] transition-all">
        {icon}
      </div>
      {trend && (
        <span className={`text-[11px] ${badgeText} ${badgeBg} border border-current/20 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1`}>
          <TrendingUp size={11} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-1 font-sans">{value}</p>
    <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">{label}</p>
  </div>
);

// ─── Status Badge Component ─────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ResumeStatus }> = ({ status }) => {
  const map: Record<ResumeStatus, { label: string; bg: string; text: string; border: string }> = {
    active: { label: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20' },
    draft: { label: 'Draft', bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/20' },
    archived: { label: 'Archived', bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
  };
  const { label, bg, text, border } = map[status] || {
    label: status,
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
      {label}
    </span>
  );
};

// ─── Resume Row Component ───────────────────────────────────────────────────────

const ResumeRow: React.FC<{
  resume: ResumeCard;
  onDelete: (id: string) => void;
}> = ({ resume, onDelete }) => {
  const template = RESUME_TEMPLATES.find((t) => t.id === resume.templateId);

  return (
    <div className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-all group">
      {/* Mini Color Visual */}
      <div
        className="w-9 h-11 rounded-lg shrink-0 border border-[var(--border-subtle)] shadow-2xs relative overflow-hidden flex flex-col justify-end p-1"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colorScheme.bg} 40%, ${template.colorScheme.accent} 100%)`
            : '#FAF6F0',
        }}
      >
        <div className="w-full h-1 bg-white/40 rounded-full mb-0.5" />
        <div className="w-2/3 h-1 bg-white/40 rounded-full" />
      </div>

      {/* Title & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate font-sans">
            {resume.title}
          </p>
          <StatusBadge status={resume.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-[var(--text-muted)]" />
            {new Date(resume.lastModified).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {resume.targetRole && (
            <span className="truncate hidden sm:inline-flex items-center gap-1 text-[var(--text-secondary)] font-medium">
              <span className="text-[var(--accent-primary)] font-bold">→</span> {resume.targetRole}
            </span>
          )}
        </div>
      </div>

      {/* ATS Score */}
      {resume.atsScore !== undefined && (
        <div className="text-right shrink-0 hidden sm:block px-3 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
          <span
            className={`text-sm font-extrabold tabular-nums ${
              resume.atsScore >= 85
                ? 'text-emerald-600 dark:text-emerald-400'
                : resume.atsScore >= 70
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {resume.atsScore}%
          </span>
          <p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-semibold">ATS</p>
        </div>
      )}

      {/* Views */}
      {resume.views !== undefined && (
        <div className="text-right shrink-0 hidden md:block px-3 py-1">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {resume.views}
          </p>
          <p className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-semibold">views</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          to={`/editor/${resume.id}`}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors"
          title="Edit in Studio"
        >
          <ExternalLink size={15} />
        </Link>
        <button
          onClick={() => onDelete(resume.id)}
          className="p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Delete resume"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Dashboard Page Component ──────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResumes();
      if (data && Array.isArray(data)) {
        setResumes(data);
      }
    } catch {
      setError('Backend offline or disconnected: Showing cached local resumes.');
      setResumes(MOCK_RESUMES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setResumes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const totalResumes = resumes.length;
  const activeResumes = resumes.filter((r) => r.status === 'active').length;
  const avgScore =
    totalResumes > 0
      ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / totalResumes)
      : 0;
  const totalViews = resumes.reduce((acc, r) => acc + (r.views || 0), 0);

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Top Welcome & Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans">
              Good morning, {firstName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck size={13} />
              {user?.role || 'Google Cloud Verified'}
            </span>
            {user?.email && (
              <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
                {user.email}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            You have {activeResumes} active resume{activeResumes !== 1 ? 's' : ''} and {totalResumes - activeResumes} draft ready for Gemini optimization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh data"
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-2xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[var(--accent-primary)]' : ''} />
          </button>
          <Link to="/editor/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] shadow-xs transition-all">
              <Plus size={15} />
              New resume
            </button>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="underline font-semibold ml-2 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Stats Bento Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total resumes"
          value={totalResumes}
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Active"
          value={activeResumes}
          icon={<BarChart3 size={18} />}
          trend="+1 this week"
          badgeBg="bg-emerald-500/10"
          badgeText="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Avg. ATS score"
          value={`${avgScore}%`}
          icon={<TrendingUp size={18} />}
          trend="+5%"
          badgeBg="bg-blue-500/10"
          badgeText="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Total views"
          value={totalViews}
          icon={<Eye size={18} />}
          trend="+12 today"
          badgeBg="bg-cyan-500/10"
          badgeText="text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* ─── Gemini AI ATS Boost Banner ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Boost your ATS Match Rate with Gemini AI
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed max-w-2xl">
              Turn generic job duties into high-impact, quantified achievement bullets using Google's XYZ formula. Match your resume against any target cloud job description in seconds.
            </p>
          </div>
        </div>
        <Link
          to="/ai"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all shrink-0 font-medium"
        >
          <span>Open AI Assistant</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ─── Recent Resumes Card ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight font-sans">Recent Resumes</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Your most recent resumes sorted by last modified date.</p>
          </div>
          <Link to="/dashboard/resumes">
            <button className="text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-1">
              <span>View all resumes</span>
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
        <div className="p-3 sm:p-4">
          {loading && resumes.length === 0 ? (
            <div className="py-14 text-center text-sm text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              <span>Loading resumes from database...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center text-[var(--accent-primary)] mb-3">
                <FileText size={22} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No resumes yet</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mb-4">Create your first resume to get started with Gemini AI optimization.</p>
              <Link to="/editor/new">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--accent-primary)] hover:opacity-90 transition-all shadow-xs">
                  <Plus size={14} />
                  Create resume
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {resumes.slice(0, 5).map((r) => (
                <ResumeRow key={r.id} resume={r} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Actions ────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight font-sans">Quick Actions</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Shortcuts to accelerate your resume workflow.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <Link to="/templates" className="group">
            <div className="h-full p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-all duration-200 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--accent-primary)] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  Browse templates
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Find the perfect ATS-friendly design for your cloud engineering role.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/ai" className="group">
            <div className="h-full p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-all duration-200 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  AI Assistant
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Enhance experience bullets using Google's XYZ formula.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/editor/new" className="group">
            <div className="h-full p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-all duration-200 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  New resume
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Start fresh with a clean slate and live ATS scoring.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
