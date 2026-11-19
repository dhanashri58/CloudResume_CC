import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Download,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_RESUME_DATA } from '../../data/mockData';
import { Button, Input, Textarea, Badge } from '../../components/ui';
import {
  getResume,
  createResume,
  updateResume,
  exportResumePdf,
  triggerPdfDownload,
} from '../../services/resumesApi';
import {
  improveSummary,
  improveExperience,
  matchJobDescription,
  AIServiceError,
  type ImproveSummaryResponse,
  type ImproveExperienceResponse,
  type JobMatchResponse,
} from '../../services/aiApi';
import type {
  ResumeData,
  ExperienceEntry,
} from '../../types';

// ─── Section wrapper ──────────────────────────────────────────────────────────

const EditorSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#11192e]/85 backdrop-blur-md shadow-xl shadow-black/20 transition-all duration-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-slate-100">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] text-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Live preview ─────────────────────────────────────────────────────────────

const ResumePreview: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo: p, summary, experience, education, skills, projects } = data;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-black/80 ring-1 ring-white/10 overflow-hidden text-slate-900 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 leading-tight">
          {p.fullName || 'Your Name'}
        </h1>
        {p.headline && (
          <p className="text-sm text-blue-600 font-medium mt-0.5">{p.headline}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {p.email && <span className="text-xs text-slate-500">{p.email}</span>}
          {p.phone && <span className="text-xs text-slate-500">{p.phone}</span>}
          {p.location && <span className="text-xs text-slate-500">{p.location}</span>}
          {p.website && <span className="text-xs text-blue-500">{p.website}</span>}
        </div>
      </div>

      <div className="px-8 py-5 space-y-5 text-[11px] leading-relaxed">
        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Summary
            </h2>
            <p className="text-slate-700">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{exp.role}</p>
                      <p className="text-slate-500">
                        {exp.company} · {exp.location}
                      </p>
                    </div>
                    <span className="text-slate-400 shrink-0 ml-2">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-slate-600 before:content-['·'] before:mr-1.5 before:text-slate-400">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((ed) => (
                <div key={ed.id} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {ed.degree} in {ed.field}
                    </p>
                    <p className="text-slate-500">{ed.institution}</p>
                  </div>
                  <span className="text-slate-400 shrink-0 ml-2">
                    {ed.startDate}–{ed.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Skills
            </h2>
            <div className="space-y-1">
              {skills.map((sg) => (
                <div key={sg.id} className="flex gap-2">
                  <span className="font-medium text-slate-700 w-20 shrink-0">
                    {sg.category}:
                  </span>
                  <span className="text-slate-600">{sg.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
              Projects
            </h2>
            <div className="space-y-2">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <p className="font-semibold text-slate-900">{proj.name}</p>
                  <p className="text-slate-600">{proj.description}</p>
                  <p className="text-slate-400">
                    {proj.technologies.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Editor page ──────────────────────────────────────────────────────────────

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState<string>(id || 'new');
  const [title, setTitle] = useState<string>('My Resume');
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME_DATA);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiExpTarget, setAiExpTarget] = useState<ExperienceEntry | null>(null);
  const [isJobMatchModalOpen, setIsJobMatchModalOpen] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      setLoading(true);
      getResume(id)
        .then((res) => {
          setTitle(res.title || 'My Resume');
          setData({
            personalInfo: res.personalInfo || SAMPLE_RESUME_DATA.personalInfo,
            summary: res.summary || '',
            experience: res.experience || [],
            education: res.education || [],
            projects: res.projects || [],
            skills: res.skills || [],
          });
        })
        .catch(() => {
          // Keep mock sample as fallback
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Helpers
  const updatePersonal = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSummary = (value: string) => {
    setData((prev) => ({ ...prev, summary: value }));
  };

  const updateExperienceBullet = (
    expId: string,
    bulletIdx: number,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId
          ? {
              ...e,
              bullets: e.bullets.map((b, i) => (i === bulletIdx ? value : b)),
            }
          : e
      ),
    }));
  };

  const updateExperienceField = (
    expId: string,
    field: keyof ExperienceEntry,
    value: string | boolean
  ) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, [field]: value } : e
      ),
    }));
  };

  const addExperienceBullet = (expId: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }));
  };

  const removeExperienceBullet = (expId: string, idx: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
          : e
      ),
    }));
  };

  const handleApplyExperienceBullets = (expId: string, newBullets: string[]) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === expId ? { ...e, bullets: newBullets } : e
      ),
    }));
  };

  const updateSkillCategory = (sgId: string, value: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((sg) =>
        sg.id === sgId ? { ...sg, category: value } : sg
      ),
    }));
  };

  const updateSkillList = (sgId: string, value: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((sg) =>
        sg.id === sgId
          ? { ...sg, skills: value.split(',').map((s) => s.trim()).filter(Boolean) }
          : sg
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      if (resumeId === 'new') {
        const created = await createResume({
          title,
          templateId: 'executive',
          ...data,
        });
        setResumeId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await updateResume(resumeId, {
          title,
          ...data,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save resume';
      setErrorMessage(msg);
      // Fallback local save indication
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    setErrorMessage(null);
    try {
      let targetId = resumeId;
      if (targetId === 'new') {
        const created = await createResume({
          title,
          templateId: 'executive',
          ...data,
        });
        targetId = created.id;
        setResumeId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await updateResume(targetId, {
          title,
          ...data,
        });
      }

      const { blob, filename } = await exportResumePdf(targetId);
      triggerPdfDownload(blob, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export PDF';
      setErrorMessage(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#0a0f1d] text-slate-100 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Editor top bar */}
      <div className="sticky top-0 z-30 bg-[#0d1527]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold text-white bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 w-full max-w-xs placeholder-slate-500"
            placeholder="Resume title..."
          />
        </div>

        {errorMessage && (
          <span className="text-xs text-amber-400 hidden md:block">
            {errorMessage}
          </span>
        )}

        <div className="flex items-center gap-2">
          {loading && (
            <RefreshCw size={13} className="animate-spin text-slate-400" />
          )}
          <Badge variant={saved ? 'green' : 'slate'}>
            {saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved'}
          </Badge>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              previewMode
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'border-white/[0.1] text-slate-300 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => setIsJobMatchModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles size={13} className="text-purple-400" />
            Match Job
          </button>

          <Link to="/ai">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors">
              <Sparkles size={13} className="text-indigo-400" />
              AI assist
            </button>
          </Link>

          <Button size="sm" onClick={handleSave} className="shadow-lg shadow-indigo-600/20">
            <Save size={13} />
            Save
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportPdf}
            disabled={exporting}
            aria-label="Export PDF"
          >
            {exporting ? (
              <RefreshCw size={13} className="animate-spin text-indigo-400" />
            ) : exportSuccess ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Download size={13} />
            )}
            {exporting
              ? 'Exporting...'
              : exportSuccess
              ? 'Downloaded'
              : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 space-y-4 ${
            previewMode ? 'hidden lg:block lg:w-1/2' : 'w-full lg:w-1/2'
          }`}
        >
          {/* Personal info */}
          <EditorSection title="Personal Information">
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Full name"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonal('fullName', e.target.value)}
              />
              <Input
                label="Professional headline"
                value={data.personalInfo.headline ?? ''}
                onChange={(e) => updatePersonal('headline', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonal('email', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonal('phone', e.target.value)}
              />
              <Input
                label="Location"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonal('location', e.target.value)}
              />
              <Input
                label="Website"
                value={data.personalInfo.website ?? ''}
                onChange={(e) => updatePersonal('website', e.target.value)}
              />
              <Input
                label="LinkedIn"
                value={data.personalInfo.linkedin ?? ''}
                onChange={(e) => updatePersonal('linkedin', e.target.value)}
              />
              <Input
                label="GitHub"
                value={data.personalInfo.github ?? ''}
                onChange={(e) => updatePersonal('github', e.target.value)}
              />
            </div>
          </EditorSection>

          {/* Summary */}
          <EditorSection title="Professional Summary">
            <div className="mt-4">
              <Textarea
                label="Summary"
                rows={4}
                value={data.summary}
                onChange={(e) => updateSummary(e.target.value)}
                placeholder="Write a compelling 2-3 sentence summary of your career..."
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Sparkles size={12} />
                  Improve with AI
                </button>
              </div>
            </div>
          </EditorSection>

          {/* Experience */}
          <EditorSection title="Work Experience">
            <div className="mt-4 space-y-6">
              {data.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="border border-white/[0.08] bg-[#0d1629]/60 rounded-xl p-4 space-y-3 shadow-inner shadow-black/20"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-slate-500 cursor-grab" />
                    <span className="text-xs font-semibold text-slate-200 flex-1">
                      {exp.company}
                    </span>
                    <button className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'company', e.target.value)
                      }
                    />
                    <Input
                      label="Role / Title"
                      value={exp.role}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'role', e.target.value)
                      }
                    />
                    <Input
                      label="Start date"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'startDate', e.target.value)
                      }
                    />
                    <Input
                      label="End date"
                      value={exp.current ? 'Present' : exp.endDate}
                      disabled={exp.current}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'endDate', e.target.value)
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'current', e.target.checked)
                      }
                      className="rounded bg-[#0a0f1d] border-white/20 text-blue-500 focus:ring-blue-500"
                    />
                    Currently working here
                  </label>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-300">
                        Bullet points
                      </p>
                      <button
                        type="button"
                        onClick={() => setAiExpTarget(exp)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <Sparkles size={11} />
                        Enhance with AI
                      </button>
                    </div>
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <textarea
                          rows={2}
                          className="flex-1 px-3 py-2 text-xs border border-white/[0.1] bg-[#0a0f1d] text-slate-100 placeholder-slate-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={bullet}
                          onChange={(e) =>
                            updateExperienceBullet(exp.id, idx, e.target.value)
                          }
                        />
                        <button
                          onClick={() => removeExperienceBullet(exp.id, idx)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors self-start mt-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addExperienceBullet(exp.id)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium mt-1"
                    >
                      <Plus size={12} />
                      Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/[0.12] text-sm text-slate-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-white/[0.02] rounded-xl transition-colors">
                <Plus size={15} />
                Add experience
              </button>
            </div>
          </EditorSection>

          {/* Education */}
          <EditorSection title="Education">
            <div className="mt-4 space-y-4">
              {data.education.map((ed) => (
                <div
                  key={ed.id}
                  className="border border-white/[0.08] bg-[#0d1629]/60 rounded-xl p-4 grid sm:grid-cols-2 gap-3 shadow-inner shadow-black/20"
                >
                  <Input
                    label="Institution"
                    value={ed.institution}
                    onChange={() => {}}
                  />
                  <Input
                    label="Degree"
                    value={`${ed.degree} in ${ed.field}`}
                    onChange={() => {}}
                  />
                  <Input label="Start year" value={ed.startDate} onChange={() => {}} />
                  <Input label="End year" value={ed.endDate} onChange={() => {}} />
                  {ed.gpa && (
                    <Input label="GPA" value={ed.gpa} onChange={() => {}} />
                  )}
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/[0.12] text-sm text-slate-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-white/[0.02] rounded-xl transition-colors">
                <Plus size={15} />
                Add education
              </button>
            </div>
          </EditorSection>

          {/* Skills */}
          <EditorSection title="Skills">
            <div className="mt-4 space-y-4">
              {data.skills.map((sg) => (
                <div key={sg.id} className="grid sm:grid-cols-3 gap-3 items-start">
                  <Input
                    label="Category"
                    value={sg.category}
                    onChange={(e) => updateSkillCategory(sg.id, e.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Skills (comma-separated)"
                      value={sg.skills.join(', ')}
                      onChange={(e) => updateSkillList(sg.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium">
                <Plus size={12} />
                Add skill group
              </button>
            </div>
          </EditorSection>

          {/* Projects */}
          <EditorSection title="Projects">
            <div className="mt-4 space-y-4">
              {data.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="border border-white/[0.08] bg-[#0d1629]/60 rounded-xl p-4 space-y-3 shadow-inner shadow-black/20"
                >
                  <Input label="Project name" value={proj.name} onChange={() => {}} />
                  <Textarea
                    label="Description"
                    rows={2}
                    value={proj.description}
                    onChange={() => {}}
                  />
                  <Input
                    label="Technologies (comma-separated)"
                    value={proj.technologies.join(', ')}
                    onChange={() => {}}
                  />
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/[0.12] text-sm text-slate-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-white/[0.02] rounded-xl transition-colors">
                <Plus size={15} />
                Add project
              </button>
            </div>
          </EditorSection>
        </div>

        {/* Preview panel */}
        <div
          className={`bg-[#070b14] border-l border-white/[0.08] backdrop-blur-md overflow-y-auto p-6 ${
            previewMode ? 'w-full lg:w-1/2' : 'hidden lg:block lg:w-1/2'
          }`}
        >
          <div className="sticky top-0 flex items-center justify-between mb-4 z-10 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live preview</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-white/[0.1] bg-white/[0.03] text-slate-400">A4 Studio</span>
            </div>
          </div>
          <ResumePreview data={data} />
        </div>
      </div>

      {/* AI Enhancement Modals */}
      <SummaryAIModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        currentSummary={data.summary}
        onApply={updateSummary}
      />

      <ExperienceAIModal
        isOpen={Boolean(aiExpTarget)}
        onClose={() => setAiExpTarget(null)}
        exp={aiExpTarget}
        onApply={handleApplyExperienceBullets}
      />

      <JobMatchModal
        isOpen={isJobMatchModalOpen}
        onClose={() => setIsJobMatchModalOpen(false)}
        resumeData={data}
      />
    </div>
  );
};

// ─── Summary AI Modal ────────────────────────────────────────────────────────

const SummaryAIModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentSummary: string;
  onApply: (newSummary: string) => void;
}> = ({ isOpen, onClose, currentSummary, onApply }) => {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImproveSummaryResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (loading) return;
    if (!currentSummary.trim() || currentSummary.trim().length < 10) {
      setError('Please provide a summary of at least 10 characters before using AI.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await improveSummary({
        summary: currentSummary,
        targetRole: targetRole.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to enhance summary with Gemini AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0d1629] border border-white/[0.1] text-slate-100 rounded-2xl shadow-2xl shadow-black/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Improve Summary with AI</h3>
              <p className="text-xs text-slate-400">Powered by Google Gemini (gemini-3.5-flash-lite)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Input
            label="Target Job Role (optional)"
            placeholder="e.g. Senior Cloud Solutions Architect"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">Current Summary</label>
          <div className="p-3 bg-[#0a0f1d] border border-white/[0.08] rounded-lg text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
            {currentSummary || <span className="italic text-slate-500">No summary written yet. Write a draft first.</span>}
          </div>
        </div>

        {result && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-emerald-400 block mb-1">
                AI Suggested Summary
              </label>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-100 leading-relaxed">
                {result.improvedSummary}
              </div>
            </div>

            {result.keyChanges && result.keyChanges.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Key Improvements Made</label>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                  {result.keyChanges.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!result ? (
            <Button size="sm" onClick={handleGenerate} loading={loading} disabled={loading || !currentSummary.trim()}>
              <Sparkles size={13} className="mr-1" />
              Generate Improvement
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                onApply(result.improvedSummary);
                onClose();
              }}
            >
              <Check size={13} className="mr-1" />
              Apply to Resume
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Experience AI Modal ────────────────────────────────────────────────────

const ExperienceAIModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  exp: ExperienceEntry | null;
  onApply: (expId: string, newBullets: string[]) => void;
}> = ({ isOpen, onClose, exp, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImproveExperienceResponse | null>(null);

  if (!isOpen || !exp) return null;

  const currentText = exp.bullets.filter(Boolean).join('\n') || '';

  const handleGenerate = async () => {
    if (loading) return;
    if (!currentText.trim() || currentText.trim().length < 10) {
      setError('Please provide at least 10 characters of experience bullets to enhance.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await improveExperience({
        text: currentText,
        role: exp.role,
        companyOrProject: exp.company,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to enhance experience bullets with Gemini AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0d1629] border border-white/[0.1] text-slate-100 rounded-2xl shadow-2xl shadow-black/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Enhance Experience Bullets (STAR Method)
              </h3>
              <p className="text-xs text-slate-400">
                {exp.role} · {exp.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">Current Bullets</label>
          <div className="p-3 bg-[#0a0f1d] border border-white/[0.08] rounded-lg text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto space-y-1">
            {exp.bullets.filter(Boolean).length > 0 ? (
              exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>{b}</span>
                </div>
              ))
            ) : (
              <span className="italic text-slate-500">No bullets entered yet. Add draft bullets first.</span>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-emerald-400 block mb-1">
                Enhanced Action Bullets
              </label>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-100 space-y-2">
                {result.improvedBullets.map((bullet, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.tips && result.tips.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Quantifiable Metrics Tips</label>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                  {result.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!result ? (
            <Button size="sm" onClick={handleGenerate} loading={loading} disabled={loading || !currentText.trim()}>
              <Sparkles size={13} className="mr-1" />
              Enhance with AI
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                onApply(exp.id, result.improvedBullets);
                onClose();
              }}
            >
              <Check size={13} className="mr-1" />
              Apply to Experience
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Job Match Modal ────────────────────────────────────────────────────────

const JobMatchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}> = ({ isOpen, onClose, resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResponse | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (loading) return;
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setError('Please paste a job description of at least 20 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    const flatSkills: string[] = [];
    (resumeData.skills || []).forEach((sg: any) => {
      if (Array.isArray(sg.skills)) {
        flatSkills.push(...sg.skills);
      } else if (sg.name) {
        flatSkills.push(sg.name);
      }
    });

    const expText = (resumeData.experience || [])
      .map((e) => `${e.role} at ${e.company}: ${e.bullets.join(' ')}`)
      .join('\n');

    try {
      const res = await matchJobDescription({
        jobDescription: jobDescription.trim(),
        resumeSummary: resumeData.summary || undefined,
        skills: flatSkills.length > 0 ? flatSkills : undefined,
        experienceText: expText || undefined,
      });
      setResult(res);
    } catch (err) {
      if (err instanceof AIServiceError) {
        setError(err.message);
      } else {
        setError('Failed to analyze job match with Gemini AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0d1629] border border-white/[0.1] text-slate-100 rounded-2xl shadow-2xl shadow-black/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Job Description Match Analyzer</h3>
              <p className="text-xs text-slate-400">Evaluate fit and ATS keyword coverage with Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <Textarea
            label="Target Job Description"
            placeholder="Paste the job posting requirements, responsibilities, or keywords here..."
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {result && (
          <div className="space-y-4 pt-2 border-t border-white/[0.08]">
            {/* Score & Gauge */}
            <div className="flex items-center gap-4 p-4 bg-[#0a0f1d] border border-white/[0.08] rounded-xl">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                  result.matchScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : result.matchScore >= 60
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {result.matchScore}%
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {result.matchScore >= 80
                    ? 'Strong Alignment'
                    : result.matchScore >= 60
                    ? 'Moderate Alignment'
                    : 'Low Initial Alignment'}
                </h4>
                <p className="text-xs text-slate-400">
                  AI heuristic comparison of your resume skills, summary, and experience against the job description.
                </p>
              </div>
            </div>

            {/* Matching & Missing Skills */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  Matching Skills ({result.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills && result.matchingSkills.length > 0 ? (
                    result.matchingSkills.map((s, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-md font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  Missing / Key Desired Skills ({result.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((s, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-md font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No major gaps identified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="p-3 bg-[#0a0f1d] border border-white/[0.08] rounded-xl space-y-1.5">
                <span className="text-xs font-semibold text-slate-200">Tailoring Recommendations:</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                  {result.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[10px] text-slate-500 italic">
              {result.disclaimer}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleAnalyze} loading={loading} disabled={loading || !jobDescription.trim()}>
            <Sparkles size={13} className="mr-1" />
            {result ? 'Re-analyze' : 'Analyze Match'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

