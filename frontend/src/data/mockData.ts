import type {
  ResumeTemplate,
  ResumeCard,
  ResumeData,
  ChatMessage,
} from '../types';
import { ALL_RESUME_TEMPLATES } from './templatesData';

// ─── Templates data (25+ Distinct Production-Grade Layouts) ──────────────────

export const RESUME_TEMPLATES: ResumeTemplate[] = ALL_RESUME_TEMPLATES;
export { ALL_RESUME_TEMPLATES };

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

