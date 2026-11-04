import type {
  ResumeTemplate,
  ResumeCard,
  ResumeData,
  ChatMessage,
} from '../types';

// ─── Templates mock data ─────────────────────────────────────────────────────

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'executive',
    name: 'Executive',
    category: 'professional',
    description: 'Clean, authoritative layout for senior professionals.',
    colorScheme: { primary: '#0f172a', accent: '#2563eb', bg: '#ffffff' },
    tags: ['Finance', 'Consulting', 'Management'],
    popular: true,
    premium: false,
  },
  {
    id: 'clarity',
    name: 'Clarity',
    category: 'minimal',
    description: 'Whitespace-first design that lets your content speak.',
    colorScheme: { primary: '#111827', accent: '#6366f1', bg: '#fafafa' },
    tags: ['Tech', 'Design', 'Product'],
    popular: true,
    premium: false,
  },
  {
    id: 'horizon',
    name: 'Horizon',
    category: 'modern',
    description: 'Bold sidebar accent with contemporary two-column layout.',
    colorScheme: { primary: '#1e293b', accent: '#0ea5e9', bg: '#ffffff' },
    tags: ['Engineering', 'Data Science', 'DevOps'],
    popular: true,
    premium: false,
  },
  {
    id: 'prism',
    name: 'Prism',
    category: 'creative',
    description: 'Distinctive visual hierarchy for creative professionals.',
    colorScheme: { primary: '#18181b', accent: '#8b5cf6', bg: '#ffffff' },
    tags: ['Design', 'Marketing', 'Media'],
    popular: false,
    premium: true,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    category: 'academic',
    description: 'Traditional CV format for academia and research.',
    colorScheme: { primary: '#1c1917', accent: '#b45309', bg: '#fffbeb' },
    tags: ['Research', 'PhD', 'Academia'],
    popular: false,
    premium: false,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    category: 'modern',
    description: 'Structured, information-dense layout for detailed CVs.',
    colorScheme: { primary: '#0f2942', accent: '#0284c7', bg: '#f8fafc' },
    tags: ['Engineering', 'Finance', 'Strategy'],
    popular: false,
    premium: true,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    category: 'creative',
    description: 'Energy and personality for roles that value culture fit.',
    colorScheme: { primary: '#0c0a09', accent: '#e11d48', bg: '#fff1f2' },
    tags: ['Startup', 'Sales', 'Marketing'],
    popular: false,
    premium: false,
  },
  {
    id: 'meridian',
    name: 'Meridian',
    category: 'professional',
    description: 'Balanced, trustworthy layout built for ATS compatibility.',
    colorScheme: { primary: '#134e4a', accent: '#0d9488', bg: '#f0fdfa' },
    tags: ['Legal', 'HR', 'Operations'],
    popular: false,
    premium: false,
  },
];

// ─── Dashboard mock resumes ──────────────────────────────────────────────────

export const MOCK_RESUMES: ResumeCard[] = [
  {
    id: 'r1',
    title: 'Senior Product Manager — FAANG',
    templateId: 'executive',
    templateName: 'Executive',
    status: 'active',
    lastModified: '2026-10-28',
    targetRole: 'Senior Product Manager',
    targetCompany: 'Google',
    atsScore: 91,
    views: 24,
  },
  {
    id: 'r2',
    title: 'Full-Stack Engineer Resume',
    templateId: 'horizon',
    templateName: 'Horizon',
    status: 'active',
    lastModified: '2026-10-25',
    targetRole: 'Staff Engineer',
    targetCompany: 'Stripe',
    atsScore: 87,
    views: 12,
  },
  {
    id: 'r3',
    title: 'UX Design Portfolio Resume',
    templateId: 'prism',
    templateName: 'Prism',
    status: 'draft',
    lastModified: '2026-10-20',
    targetRole: 'Lead UX Designer',
    atsScore: 74,
    views: 0,
  },
  {
    id: 'r4',
    title: 'Data Science — Minimal',
    templateId: 'clarity',
    templateName: 'Clarity',
    status: 'archived',
    lastModified: '2026-09-15',
    targetRole: 'ML Engineer',
    atsScore: 68,
    views: 36,
  },
];

