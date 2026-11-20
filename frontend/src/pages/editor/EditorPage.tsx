import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Download,
  Wand2,
  Bot,
  ArrowLeft,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_RESUME_DATA } from '../../data/mockData';
import { ALL_RESUME_TEMPLATES } from '../../data/templatesData';
import { ResumeTemplatePreview } from '../../components/templates/ResumeTemplatePreview';
import { Button, Input, Textarea, Badge } from '../../components/ui';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
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
  EducationEntry,
  ProjectEntry,
  SkillGroup,
} from '../../types';

// ─── Section wrapper ──────────────────────────────────────────────────────────

const EditorSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--border-subtle)] rounded-3xl overflow-hidden bg-[var(--bg-surface)] shadow-sm transition-all duration-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--bg-subtle)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold text-[var(--text-primary)] font-sans">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-[var(--text-muted)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--text-muted)]" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-6 pt-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Editor page ──────────────────────────────────────────────────────────────

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTemplate = searchParams.get('template') || 'latex-classic';
  const initialColor = searchParams.get('color') || '#0F6292';
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
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
          if (res.templateId) {
            setSelectedTemplateId(res.templateId);
          }
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
    } else if (id === 'new') {
      try {
        const stored = sessionStorage.getItem('cloudresume_parsed_resume') || localStorage.getItem('cloudresume_parsed_resume');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.personal_info || parsed.personalInfo)) {
            const pi = parsed.personal_info || parsed.personalInfo || {};
            setTitle(`${pi.name || 'Aarav Sharma'} - Cloud Resume`);
            setData((prev) => ({
              ...prev,
              personalInfo: {
                fullName: pi.name || prev.personalInfo.fullName,
                email: pi.email || prev.personalInfo.email,
                phone: pi.phone || prev.personalInfo.phone,
                location: pi.location || prev.personalInfo.location,
                headline: pi.title || prev.personalInfo.headline,
                website: pi.linkedin || prev.personalInfo.website,
              },
              summary: parsed.ai_improved_summary || parsed.summary || prev.summary,
              experience: (parsed.experience && parsed.experience.length > 0)
                ? parsed.experience.map((exp: any, idx: number) => ({
                    id: `exp-${Date.now()}-${idx}`,
                    company: exp.company || 'Tech Company',
                    role: exp.title || 'Software Engineer',
                    startDate: exp.period?.split('–')[0]?.trim() || '2021',
                    endDate: exp.period?.split('–')[1]?.trim() || 'Present',
                    current: exp.period?.toLowerCase().includes('present') ?? true,
                    location: exp.location || 'New Delhi, India',
                    bullets: exp.ai_improved_bullets || exp.bullets || [],
                  }))
                : prev.experience,
              skills: parsed.skills && Array.isArray(parsed.skills)
                ? [
                    {
                      id: 'sg-cloud',
                      category: 'Core Competencies',
                      skills: parsed.skills,
                    },
                  ]
                : prev.skills,
              education: (parsed.education && parsed.education.length > 0)
                ? parsed.education.map((edu: any, idx: number) => ({
                    id: `edu-${Date.now()}-${idx}`,
                    institution: edu.institution || 'University',
                    degree: edu.degree || 'B.Tech in Computer Science',
                    field: 'Computer Science',
                    startDate: '2017',
                    endDate: edu.year || '2021',
                    gpa: edu.gpa || '8.9 / 10.0',
                  }))
                : prev.education,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to initialize editor from parsed resume:', err);
      }
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

  // ─── Complete CRUD Handlers (Experience, Education, Skills, Projects) ─────
  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Software Engineer',
      location: 'Remote',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      bullets: ['Spearheaded high-impact technical initiatives improving system reliability and performance.'],
    };
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const removeExperience = (expId: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== expId),
    }));
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    setData((prev) => {
      const newExp = [...prev.experience];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newExp.length) return prev;
      const temp = newExp[index];
      newExp[index] = newExp[targetIdx];
      newExp[targetIdx] = temp;
      return { ...prev, experience: newExp };
    });
  };

  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `edu-${Date.now()}`,
      institution: 'University / Institute',
      degree: 'B.S. in Computer Science',
      field: 'Computer Science',
      startDate: '2019',
      endDate: '2023',
      gpa: '3.8 / 4.0',
      honors: '',
    };
    setData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducationField = (
    eduId: string,
    field: keyof EducationEntry | 'location',
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((ed) =>
        ed.id === eduId ? { ...ed, [field]: value } : ed
      ),
    }));
  };

  const removeEducation = (eduId: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((ed) => ed.id !== eduId),
    }));
  };

  const moveEducation = (index: number, direction: 'up' | 'down') => {
    setData((prev) => {
      const newEdu = [...prev.education];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newEdu.length) return prev;
      const temp = newEdu[index];
      newEdu[index] = newEdu[targetIdx];
      newEdu[targetIdx] = temp;
      return { ...prev, education: newEdu };
    });
  };

  const addSkillGroup = () => {
    const newSg: SkillGroup = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `skill-${Date.now()}`,
      category: 'Core Competencies',
      skills: ['TypeScript', 'React', 'Python', 'Cloud Systems'],
    };
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSg],
    }));
  };

  const removeSkillGroup = (sgId: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((sg) => sg.id !== sgId),
    }));
  };

  const moveSkillGroup = (index: number, direction: 'up' | 'down') => {
    setData((prev) => {
      const newSkills = [...prev.skills];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newSkills.length) return prev;
      const temp = newSkills[index];
      newSkills[index] = newSkills[targetIdx];
      newSkills[targetIdx] = temp;
      return { ...prev, skills: newSkills };
    });
  };

  const addProject = () => {
    const newProj: ProjectEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `proj-${Date.now()}`,
      name: 'Project Title',
      description: 'Engineered high-performance cloud application delivering robust real-time functionality.',
      technologies: ['React', 'TypeScript', 'GCP'],
      url: '',
      github: '',
    };
    setData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
    }));
  };

  const updateProjectField = (
    projId: string,
    field: keyof ProjectEntry,
    value: string | string[]
  ) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((p) =>
        p.id === projId ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeProject = (projId: string) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== projId),
    }));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    setData((prev) => {
      const newProj = [...(prev.projects || [])];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newProj.length) return prev;
      const temp = newProj[index];
      newProj[index] = newProj[targetIdx];
      newProj[targetIdx] = temp;
      return { ...prev, projects: newProj };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      if (resumeId === 'new') {
        const created = await createResume({
          title,
          templateId: selectedTemplateId,
          ...data,
        });
        setResumeId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await updateResume(resumeId, {
          title,
          templateId: selectedTemplateId,
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
          templateId: selectedTemplateId,
          ...data,
        });
        targetId = created.id;
        setResumeId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await updateResume(targetId, {
          title,
          templateId: selectedTemplateId,
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
    <div className="flex flex-col h-full min-h-screen bg-[#FAF7F2] text-[#1C1917] relative overflow-hidden selection:bg-amber-500/20 selection:text-amber-900">
      {/* Editor top bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 py-3 flex items-center gap-3 transition-colors shadow-2xs">
        <Link
          to="/dashboard"
          className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full px-3.5 py-1 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-full max-w-xs placeholder-[var(--text-muted)] transition-colors"
            placeholder="Resume title..."
          />
        </div>

        {errorMessage && (
          <span className="text-xs text-rose-600 dark:text-rose-400 hidden md:block">
            {errorMessage}
          </span>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading && (
            <RefreshCw size={13} className="animate-spin text-[var(--text-muted)]" />
          )}
          <Badge variant={saved ? 'green' : 'slate'}>
            {saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved'}
          </Badge>

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              previewMode
                ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => setIsJobMatchModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Wand2 size={13} className="text-amber-600 dark:text-amber-400" />
            Match Job
          </button>

          <Link to="/ai">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors">
              <Bot size={13} className="text-[var(--accent-primary)]" />
              AI assist
            </button>
          </Link>

          <Button size="sm" onClick={handleSave}>
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
              <RefreshCw size={13} className="animate-spin text-amber-600" />
            ) : exportSuccess ? (
              <Check size={13} className="text-emerald-600" />
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
          className={`overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--bg-page)] ${
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
                  <Wand2 size={12} />
                  Improve with AI
                </button>
              </div>
            </div>
          </EditorSection>

          {/* Experience */}
          <EditorSection title="Work Experience">
            <div className="mt-4 space-y-6">
              {data.experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="border border-[#E7DFD5] bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-stone-400" />
                    <span className="text-xs font-bold text-[#1C1917] flex-1">
                      {exp.company || 'New Position'} {exp.role ? `— ${exp.role}` : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveExperience(idx, 'up')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={idx === data.experience.length - 1}
                        onClick={() => moveExperience(idx, 'down')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete Experience"
                        onClick={() => removeExperience(exp.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
                      label="Location"
                      value={exp.location || ''}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'location', e.target.value)
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
                  <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperienceField(exp.id, 'current', e.target.checked)
                      }
                      className="rounded bg-white border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    Currently working here
                  </label>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-stone-700">
                        Bullet points
                      </p>
                      <button
                        type="button"
                        onClick={() => setAiExpTarget(exp)}
                        className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-bold"
                      >
                        <Wand2 size={11} />
                        Enhance with AI
                      </button>
                    </div>
                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex gap-2 mb-2">
                        <textarea
                          rows={2}
                          className="flex-1 px-3 py-2 text-xs border border-[#E7DFD5] bg-white text-stone-900 placeholder-stone-400 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                          value={bullet}
                          onChange={(e) =>
                            updateExperienceBullet(exp.id, bIdx, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          title="Remove Bullet"
                          onClick={() => removeExperienceBullet(exp.id, bIdx)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors self-start mt-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(exp.id)}
                      className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-bold mt-1"
                    >
                      <Plus size={12} />
                      Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#DCD3C7] text-xs font-semibold text-stone-600 hover:text-amber-800 hover:border-amber-400 hover:bg-white rounded-2xl transition-all"
              >
                <Plus size={15} />
                Add experience
              </button>
            </div>
          </EditorSection>

          {/* Education */}
          <EditorSection title="Education">
            <div className="mt-4 space-y-4">
              {data.education.map((ed, idx) => (
                <div
                  key={ed.id}
                  className="border border-[#E7DFD5] bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <span className="text-xs font-bold text-[#1C1917]">
                      {ed.institution || 'New Education'} {ed.degree ? `— ${ed.degree}` : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveEducation(idx, 'up')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={idx === data.education.length - 1}
                        onClick={() => moveEducation(idx, 'down')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete Education"
                        onClick={() => removeEducation(ed.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      label="Institution"
                      value={ed.institution}
                      onChange={(e) => updateEducationField(ed.id, 'institution', e.target.value)}
                    />
                    <Input
                      label="Degree"
                      value={ed.degree}
                      onChange={(e) => updateEducationField(ed.id, 'degree', e.target.value)}
                    />
                    <Input
                      label="Field of study"
                      value={ed.field}
                      onChange={(e) => updateEducationField(ed.id, 'field', e.target.value)}
                    />
                    <Input
                      label="Location"
                      value={(ed as any).location || ''}
                      onChange={(e) => updateEducationField(ed.id, 'location', e.target.value)}
                    />
                    <Input
                      label="Start year"
                      value={ed.startDate}
                      onChange={(e) => updateEducationField(ed.id, 'startDate', e.target.value)}
                    />
                    <Input
                      label="End year"
                      value={ed.endDate}
                      onChange={(e) => updateEducationField(ed.id, 'endDate', e.target.value)}
                    />
                    <Input
                      label="GPA"
                      value={ed.gpa || ''}
                      onChange={(e) => updateEducationField(ed.id, 'gpa', e.target.value)}
                    />
                    <Input
                      label="Honors / Awards"
                      value={ed.honors || ''}
                      onChange={(e) => updateEducationField(ed.id, 'honors', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#DCD3C7] text-xs font-semibold text-stone-600 hover:text-amber-800 hover:border-amber-400 hover:bg-white rounded-2xl transition-all"
              >
                <Plus size={15} />
                Add education
              </button>
            </div>
          </EditorSection>

          {/* Skills */}
          <EditorSection title="Skills">
            <div className="mt-4 space-y-4">
              {data.skills.map((sg, idx) => (
                <div key={sg.id} className="border border-[#E7DFD5] bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <span className="text-xs font-bold text-[#1C1917]">
                      {sg.category || 'Skill Group'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveSkillGroup(idx, 'up')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={idx === data.skills.length - 1}
                        onClick={() => moveSkillGroup(idx, 'down')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete Skill Group"
                        onClick={() => removeSkillGroup(sg.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 items-start">
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
                </div>
              ))}
              <button
                type="button"
                onClick={addSkillGroup}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#DCD3C7] text-xs font-semibold text-stone-600 hover:text-amber-800 hover:border-amber-400 hover:bg-white rounded-2xl transition-all"
              >
                <Plus size={15} />
                Add skill group
              </button>
            </div>
          </EditorSection>

          {/* Projects */}
          <EditorSection title="Projects">
            <div className="mt-4 space-y-4">
              {(data.projects || []).map((proj, idx) => (
                <div
                  key={proj.id}
                  className="border border-[#E7DFD5] bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <span className="text-xs font-bold text-[#1C1917]">
                      {proj.name || 'New Project'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={idx === 0}
                        onClick={() => moveProject(idx, 'up')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={idx === data.projects.length - 1}
                        onClick={() => moveProject(idx, 'down')}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        title="Delete Project"
                        onClick={() => removeProject(proj.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input
                      label="Project name"
                      value={proj.name}
                      onChange={(e) => updateProjectField(proj.id, 'name', e.target.value)}
                    />
                    <Input
                      label="Project URL / GitHub"
                      value={proj.url || proj.github || ''}
                      onChange={(e) => updateProjectField(proj.id, 'url', e.target.value)}
                    />
                  </div>
                  <Textarea
                    label="Description"
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProjectField(proj.id, 'description', e.target.value)}
                  />
                  <Input
                    label="Technologies (comma-separated)"
                    value={proj.technologies.join(', ')}
                    onChange={(e) =>
                      updateProjectField(
                        proj.id,
                        'technologies',
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addProject}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#DCD3C7] text-xs font-semibold text-stone-600 hover:text-amber-800 hover:border-amber-400 hover:bg-white rounded-2xl transition-all"
              >
                <Plus size={15} />
                Add project
              </button>
            </div>
          </EditorSection>
        </div>

        {/* Preview panel */}
        <div
          className={`bg-[var(--bg-subtle)] border-l border-[var(--border-subtle)] overflow-y-auto p-4 sm:p-6 ${
            previewMode ? 'w-full lg:w-1/2' : 'hidden lg:block lg:w-1/2'
          }`}
        >
          {/* Live Preview Controls: Template & Color Customizer */}
          <div className="sticky top-0 mb-4 z-20 pb-2 bg-[var(--bg-page)]/95 backdrop-blur-md p-3 rounded-2xl border border-[var(--border-subtle)] shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Template:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedTemplateId(nextId);
                    const tmpl = ALL_RESUME_TEMPLATES.find((t) => t.id === nextId);
                    if (tmpl?.colorScheme?.accent) {
                      setSelectedColor(tmpl.colorScheme.accent);
                    }
                    setSearchParams((prev) => {
                      prev.set('template', nextId);
                      return prev;
                    });
                  }}
                  className="text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  {ALL_RESUME_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Color Palette Swatches */}
              <div className="flex items-center gap-1.5">
                {[
                  { hex: '#0F6292', name: 'Steel Cerulean' },
                  { hex: '#1D4ED8', name: 'Royal Sapphire' },
                  { hex: '#18181B', name: 'Charcoal Slate' },
                  { hex: '#D97706', name: 'Warm Amber' },
                  { hex: '#059669', name: 'Forest Emerald' },
                  { hex: '#7C3AED', name: 'Purple Iris' },
                  { hex: '#DC2626', name: 'Ruby Crimson' },
                  { hex: '#0284C7', name: 'Sky Azure' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.hex);
                      setSearchParams((prev) => {
                        prev.set('color', c.hex);
                        return prev;
                      });
                    }}
                    title={c.name}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      selectedColor === c.hex
                        ? 'ring-2 ring-offset-1 ring-amber-600 scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
              <span className="font-medium">
                {ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name || 'Custom'} · {ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId)?.category}
              </span>
              <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                ATS Score: {ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId)?.atsScore || 96}%
              </span>
            </div>
          </div>

          {/* Scaled A4 Resume Canvas */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <ResumeTemplatePreview
              data={data}
              template={ALL_RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId) || ALL_RESUME_TEMPLATES[0]}
              accentColor={selectedColor}
              scale="full"
            />
          </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E7DFD5] text-[#1C1917] rounded-3xl shadow-2xl shadow-stone-400/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEAE2] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
              <Wand2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] font-serif">Improve Summary with AI</h3>
              <p className="text-xs text-stone-500">Powered by Google Gemini (gemini-3.5-flash-lite)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-stone-400 hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
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
          <label className="text-xs font-bold text-stone-700 block mb-1">Current Summary</label>
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl text-xs text-stone-700 leading-relaxed max-h-32 overflow-y-auto">
            {currentSummary || <span className="italic text-stone-400">No summary written yet. Write a draft first.</span>}
          </div>
        </div>

        {result && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-amber-900 block mb-1">
                AI Suggested Summary
              </label>
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-stone-900 leading-relaxed font-medium">
                {result.improvedSummary}
              </div>
            </div>

            {result.keyChanges && result.keyChanges.length > 0 && (
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Key Improvements Made</label>
                <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 pl-1">
                  {result.keyChanges.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[#EFEAE2] pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!result ? (
            <Button size="sm" onClick={handleGenerate} loading={loading} disabled={loading || !currentSummary.trim()}>
              <Wand2 size={13} className="mr-1" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E7DFD5] text-[#1C1917] rounded-3xl shadow-2xl shadow-stone-400/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEAE2] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
              <Wand2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] font-serif">
                Enhance Experience Bullets (STAR Method)
              </h3>
              <p className="text-xs text-stone-500">
                {exp.role} · {exp.company}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-stone-400 hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-stone-700 block mb-1">Current Bullets</label>
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl text-xs text-stone-700 leading-relaxed max-h-32 overflow-y-auto space-y-1">
            {exp.bullets.filter(Boolean).length > 0 ? (
              exp.bullets.filter(Boolean).map((b, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-stone-400">•</span>
                  <span>{b}</span>
                </div>
              ))
            ) : (
              <span className="italic text-stone-400">No bullets entered yet. Add draft bullets first.</span>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-amber-900 block mb-1">
                Enhanced Action Bullets
              </label>
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-stone-900 space-y-2">
                {result.improvedBullets.map((bullet, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.tips && result.tips.length > 0 && (
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Quantifiable Metrics Tips</label>
                <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 pl-1">
                  {result.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[#EFEAE2] pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {!result ? (
            <Button size="sm" onClick={handleGenerate} loading={loading} disabled={loading || !currentText.trim()}>
              <Wand2 size={13} className="mr-1" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white border border-[#E7DFD5] text-[#1C1917] rounded-3xl shadow-2xl shadow-stone-400/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEAE2] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
              <Wand2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917] font-serif">Job Description Match Analyzer</h3>
              <p className="text-xs text-stone-500">Evaluate fit and ATS keyword coverage with Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-stone-400 hover:text-[#1C1917] hover:bg-[#FAF8F5] rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
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
          <div className="space-y-4 pt-2 border-t border-[#EFEAE2]">
            {/* Score & Gauge */}
            <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0 ${
                  result.matchScore >= 80
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : result.matchScore >= 60
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {result.matchScore}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C1917]">
                  {result.matchScore >= 80
                    ? 'Strong Alignment'
                    : result.matchScore >= 60
                    ? 'Moderate Alignment'
                    : 'Low Initial Alignment'}
                </h4>
                <p className="text-xs text-stone-500">
                  AI heuristic comparison of your resume skills, summary, and experience against the job description.
                </p>
              </div>
            </div>

            {/* Matching & Missing Skills */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  Matching Skills ({result.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills && result.matchingSkills.length > 0 ? (
                    result.matchingSkills.map((s, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 bg-white border border-emerald-200 text-emerald-800 rounded-md font-semibold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  Missing / Key Desired Skills ({result.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((s, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 bg-white border border-amber-200 text-amber-800 rounded-md font-semibold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">No major gaps identified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-stone-800">Tailoring Recommendations:</span>
                <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 pl-1">
                  {result.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[10px] text-stone-500 italic">
              {result.disclaimer}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[#EFEAE2] pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          <Button size="sm" onClick={handleAnalyze} loading={loading} disabled={loading || !jobDescription.trim()}>
            <Wand2 size={13} className="mr-1" />
            {result ? 'Re-analyze' : 'Analyze Match'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

