import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  Clock,
  ExternalLink,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_RESUMES, RESUME_TEMPLATES } from '../../data/mockData';
import { listResumes, deleteResume, createResume } from '../../services/resumesApi';
import type { ResumeCard, ResumeStatus } from '../../types';

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── My Resumes Page Component ──────────────────────────────────────────────────

const MyResumesPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ResumeStatus>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'ats' | 'views' | 'title'>('updated');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setActionSuccess(`Deleted "${title}" successfully.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setActionSuccess(`Deleted "${title}" locally.`);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const handleDuplicate = async (resume: ResumeCard) => {
    try {
      const newResume = await createResume({
        title: `${resume.title} (Copy)`,
        targetRole: resume.targetRole,
        templateId: resume.templateId,
      });
      if (newResume) {
        const card: ResumeCard = {
          id: newResume.id,
          title: newResume.title,
          targetRole: newResume.targetRole,
          status: (newResume.status as ResumeStatus) || 'draft',
          templateId: newResume.templateId,
          templateName: newResume.templateId,
          atsScore: newResume.atsScore,
          views: 0,
          lastModified: newResume.updatedAt || new Date().toISOString(),
        };
        setResumes((prev) => [card, ...prev]);
        setActionSuccess(`Duplicated "${resume.title}".`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch {
      const localCopy: ResumeCard = {
        ...resume,
        id: `res-copy-${Date.now()}`,
        title: `${resume.title} (Copy)`,
        status: 'draft',
        lastModified: new Date().toISOString(),
      };
      setResumes((prev) => [localCopy, ...prev]);
      setActionSuccess(`Duplicated "${resume.title}" locally.`);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  // Filter & Sort
  const filteredResumes = useMemo(() => {
    return resumes
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchRole = r.targetRole?.toLowerCase().includes(q) || false;
          return matchTitle || matchRole;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ats') {
          return (b.atsScore || 0) - (a.atsScore || 0);
        }
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // default 'updated'
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });
  }, [resumes, statusFilter, searchQuery, sortBy]);

  const counts = {
    all: resumes.length,
    active: resumes.filter((r) => r.status === 'active').length,
    draft: resumes.filter((r) => r.status === 'draft').length,
    archived: resumes.filter((r) => r.status === 'archived').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans">
              My Resumes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              {resumes.length} document{resumes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Manage, duplicate, customize, and export your ATS-optimized cloud resumes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            title="Refresh resumes"
            className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-2xs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[var(--accent-primary)]' : ''} />
          </button>
          <Link to="/templates">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] shadow-xs transition-all">
              <Plus size={15} />
              New Resume from Template
            </button>
          </Link>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

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

      {/* ─── Search, Status Filters & Sort Toolbar ────────────────────────────── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by title, role..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'active', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)} ({counts[st]})
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown size={14} className="text-[var(--text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-medium"
          >
            <option value="updated">Recently Updated</option>
            <option value="ats">Highest ATS Score</option>
            <option value="views">Most Viewed</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ─── Resumes Grid ─────────────────────────────────────────────────────── */}
      {loading && resumes.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span>Loading your resume library...</span>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] mb-3">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
            {resumes.length === 0 ? 'No resumes created yet' : 'No resumes match your search'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">
            {resumes.length === 0
              ? 'Select from 8 ATS-compliant templates to craft your cloud engineering resume.'
              : 'Try searching with a different keyword or resetting your status filter.'}
          </p>
          {resumes.length === 0 ? (
            <Link to="/templates">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-all shadow-xs">
                <Plus size={14} />
                Browse 8 Cloud Templates
              </button>
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => {
            const template = RESUME_TEMPLATES.find((t) => t.id === resume.templateId);
            const atsColor =
              (resume.atsScore || 0) >= 85
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : (resume.atsScore || 0) >= 70
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';

            return (
              <div
                key={resume.id}
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/50 transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden"
              >
                {/* Accent Top Bar */}
                <div
                  className="h-2 w-full transition-all"
                  style={{
                    backgroundColor: template?.colorScheme.accent || 'var(--accent-primary)',
                  }}
                />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Card Header: Title & Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge status={resume.status} />
                      {resume.atsScore !== undefined && (
                        <span
                          className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full border ${atsColor}`}
                        >
                          {resume.atsScore}% ATS
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 font-sans">
                      {resume.title}
                    </h3>

                    {resume.targetRole && (
                      <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5 flex items-center gap-1 truncate">
                        <span className="text-[var(--accent-primary)] font-bold">→</span>
                        {resume.targetRole}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        Template: {template?.name || 'Standard Modern'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(resume.lastModified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Eye size={12} />
                      {resume.views || 0} views
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(resume)}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                      title="Duplicate resume"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id, resume.title)}
                      className="p-2 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/editor/${resume.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-2xs transition-all"
                    >
                      <span>Edit Studio</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResumesPage;
