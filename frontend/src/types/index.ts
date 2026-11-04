// ─── Resume domain types ────────────────────────────────────────────────────

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  headline?: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillGroup[];
}

// ─── Template types ─────────────────────────────────────────────────────────

export type TemplateCategory =
  | 'all'
  | 'professional'
  | 'modern'
  | 'creative'
  | 'minimal'
  | 'academic';

export interface ResumeTemplate {
  id: string;
  name: string;
  category: Exclude<TemplateCategory, 'all'>;
  description: string;
  colorScheme: {
    primary: string;
    accent: string;
    bg: string;
  };
  tags: string[];
  popular: boolean;
  premium: boolean;
  previewImage?: string;
}

// ─── Dashboard / Resumes ────────────────────────────────────────────────────

export type ResumeStatus = 'draft' | 'active' | 'archived';

export interface ResumeCard {
  id: string;
  title: string;
  templateId: string;
  templateName: string;
  status: ResumeStatus;
  lastModified: string;
  targetRole?: string;
  targetCompany?: string;
  atsScore?: number;
  views?: number;
}

// ─── AI chat types ───────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  durationMs?: number;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

