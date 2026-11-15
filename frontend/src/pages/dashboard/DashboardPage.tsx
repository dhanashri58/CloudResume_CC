import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  Pencil,
  Trash2,
  Sparkles,
  Layers,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  MOCK_RESUMES,
  RESUME_TEMPLATES,
} from '../../data/mockData';
import { listResumes, deleteResume } from '../../services/resumesApi';
import type { ResumeCard, ResumeStatus } from '../../types';

// ─── Stat card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  gradient?: string;
}> = ({ label, value, icon, trend, gradient = 'from-blue-500/10 to-indigo-500/10' }) => (
  <div className="relative group rounded-2xl border border-white/[0.08] bg-[#0d1427]/80 backdrop-blur-xl p-5 hover:border-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 shadow-xl overflow-hidden">
    <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} border border-white/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-105 transition-all`}>
        {icon}
      </div>
      {trend && (
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
          <TrendingUp size={11} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-extrabold text-white tracking-tight mb-1">{value}</p>
    <p className="text-xs font-medium text-slate-400 tracking-wide">{label}</p>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ResumeStatus }> = ({ status }) => {
  const map: Record<ResumeStatus, { label: string; bg: string; text: string; border: string }> = {
    active: { label: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    draft: { label: 'Draft', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    archived: { label: 'Archived', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  };
  const { label, bg, text, border } = map[status] || {
    label: status,
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
      {label}
    </span>
  );
};

// ─── Resume row ───────────────────────────────────────────────────────────────

const ResumeRow: React.FC<{
  resume: ResumeCard;
  onDelete: (id: string) => void;
}> = ({ resume, onDelete }) => {
  const template = RESUME_TEMPLATES.find((t) => t.id === resume.templateId);

  return (
    <div className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all group">
      {/* Color swatch / mini visual */}
      <div
        className="w-9 h-11 rounded-lg shrink-0 border border-white/10 shadow-inner relative overflow-hidden flex flex-col justify-end p-1"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colorScheme.bg} 40%, ${template.colorScheme.accent} 100%)`
            : '#1e293b',
        }}
      >
        <div className="w-full h-1 bg-white/20 rounded-full mb-0.5" />
        <div className="w-2/3 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
            {resume.title}
          </p>
          <StatusBadge status={resume.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-500" />
            {new Date(resume.lastModified).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {resume.targetRole && (
            <span className="truncate hidden sm:inline-flex items-center gap-1 text-slate-400">
              <span className="text-blue-400 font-mono">→</span> {resume.targetRole}
            </span>
          )}
        </div>
      </div>

      {/* ATS Score */}
      {resume.atsScore !== undefined && (
        <div className="text-right shrink-0 hidden sm:block px-3 py-1 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <span
            className={`text-sm font-bold tabular-nums ${
              resume.atsScore >= 85
                ? 'text-emerald-400'
                : resume.atsScore >= 70
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {resume.atsScore}%
          </span>
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">ATS</p>
        </div>
      )}

      {/* Views */}
      {resume.views !== undefined && (
        <div className="text-right shrink-0 hidden md:block px-3 py-1">
          <p className="text-sm font-semibold text-slate-200">
            {resume.views}
          </p>
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">views</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link to={`/editor/${resume.id}`}>
          <button
            aria-label="Edit resume"
            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all"
            title="Edit resume"
          >
            <Pencil size={14} />
          </button>
        </Link>
        <button
          aria-label="Duplicate resume"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all"
          title="Duplicate resume"
        >
          <Copy size={14} />
        </button>
        <button
          aria-label="Delete resume"
          onClick={() => onDelete(resume.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          title="Delete resume"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Dashboard page ───────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeCard[]>(MOCK_RESUMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const serverResumes = await listResumes();
      if (serverResumes && serverResumes.length > 0) {
        setResumes(serverResumes);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error contacting backend';
      setError(msg);
      // Retain mock fallback so UI remains functional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteResume(id);
    } catch {
      // Local fallback removal
    }
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  // Dynamic statistics
  const totalResumes = resumes.length;
  const activeResumes = resumes.filter((r) => r.status === 'active').length;
  const scoredResumes = resumes.filter((r) => typeof r.atsScore === 'number');
  const avgScore =
    scoredResumes.length > 0
      ? Math.round(
          scoredResumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) /
            scoredResumes.length
        )
      : 80;
  const totalViews = resumes.reduce((acc, r) => acc + (r.views || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Good morning, Alex 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Pro Cloud
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            You have <span className="text-slate-200 font-medium">{activeResumes} active resume{activeResumes !== 1 ? 's' : ''}</span> and{' '}
            <span className="text-slate-200 font-medium">{totalResumes - activeResumes} draft</span> ready to optimize.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh from database"
            className="p-2.5 rounded-xl border border-white/10 bg-[#0d1427]/80 hover:bg-white/[0.06] hover:border-white/20 text-slate-400 hover:text-white transition-all duration-200"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-400' : ''} />
          </button>
          <Link to="/editor/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5">
              <Plus size={16} />
              New resume
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between backdrop-blur-md">
          <span>Backend offline or disconnected: Showing cached local resumes.</span>
          <button
            onClick={loadData}
            className="underline font-semibold ml-2 hover:text-amber-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total resumes"
          value={totalResumes}
          icon={<FileText size={18} />}
          gradient="from-blue-500/10 to-indigo-500/10"
        />
        <StatCard
          label="Active"
          value={activeResumes}
          icon={<BarChart3 size={18} />}
          trend="+1 this week"
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          label="Avg. ATS score"
          value={`${avgScore}%`}
          icon={<TrendingUp size={18} />}
          trend="+5%"
          gradient="from-indigo-500/10 to-purple-500/10"
        />
        <StatCard
          label="Total views"
          value={totalViews}
          icon={<Eye size={18} />}
          trend="+12 today"
          gradient="from-cyan-500/10 to-blue-500/10"
        />
      </div>

      {/* Recent Resumes */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d1427]/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Resumes</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your resume library sorted by last modified.</p>
          </div>
          <Link to="/dashboard/resumes">
            <button className="text-xs font-semibold text-slate-400 hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              View all →
            </button>
          </Link>
        </div>
        <div className="p-3">
          {loading && resumes.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading resumes from database...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <FileText size={22} className="text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No resumes yet</h3>
              <p className="text-sm text-slate-400 max-w-xs mb-6">Create your first resume to get started with AI optimization.</p>
              <Link to="/editor/new">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                  <Plus size={14} />
                  Create resume
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {resumes.map((r) => (
                <ResumeRow key={r.id} resume={r} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Quick Actions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Common shortcuts to boost your productivity.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/templates" className="group">
            <div className="h-full p-5 rounded-2xl border border-white/[0.08] bg-[#0d1427]/80 backdrop-blur-xl hover:border-indigo-500/30 hover:bg-[#111a33] transition-all duration-300 shadow-xl hover:-translate-y-1 flex items-start gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Browse templates
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Find the perfect ATS-friendly design for your industry.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/ai" className="group">
            <div className="h-full p-5 rounded-2xl border border-white/[0.08] bg-[#0d1427]/80 backdrop-blur-xl hover:border-blue-500/30 hover:bg-[#111a33] transition-all duration-300 shadow-xl hover:-translate-y-1 flex items-start gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  AI Assistant
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enhance bullet points using Google's XYZ formula.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/editor/new" className="group">
            <div className="h-full p-5 rounded-2xl border border-white/[0.08] bg-[#0d1427]/80 backdrop-blur-xl hover:border-emerald-500/30 hover:bg-[#111a33] transition-all duration-300 shadow-xl hover:-translate-y-1 flex items-start gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  New resume
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
