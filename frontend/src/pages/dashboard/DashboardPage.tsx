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
  RefreshCw,
  Sun,
} from 'lucide-react';
import {
  MOCK_RESUMES,
  RESUME_TEMPLATES,
} from '../../data/mockData';
import { listResumes, deleteResume } from '../../services/resumesApi';
import type { ResumeCard, ResumeStatus } from '../../types';
import { useAuth } from '../../auth/AuthContext';

// ─── Stat card (Golden Hour Edition) ──────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  badgeBg?: string;
  badgeText?: string;
}> = ({ label, value, icon, trend, badgeBg = 'bg-amber-50', badgeText = 'text-amber-800' }) => (
  <div className="relative group rounded-3xl border border-[#E7DFD5] bg-white p-5 sm:p-6 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-sm overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E7DFD5] flex items-center justify-center text-amber-700 group-hover:scale-105 transition-all">
        {icon}
      </div>
      {trend && (
        <span className={`text-[11px] ${badgeText} ${badgeBg} border border-amber-200/60 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1`}>
          <TrendingUp size={11} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-extrabold text-[#1C1917] tracking-tight mb-1">{value}</p>
    <p className="text-xs font-semibold text-stone-500 tracking-wide uppercase">{label}</p>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ResumeStatus }> = ({ status }) => {
  const map: Record<ResumeStatus, { label: string; bg: string; text: string; border: string }> = {
    active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    draft: { label: 'Draft', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    archived: { label: 'Archived', bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
  };
  const { label, bg, text, border } = map[status] || {
    label: status,
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
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
    <div className="flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-[#FAF8F5] border border-transparent hover:border-[#E7DFD5] transition-all group">
      {/* Color swatch / mini visual */}
      <div
        className="w-9 h-11 rounded-lg shrink-0 border border-stone-200 shadow-2xs relative overflow-hidden flex flex-col justify-end p-1"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colorScheme.bg} 40%, ${template.colorScheme.accent} 100%)`
            : '#FAF6F0',
        }}
      >
        <div className="w-full h-1 bg-white/40 rounded-full mb-0.5" />
        <div className="w-2/3 h-1 bg-white/40 rounded-full" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <p className="text-sm font-bold text-[#1C1917] group-hover:text-amber-900 transition-colors truncate">
            {resume.title}
          </p>
          <StatusBadge status={resume.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-stone-400" />
            {new Date(resume.lastModified).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {resume.targetRole && (
            <span className="truncate hidden sm:inline-flex items-center gap-1 text-stone-600 font-medium">
              <span className="text-amber-700 font-bold">→</span> {resume.targetRole}
            </span>
          )}
        </div>
      </div>

      {/* ATS Score */}
      {resume.atsScore !== undefined && (
        <div className="text-right shrink-0 hidden sm:block px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#E7DFD5]">
          <span
            className={`text-sm font-extrabold tabular-nums ${
              resume.atsScore >= 85
                ? 'text-emerald-700'
                : resume.atsScore >= 70
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}
          >
            {resume.atsScore}%
          </span>
          <p className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold">ATS</p>
        </div>
      )}

      {/* Views */}
      {resume.views !== undefined && (
        <div className="text-right shrink-0 hidden md:block px-3 py-1">
          <p className="text-sm font-bold text-[#1C1917]">
            {resume.views}
          </p>
          <p className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-semibold">views</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link to={`/editor/${resume.id}`}>
          <button
            className="p-1.5 rounded-lg text-stone-500 hover:text-[#1C1917] hover:bg-white border border-transparent hover:border-[#E7DFD5] transition-colors"
            title="Edit resume"
          >
            <Pencil size={15} />
          </button>
        </Link>
        <button
          onClick={() => onDelete(resume.id)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
          title="Delete resume"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Dashboard Page Component ───────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeCard[]>(MOCK_RESUMES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listResumes();
      if (data && data.length > 0) {
        setResumes(data);
      }
    } catch {
      setError('Backend profile not loaded, using offline default state');
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
      ? Math.round(
          resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / totalResumes
        )
      : 0;
  const totalViews = resumes.reduce((acc, r) => acc + (r.views || 0), 0);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DFD5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] font-serif">
              Good morning, {firstName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <Sun size={12} className="text-amber-700" />
              Golden Hour Pro
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            You have <span className="text-[#1C1917] font-bold">{activeResumes} active resume{activeResumes !== 1 ? 's' : ''}</span> and{' '}
            <span className="text-[#1C1917] font-bold">{totalResumes - activeResumes} draft</span> ready for Gemini optimization.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh from database"
            className="p-2.5 rounded-full border border-[#DCD3C7] bg-white hover:bg-[#FAF7F2] text-stone-600 hover:text-[#1C1917] transition-all shadow-2xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-amber-600' : ''} />
          </button>
          <Link to="/editor/new">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-[#1C1917] hover:bg-[#292524] shadow-sm hover:shadow active:scale-[0.98] transition-all">
              <Plus size={16} />
              New resume
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between shadow-2xs">
          <span>Backend offline or disconnected: Showing cached local resumes.</span>
          <button
            onClick={loadData}
            className="underline font-semibold ml-2 hover:text-amber-950"
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
        />
        <StatCard
          label="Active"
          value={activeResumes}
          icon={<BarChart3 size={18} />}
          trend="+1 this week"
          badgeBg="bg-emerald-50"
          badgeText="text-emerald-800"
        />
        <StatCard
          label="Avg. ATS score"
          value={`${avgScore}%`}
          icon={<TrendingUp size={18} />}
          trend="+5%"
          badgeBg="bg-amber-50"
          badgeText="text-amber-800"
        />
        <StatCard
          label="Total views"
          value={totalViews}
          icon={<Eye size={18} />}
          trend="+12 today"
          badgeBg="bg-amber-50"
          badgeText="text-amber-800"
        />
      </div>

      {/* Recent Resumes Card */}
      <div className="rounded-3xl border border-[#E7DFD5] bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#EFEAE2] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] tracking-tight font-serif">Recent Resumes</h2>
            <p className="text-xs text-stone-500 mt-0.5">Your resume library sorted by last modified date.</p>
          </div>
          <Link to="/dashboard/resumes">
            <button className="text-xs font-semibold text-amber-800 hover:text-amber-950 px-3 py-1.5 rounded-full hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors">
              View all →
            </button>
          </Link>
        </div>
        <div className="p-3 sm:p-4">
          {loading && resumes.length === 0 ? (
            <div className="py-16 text-center text-sm text-stone-500 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading resumes from database...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-700 mb-4 shadow-inner">
                <FileText size={22} />
              </div>
              <h3 className="text-base font-bold text-[#1C1917] mb-1">No resumes yet</h3>
              <p className="text-sm text-stone-500 max-w-xs mb-6">Create your first resume to get started with Gemini AI optimization.</p>
              <Link to="/editor/new">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1C1917] hover:bg-[#292524] transition-colors shadow-sm">
                  <Plus size={14} />
                  Create resume
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EFEAE2]">
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
          <h2 className="text-lg font-bold text-[#1C1917] tracking-tight font-serif">Quick Actions</h2>
          <p className="text-xs text-stone-500 mt-0.5">Shortcuts to accelerate your resume workflow.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/templates" className="group">
            <div className="h-full p-5 rounded-3xl border border-[#E7DFD5] bg-white hover:border-amber-400 hover:shadow-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C1917] group-hover:text-amber-900 transition-colors">
                  Browse templates
                </p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Find the perfect ATS-friendly design for your cloud engineering role.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/ai" className="group">
            <div className="h-full p-5 rounded-3xl border border-[#E7DFD5] bg-white hover:border-amber-400 hover:shadow-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C1917] group-hover:text-amber-900 transition-colors">
                  AI Assistant
                </p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Enhance experience bullets using Google's XYZ formula.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/editor/new" className="group">
            <div className="h-full p-5 rounded-3xl border border-[#E7DFD5] bg-white hover:border-amber-400 hover:shadow-md transition-all duration-300 shadow-sm hover:-translate-y-0.5 flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C1917] group-hover:text-amber-900 transition-colors">
                  New resume
                </p>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
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
