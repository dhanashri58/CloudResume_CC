import React from 'react';
import { X, GraduationCap, ShieldCheck, Briefcase, ArrowRight, Check } from 'lucide-react';

export type PersonaType = 'student' | 'evaluator' | 'recruiter';

interface PersonaInfo {
  type: PersonaType;
  title: string;
  name: string;
  email: string;
  role: string;
  badge: string;
  icon: React.ReactNode;
  accentColor: string;
  description: string;
  features: string[];
}

const PERSONA_CONFIGS: Record<PersonaType, PersonaInfo> = {
  student: {
    type: 'student',
    title: 'Student / Cloud Candidate',
    name: 'Alex Mercer',
    email: 'alex.mercer@cloudresume.ai',
    role: 'Cloud Candidate Mode',
    badge: 'Undergraduate / Early Career',
    icon: <GraduationCap size={24} className="text-blue-600" />,
    accentColor: 'border-blue-200 bg-blue-50/50 text-blue-900',
    description: 'Explore as a candidate crafting cloud-native engineering resumes with live ATS feedback.',
    features: [
      'Resume builder with 8 vector templates',
      'Google Gemini XYZ bullet point rewriting',
      'Target job description match radar (98% ATS score)',
      'Server-side vector PDF downloads',
    ],
  },
  evaluator: {
    type: 'evaluator',
    title: 'Project Evaluator / Professor',
    name: 'Prof. H. Sharma',
    email: 'evaluator@university.edu',
    role: 'Academic Evaluator Mode',
    badge: 'Examiner & Reviewer View',
    icon: <ShieldCheck size={24} className="text-emerald-600" />,
    accentColor: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    description: 'Review and evaluate the Cloud Computing project architecture, security, and cloud deployment.',
    features: [
      'Full administrative inspection access',
      'Pre-loaded sample candidate resumes for grading',
      'System health & telemetry dashboard inspection',
      'Database isolation and multi-tenant security verification',
    ],
  },
  recruiter: {
    type: 'recruiter',
    title: 'Lead Technical Recruiter',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@techcloud.io',
    role: 'Talent Acquisition Mode',
    badge: 'Hiring Team View',
    icon: <Briefcase size={24} className="text-purple-600" />,
    accentColor: 'border-purple-200 bg-purple-50/50 text-purple-900',
    description: 'Screen and evaluate candidates for modern cloud architect and DevOps engineer roles.',
    features: [
      'Keyword gap scanner and role benchmark tools',
      'Candidate comparison preview',
      'Applicant ATS score radar filters',
      'Export and share review summaries',
    ],
  },
};

interface PersonaModalProps {
  isOpen: boolean;
  persona: PersonaType | null;
  onClose: () => void;
  onConfirm: (persona: PersonaType) => Promise<void>;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  persona,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !persona) return null;

  const info = PERSONA_CONFIGS[persona];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-md w-full shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-scaleUp transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
              {info.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-[var(--accent-primary)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                {info.badge}
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1 font-sans">
                {info.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{info.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {info.description}
          </p>

          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs font-bold text-[var(--text-primary)]">Available in this persona view:</p>
            <ul className="space-y-1.5">
              {info.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action button */}
          <button
            onClick={async () => {
              await onConfirm(persona);
              onClose();
            }}
            className="w-full py-3 px-5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>Enter as {info.name.split(' ')[0]}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
