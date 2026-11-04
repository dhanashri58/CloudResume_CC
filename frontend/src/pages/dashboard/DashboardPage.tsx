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
import {
  Button,
  Badge,
  Card,
  SectionHeader,
  AtsScore,
  EmptyState,
} from '../../components/ui';
import { listResumes, deleteResume } from '../../services/resumesApi';
import type { ResumeCard, ResumeStatus } from '../../types';

// ─── Stat card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}> = ({ label, value, icon, trend }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      {trend && (
        <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
          <TrendingUp size={11} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </Card>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ResumeStatus }> = ({ status }) => {
  const map: Record<ResumeStatus, { label: string; variant: 'green' | 'amber' | 'slate' }> = {
    active: { label: 'Active', variant: 'green' },
    draft: { label: 'Draft', variant: 'amber' },
    archived: { label: 'Archived', variant: 'slate' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'slate' };
  return <Badge variant={variant}>{label}</Badge>;
};

// ─── Resume row ───────────────────────────────────────────────────────────────

const ResumeRow: React.FC<{
  resume: ResumeCard;
  onDelete: (id: string) => void;
}> = ({ resume, onDelete }) => {
  const template = RESUME_TEMPLATES.find((t) => t.id === resume.templateId);

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors group">
      {/* Color swatch */}
      <div
        className="w-9 h-11 rounded-md shrink-0 border border-slate-200"
        style={{
          background: template
            ? `linear-gradient(135deg, ${template.colorScheme.bg} 60%, ${template.colorScheme.accent}40)`
            : '#f1f5f9',
        }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-slate-900 truncate">
            {resume.title}
          </p>
          <StatusBadge status={resume.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {new Date(resume.lastModified).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {resume.targetRole && (
            <span className="truncate hidden sm:block">
              → {resume.targetRole}
            </span>
          )}
        </div>
      </div>

      {/* ATS Score */}
      {resume.atsScore !== undefined && (
        <div className="text-right shrink-0 hidden sm:block">
          <AtsScore score={resume.atsScore} size="sm" />
          <p className="text-xs text-slate-400">ATS</p>
        </div>
      )}

      {/* Views */}
      {resume.views !== undefined && (
        <div className="text-right shrink-0 hidden md:block">
          <p className="text-sm font-semibold text-slate-700">
            {resume.views}
          </p>
          <p className="text-xs text-slate-400">views</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link to={`/editor/${resume.id}`}>
          <button
            aria-label="Edit resume"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
        </Link>
        <button
          aria-label="Duplicate resume"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Copy size={14} />
        </button>
        <button
          aria-label="Delete resume"
          onClick={() => onDelete(resume.id)}
          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good morning, Alex 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            You have {activeResumes} active resume{activeResumes !== 1 ? 's' : ''} and{' '}
            {totalResumes - activeResumes} draft ready to complete.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            loading={loading}
            title="Refresh from database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Link to="/editor/new">
            <Button size="md">
              <Plus size={16} />
              New resume
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
          <span>Backend offline or disconnected: Showing cached local resumes.</span>
          <button
            onClick={loadData}
            className="underline font-semibold ml-2 hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
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
        />
        <StatCard
          label="Avg. ATS score"
          value={`${avgScore}%`}
          icon={<TrendingUp size={18} />}
          trend="+5%"
        />
        <StatCard
          label="Total views"
          value={totalViews}
          icon={<Eye size={18} />}
          trend="+12 today"
        />
      </div>

      {/* Recent resumes */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <SectionHeader
            title="Recent Resumes"
            subtitle="Your resume library sorted by last modified."
            action={
              <Link to="/dashboard/resumes">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
        </div>
        <div className="p-2">
          {loading && resumes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading resumes from database...
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon={<FileText size={20} />}
              title="No resumes yet"
              description="Create your first resume to get started."
              action={
                <Link to="/editor/new">
                  <Button size="sm">
                    <Plus size={14} />
                    Create resume
                  </Button>
                </Link>
              }
            />
          ) : (
            resumes.map((r) => (
              <ResumeRow key={r.id} resume={r} onDelete={handleDelete} />
            ))
          )}
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <SectionHeader
          title="Quick Actions"
          subtitle="Common tasks to get you started."
        />
        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Link to="/templates">
            <Card hover className="p-5 flex items-start gap-3">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Browse templates
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Find the perfect design for your industry.
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/ai">
            <Card hover className="p-5 flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  AI Assistant
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Improve your bullet points with AI.
                </p>
              </div>
            </Card>
          </Link>
          <Link to="/editor/new">
            <Card hover className="p-5 flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Plus size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  New resume
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Start fresh from a blank template.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