// ─── Sample editor resume data ───────────────────────────────────────────────

export const SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    website: 'alexmercer.dev',
    linkedin: 'linkedin.com/in/alexmercer',
    github: 'github.com/alexmercer',
    headline: 'Senior Product Manager · Builder · Strategist',
  },
  summary:
    'Product leader with 8+ years scaling B2B SaaS products from 0 to $50M ARR. ' +
    'Obsessed with customer outcomes, data-informed decisions, and shipping products people love. ' +
    'Previously at Google, Stripe, and two early-stage startups.',
  experience: [
    {
      id: 'e1',
      company: 'Stripe',
      role: 'Senior Product Manager, Payments',
      startDate: 'Jan 2023',
      endDate: '',
      current: true,
      location: 'San Francisco, CA (Hybrid)',
      bullets: [
        'Led redesign of payment orchestration UI, reducing failed payment rate by 18%.',
        'Shipped Stripe Tax for 6 new markets in Q2 2024, generating $3.2M incremental ARR.',
        'Partnered with data science to build an ML-powered fraud detection dashboard.',
      ],
    },
    {
      id: 'e2',
      company: 'Google',
      role: 'Product Manager II, Workspace',
      startDate: 'Mar 2020',
      endDate: 'Dec 2022',
      current: false,
      location: 'Mountain View, CA',
      bullets: [
        'Owned the Google Docs real-time collaboration feature used by 100M+ users.',
        'Increased DAU by 22% through optimised onboarding flow A/B experiments.',
        'Coordinated cross-functional team of 24 engineers, 3 designers, 2 researchers.',
      ],
    },
  ],
  education: [
    {
      id: 'ed1',
      institution: 'Stanford University',
      degree: 'MS',
      field: 'Computer Science',
      startDate: '2016',
      endDate: '2018',
      gpa: '3.92',
      honors: 'Dean\'s List',
    },
    {
      id: 'ed2',
      institution: 'UC Berkeley',
      degree: 'BS',
      field: 'Electrical Engineering & Computer Science',
      startDate: '2012',
      endDate: '2016',
      gpa: '3.87',
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'CloudResumeAI',
      description:
        'Open-source AI-powered resume builder built with React, Flask, and PostgreSQL.',
      technologies: ['React', 'TypeScript', 'Python', 'Flask', 'PostgreSQL'],
      github: 'github.com/alexmercer/cloudresumeai',
    },
    {
      id: 'p2',
      name: 'JobTrackr',
      description:
        'Personal job application tracker with analytics dashboard and Kanban board.',
      technologies: ['Next.js', 'Prisma', 'PlanetScale'],
      url: 'jobtrackr.app',
    },
  ],
  skills: [
    {
      id: 's1',
      category: 'Product',
      skills: ['Strategy', 'Roadmapping', 'A/B Testing', 'User Research', 'OKRs'],
    },
    {
      id: 's2',
      category: 'Engineering',
      skills: ['React', 'TypeScript', 'Python', 'SQL', 'REST APIs', 'Git'],
    },
    {
      id: 's3',
      category: 'Tools',
      skills: ['Figma', 'Amplitude', 'Jira', 'Notion', 'Mixpanel', 'Looker'],
    },
  ],
};

// ─── AI chat mock messages ────────────────────────────────────────────────────

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg1',
    role: 'assistant',
    content:
      "Hi! I'm your AI resume assistant. I can help you improve your resume, tailor it for specific roles, write compelling bullet points, or craft a professional summary. What would you like to work on?",
    timestamp: '2026-10-30T08:00:00Z',
  },
];

export const SUGGESTED_PROMPTS = [
  'Improve my professional summary',
  'Tailor this resume for a Product Manager role at Google',
  'Rewrite my experience bullets using the STAR method',
  'Identify any ATS keyword gaps for a Senior Engineer role',
  'Suggest skills to add based on my experience',
  'Write a cover letter for this position',
];

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export const DASHBOARD_STATS = {
  totalResumes: 4,
  activeResumes: 2,
  averageAtsScore: 80,
  totalViews: 72,
};

