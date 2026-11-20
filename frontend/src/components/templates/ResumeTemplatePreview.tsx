import React from 'react';
import type { ResumeTemplate, ResumeData } from '../../types';

interface ResumeTemplatePreviewProps {
  template: ResumeTemplate;
  accentColor?: string;
  data?: ResumeData;
  scale?: 'mini' | 'modal' | 'full';
  showHeadshotOverride?: boolean;
}

// ─── Authentic Role-Specific Persona Defaults for Gallery Previews ──────────
const ROLE_PERSONA_DEFAULTS: Record<string, {
  name: string;
  role: string;
  location: string;
  email: string;
  initials: string;
  summary: string;
  experience: { id: string; company: string; title: string; location: string; startDate: string; endDate: string; description: string }[];
  education: { id: string; institution: string; degree: string; startDate: string; endDate: string; gpa?: string; location?: string }[];
  skills: string[];
}> = {
  'horizon': {
    name: 'Sofia Ramirez',
    role: 'Staff Mobile & Distributed UX Engineer',
    location: 'San Diego, CA',
    email: 'sofia.ramirez@appwave.dev',
    initials: 'SR',
    summary: 'Staff Mobile Engineer with 7+ years architecting high-performance iOS and Android applications. Specialized in real-time WebSocket state management, offline-first sync engines, and reducing mobile memory footprint across 1.2M+ active devices.',
    experience: [
      {
        id: 'exp-h1',
        company: 'AppWave Technologies',
        title: 'Lead Mobile Systems Engineer',
        location: 'San Diego, CA',
        startDate: '2021',
        endDate: 'Present',
        description: 'Architected reactive WebSocket synchronization client cutting mobile network payloads by 58% and eliminating state drift across 1.2M MAU.',
      },
      {
        id: 'exp-h2',
        company: 'Wavefront Interactive',
        title: 'Senior iOS & Mobile Developer',
        location: 'San Francisco, CA',
        startDate: '2018',
        endDate: '2021',
        description: 'Re-engineered iOS Swift core navigation, reducing application cold-start time from 2.8s to 820ms with SQLite offline cache.',
      },
    ],
    education: [
      {
        id: 'edu-h1',
        institution: 'UC San Diego',
        degree: 'B.S. in Computer Science & Human-Computer Interaction',
        startDate: '2014',
        endDate: '2018',
        gpa: '3.9 / 4.0',
        location: 'La Jolla, CA',
      },
    ],
    skills: ['Swift & iOS', 'React Native', 'Kotlin Android', 'WebSockets', 'Redux Toolkit', 'SQLite & CoreData', 'Mobile CI/CD'],
  },
  'ivy-league': {
    name: 'Priya Nair',
    role: 'Vice President, Investment Banking & Quantitative Strategy',
    location: 'Mumbai, India',
    email: 'priya.nair@capitaledge.com',
    initials: 'PN',
    summary: 'Quantitatively driven Investment Banking Vice President with 6+ years advising on marquee cross-border M&A and sponsor-backed debt transactions. Proven expertise in complex DCF/LBO valuations, credit underwriting, and automated Python financial data modeling.',
    experience: [
      {
        id: 'exp-ivy1',
        company: 'Morgan Stanley Global Advisory',
        title: 'Vice President, M&A Advisory',
        location: 'Mumbai, India',
        startDate: '2021',
        endDate: 'Present',
        description: 'Advised on a $4.2B cross-border renewable infrastructure acquisition, leading comprehensive DCF valuation, accretion/dilution analysis, and fairness opinion.',
      },
      {
        id: 'exp-ivy2',
        company: 'Goldman Sachs',
        title: 'Senior Investment Banking Associate',
        location: 'Mumbai, India',
        startDate: '2018',
        endDate: '2021',
        description: 'Structured $1.4B multi-tranche syndicated debt facility; built automated 3-statement LBO and DCF financial models in Python & Excel.',
      },
    ],
    education: [
      {
        id: 'edu-ivy1',
        institution: 'Indian Institute of Management (IIM) Ahmedabad',
        degree: 'MBA in Finance & Private Equity Strategy',
        startDate: '2016',
        endDate: '2018',
        gpa: '3.9 / 4.0',
        location: 'Ahmedabad, India',
      },
    ],
    skills: ['M&A Valuation', 'LBO Financial Modeling', 'DCF Analysis', 'Python Quant Analytics', 'Syndicated Debt', 'Bloomberg Terminal'],
  },
  'consulting-edge': {
    name: 'James Robinson',
    role: 'Senior Partner & Technology Transformation Lead',
    location: 'New York, NY',
    email: 'james.robinson@apexconsulting.com',
    initials: 'JR',
    summary: 'MBB Strategy & Operations transformation leader with 8+ years advising Fortune 50 executives on enterprise cloud modernization, operating model realignment, and supply-chain digitization generating over $85M in verified client cost efficiencies.',
    experience: [
      {
        id: 'exp-ce1',
        company: 'McKinsey & Company',
        title: 'Engagement Manager, Digital Practice',
        location: 'New York, NY',
        startDate: '2021',
        endDate: 'Present',
        description: 'Orchestrated cloud operating model modernization for a $12B multinational retailer, reducing annual infrastructure OpEx by $18.5M (32% reduction).',
      },
      {
        id: 'exp-ce2',
        company: 'Apex Strategy Partners',
        title: 'Senior Strategy Consultant',
        location: 'Chicago, IL',
        startDate: '2018',
        endDate: '2021',
        description: 'Led cross-functional post-merger integration of 14 ERP platforms, consolidating IT supply chain workflows and boosting quarterly inventory turns by 2.4x.',
      },
    ],
    education: [
      {
        id: 'edu-ce1',
        institution: 'Columbia Business School',
        degree: 'MBA in Operations & Technology Management',
        startDate: '2016',
        endDate: '2018',
        gpa: '3.8 / 4.0',
        location: 'New York, NY',
      },
    ],
    skills: ['Cloud Operating Models', 'Enterprise Strategy', 'Post-Merger Integration', 'Digital Supply Chain', 'P&L Turnaround', 'C-Suite Advisory'],
  },
  'ats-standard': {
    name: 'Aditya Patel',
    role: 'Principal Cloud Security & DevSecOps Engineer',
    location: 'Ahmedabad, India',
    email: 'aditya.patel@cyberdefense.io',
    initials: 'AP',
    summary: 'Principal Cloud Security Architect with 6+ years specializing in Zero-Trust cloud environments, IAM least-privilege governance, and automated CI/CD compliance scanning across multi-cloud AWS and GCP infrastructures.',
    experience: [
      {
        id: 'exp-ats1',
        company: 'CyberDefense Solutions',
        title: 'Principal Cloud Security Engineer',
        location: 'Ahmedabad, India',
        startDate: '2021',
        endDate: 'Present',
        description: 'Architected automated Zero-Trust IAM governance across 420+ AWS and GCP accounts, eliminating 94% of over-permissioned service accounts.',
      },
      {
        id: 'exp-ats2',
        company: 'CloudSecure Technologies',
        title: 'Senior DevSecOps Engineer',
        location: 'Pune, India',
        startDate: '2018',
        endDate: '2021',
        description: 'Engineered real-time SIEM event pipeline on Apache Kafka and CloudWatch, slashing mean time to detect (MTTD) security anomalies from 4.2h to 11m.',
      },
    ],
    education: [
      {
        id: 'edu-ats1',
        institution: 'Gujarat Technological University',
        degree: 'B.E. in Information Technology & Cybersecurity',
        startDate: '2014',
        endDate: '2018',
        gpa: '9.2 / 10.0',
        location: 'Ahmedabad, India',
      },
    ],
    skills: ['Zero-Trust IAM', 'AWS & GCP Security', 'Terraform Compliance', 'Kubernetes Security', 'SIEM & SOC2 Type II', 'SAST/DAST Scanning'],
  },
  'monochrome-minimal': {
    name: 'Anthony Gentile, CPA',
    role: 'Senior Financial Controller & Corporate Treasurer',
    location: 'Boston, MA',
    email: 'anthony.gentile@gentileadvisory.com',
    initials: 'AG',
    summary: 'Certified Public Accountant with 9+ years directing multi-entity corporate accounting, international tax compliance, and automated treasury operations for rapid-growth technology and manufacturing corporations.',
    experience: [
      {
        id: 'exp-mm1',
        company: 'Gentile Advisory Services',
        title: 'Corporate Controller',
        location: 'Boston, MA',
        startDate: '2020',
        endDate: 'Present',
        description: 'Directed global financial close across 8 operating subsidiaries representing $280M annual revenue, reducing monthly close cycle from 14 to 4 business days.',
      },
      {
        id: 'exp-mm2',
        company: 'PricewaterhouseCoopers (PwC)',
        title: 'Senior Audit Manager',
        location: 'Boston, MA',
        startDate: '2016',
        endDate: '2020',
        description: 'Implemented automated treasury reconciliation protocol across multi-currency bank accounts, eliminating 120+ manual reconciliation hours each quarter.',
      },
    ],
    education: [
      {
        id: 'edu-mm1',
        institution: 'Boston College',
        degree: 'M.S. in Accounting & Taxation, B.S. in Finance',
        startDate: '2012',
        endDate: '2016',
        gpa: '3.9 / 4.0',
        location: 'Boston, MA',
      },
    ],
    skills: ['US GAAP & IFRS', 'Multi-Entity Consolidation', 'Financial Close Optimization', 'SEC Reporting', 'NetSuite ERP', 'Treasury Operations'],
  },
  'timeline': {
    name: 'Kabir Malhotra',
    role: 'Staff Site Reliability Engineer & Infrastructure Lead',
    location: 'Bengaluru, India',
    email: 'kabir.malhotra@techscale.dev',
    initials: 'KM',
    summary: 'Staff SRE with 7+ years of experience maintaining high-availability distributed systems sustaining 50k+ RPS. Specialized in multi-region Kubernetes clusters, automated chaos engineering, Prometheus observability, and zero-downtime platform migrations.',
    experience: [
      {
        id: 'exp-tl1',
        company: 'TechScale Cloud Infrastructure',
        title: 'Staff SRE & Cloud Lead',
        location: 'Bengaluru, India',
        startDate: '2021',
        endDate: 'Present',
        description: 'Managed 500+ node multi-region Kubernetes clusters on GCP sustaining 99.999% uptime SLA across 40M+ daily financial API transactions.',
      },
      {
        id: 'exp-tl2',
        company: 'Razorpay Systems',
        title: 'Senior Infrastructure Engineer',
        location: 'Bengaluru, India',
        startDate: '2018',
        endDate: '2021',
        description: 'Automated disaster recovery runbooks using Terraform and ArgoCD, slashing recovery time objective (RTO) from 45 minutes to under 2.5 minutes.',
      },
    ],
    education: [
      {
        id: 'edu-tl1',
        institution: 'National Institute of Technology (NIT) Karnataka',
        degree: 'B.Tech in Computer Science & Engineering',
        startDate: '2014',
        endDate: '2018',
        gpa: '9.3 / 10.0',
        location: 'Surathkal, India',
      },
    ],
    skills: ['Kubernetes', 'Docker & GCP Cloud Run', 'Terraform & IaC', 'ArgoCD & GitOps', 'Prometheus & Grafana', 'Chaos Engineering'],
  },
  'editorial': {
    name: 'Ananya Deshmukh',
    role: 'Lead Product Designer & UX Researcher',
    location: 'Mumbai, India',
    email: 'ananya.deshmukh@designcraft.com',
    initials: 'AD',
    summary: 'Product Design Leader with 6+ years designing accessible, conversion-driven mobile and web experiences for 20M+ users. Specialized in design systems architecture, quantitative usability benchmarking, and cross-functional product strategy.',
    experience: [
      {
        id: 'exp-ed1',
        company: 'DesignCraft Studio',
        title: 'Lead Product Designer',
        location: 'Mumbai, India',
        startDate: '2021',
        endDate: 'Present',
        description: 'Engineered multi-brand Figma design system comprising 200+ accessible components, accelerating feature design-to-code velocity by 45% across 6 squads.',
      },
      {
        id: 'exp-ed2',
        company: 'Swiggy Design Lab',
        title: 'Senior UX Designer',
        location: 'Bengaluru, India',
        startDate: '2018',
        endDate: '2021',
        description: 'Redesigned consumer onboarding checkout flow based on 40+ usability interviews, boosting purchase conversion rate by 28.4% in Q3.',
      },
    ],
    education: [
      {
        id: 'edu-ed1',
        institution: 'National Institute of Design (NID)',
        degree: 'Master of Design (M.Des) in Interaction Design',
        startDate: '2016',
        endDate: '2018',
        gpa: '9.5 / 10.0',
        location: 'Ahmedabad, India',
      },
    ],
    skills: ['Design Systems', 'Figma & Tokenization', 'User Research & Testing', 'Interaction Design', 'Accessibility (WCAG)', 'Prototyping'],
  },
  'swiss-grid': {
    name: 'Siddharth Verma',
    role: 'Principal Data Systems & Machine Learning Architect',
    location: 'Chennai, India',
    email: 'siddharth.verma@quantml.ai',
    initials: 'SV',
    summary: 'Principal ML Systems Architect with 7+ years building enterprise-scale distributed streaming data pipelines, real-time feature stores, and low-latency machine learning inference engines processing multi-terabyte daily workloads.',
    experience: [
      {
        id: 'exp-sg1',
        company: 'QuantML Analytics',
        title: 'Principal ML Architect',
        location: 'Chennai, India',
        startDate: '2021',
        endDate: 'Present',
        description: 'Architected streaming feature store on Apache Kafka, Flink, and Redis, serving 25k online predictions/sec with p99 latency under 12ms.',
      },
      {
        id: 'exp-sg2',
        company: 'Tiger Analytics',
        title: 'Senior Data Engineer',
        location: 'Chennai, India',
        startDate: '2018',
        endDate: '2021',
        description: 'Engineered real-time financial fraud detection model pipeline on PySpark and Ray, achieving 99.4% precision and preventing $14.2M in annual fraud.',
      },
    ],
    education: [
      {
        id: 'edu-sg1',
        institution: 'Indian Institute of Technology (IIT) Madras',
        degree: 'B.Tech & M.Tech in Data Science & Machine Learning',
        startDate: '2014',
        endDate: '2019',
        gpa: '9.4 / 10.0',
        location: 'Chennai, India',
      },
    ],
    skills: ['Apache Spark & Ray', 'Kafka & Flink', 'Redis Feature Store', 'PyTorch & Scikit-learn', 'Snowflake & Delta Lake', 'MLOps Pipelines'],
  },
};

export const ResumeTemplatePreview: React.FC<ResumeTemplatePreviewProps> = ({
  template,
  accentColor: customAccent,
  data,
  scale = 'mini',
}) => {
  const accent = customAccent || template.colorScheme.accent || '#0F6292';
  const isMini = scale === 'mini';

  // Role persona defaults fallback for gallery previews
  const roleDefault = ROLE_PERSONA_DEFAULTS[template.id];
  const tPersona = roleDefault || template.persona || {
    name: 'Aarav Sharma',
    role: 'Principal Cloud & Systems Architect',
    location: 'Bengaluru, India',
    email: 'aarav.sharma@cloudresume.ai',
    initials: 'AS',
    avatarBg: accent,
  };

  const candidate = {
    name: data?.personalInfo?.fullName || tPersona.name,
    initials: data?.personalInfo?.fullName
      ? data.personalInfo.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : (tPersona as any).initials || 'AS',
    role: data?.personalInfo?.headline || tPersona.role,
    email: data?.personalInfo?.email || tPersona.email,
    phone: data?.personalInfo?.phone || '+91 98765 43210',
    location: data?.personalInfo?.location || tPersona.location,
    avatarBg: (tPersona as any).avatarBg || accent,
    summary:
      data?.summary ||
      (roleDefault ? roleDefault.summary : `Senior ${tPersona.role.toLowerCase()} with 6+ years of experience architecting high-throughput distributed systems and cloud platforms. Specialized in scalable microservices, low-latency APIs, and cloud infrastructure sustaining 10M+ daily events.`),
    skills:
      data?.skills && data.skills.length > 0
        ? typeof data.skills[0] === 'string'
          ? (data.skills as unknown as string[])
          : (data.skills as any[]).flatMap((sg) => sg.skills || [])
        : roleDefault
        ? roleDefault.skills
        : [
            'Google Cloud Platform',
            'Cloud Run & Kubernetes',
            'Python & FastAPI',
            'React & TypeScript',
            'Docker & CI/CD Pipelines',
            'PostgreSQL & Redis',
          ],
    experience:
      data?.experience && data.experience.length > 0
        ? data.experience.map((e) => ({
            id: e.id,
            company: e.company,
            title: (e as any).title || (e as any).role || 'Senior Engineer',
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.bullets?.join(' ') || (e as any).description || '',
          }))
        : roleDefault
        ? roleDefault.experience
        : [
            {
              id: 'exp-1',
              company: 'Google Cloud Innovations Lab',
              title: tPersona.role.includes('Design') ? 'Lead Product Designer' : 'Senior Cloud Architect',
              location: tPersona.location,
              startDate: '2022',
              endDate: 'Present',
              description: 'Architected serverless Cloud Run APIs cutting latency by 43% and sustaining 10k+ RPS with 99.99% uptime SLA.',
            },
            {
              id: 'exp-2',
              company: 'Nexus Tech Systems',
              title: 'Full-Stack Software Engineer',
              location: 'Bangalore, India',
              startDate: '2020',
              endDate: '2022',
              description: 'Engineered reactive TypeScript web services and automated CI/CD deployment pipelines on GCP.',
            },
          ],
    education:
      data?.education && data.education.length > 0
        ? data.education
        : roleDefault
        ? roleDefault.education
        : [
            {
              id: 'edu-1',
              institution: 'National Institute of Technology',
              degree: 'B.Tech in Computer Science',
              startDate: '2016',
              endDate: '2020',
              location: 'India',
              gpa: '9.4 / 10.0',
            },
          ],
  };

  const layout = template.layoutType || 'sidebar-left-full';

  // ───────────────────────────────────────────────────────────────────────────
  // 1. HORIZON GRADIENT (Vibrant Multi-Stop Gradient Top Banner)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'horizon' || layout === 'gradient-header') {
    return (
      <div className="w-full h-full bg-white text-slate-800 select-none font-sans leading-tight flex flex-col justify-between">
        <div>
          {/* Multi-Stop Gradient Top Banner */}
          <div
            className="p-3 text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, #0284C7 50%, #0D9488 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-black text-[12px] uppercase tracking-wider text-white drop-shadow-xs">
                  {candidate.name}
                </h1>
                <div className="mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs font-bold text-[6.2px] text-white">
                  {candidate.role}
                </div>
              </div>
              <div className="flex flex-col gap-0.5 text-[5.5px] text-white/95 text-right font-medium">
                <span>{candidate.location}</span>
                <span>{candidate.email}</span>
                <span>{candidate.phone}</span>
              </div>
            </div>
          </div>

          {/* 2-Column Clean Lower Canvas with Tinted Section Header Badges */}
          <div className="p-2.5 grid grid-cols-12 gap-2">
            {/* Main Column (68%) */}
            <div className="col-span-8 space-y-2">
              <div>
                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-[6.5px] font-bold uppercase tracking-wider inline-block mb-1">
                  Profile & Impact
                </span>
                <p className="text-slate-600 text-[6.2px] line-clamp-2 leading-relaxed">
                  {candidate.summary}
                </p>
              </div>

              <div>
                <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[6.5px] font-bold uppercase tracking-wider inline-block mb-1">
                  Mobile & Engineering Experience
                </span>
                {candidate.experience.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="mb-1.5 p-1 rounded bg-slate-50/70 border border-slate-100">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span className="text-[6.8px]">{exp.title}</span>
                      <span className="font-normal text-slate-400 text-[5.5px]">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <p className="italic text-teal-700 text-[6px] mb-0.5">{exp.company} — {exp.location}</p>
                    <p className="text-slate-600 text-[6px] line-clamp-2">• {exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Column (32%) */}
            <div className="col-span-4 space-y-2 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
              <div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[6px] font-bold uppercase tracking-wider inline-block mb-1">
                  Core Stack
                </span>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 6).map((sk, idx) => (
                    <span key={idx} className="text-[5.5px] px-1 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[6px] font-bold uppercase tracking-wider inline-block mb-1">
                  Education
                </span>
                <p className="font-bold text-[6.2px] text-slate-900">{candidate.education[0].institution}</p>
                <p className="text-[5.5px] text-slate-600">{candidate.education[0].degree}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. IVY LEAGUE (Classic Forest Emerald / Burgundy Academic Prestige)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'ivy-league' || layout === 'ivy-league-academic') {
    return (
      <div className="w-full h-full bg-white text-slate-900 select-none font-serif leading-tight flex flex-col justify-between p-3">
        <div>
          {/* Classic Forest Emerald / Burgundy Double Border Rule */}
          <div className="border-t-4 border-b-2 py-1.5 mb-2 text-center" style={{ borderColor: accent }}>
            <h1 className="font-serif font-black text-[13px] uppercase tracking-wider text-slate-900">
              {candidate.name}
            </h1>
            <p className="font-serif italic text-[6.8px] text-slate-700 mt-0.5" style={{ color: accent }}>
              {candidate.role}
            </p>
            <p className="font-sans text-[5.8px] text-slate-500 mt-0.5">
              {candidate.location} · {candidate.email} · {candidate.phone}
            </p>
          </div>

          {/* 2-Column Core Competencies Grid at Top */}
          <div className="bg-emerald-50/50 p-1.5 rounded border border-emerald-200/80 mb-2">
            <p className="font-serif font-bold text-[6.5px] uppercase tracking-wider text-emerald-900 mb-1">
              CORE COMPETENCIES & SPECIALIZATIONS
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[5.8px] text-emerald-950 font-medium font-serif">
              <div>• M&A Valuation & Fairness Opinions</div>
              <div>• LBO Accretion / Dilution Modeling</div>
              <div>• Syndicated Debt Facilities</div>
              <div>• Python Quantitative Analytics</div>
            </div>
          </div>

          {/* Formal Executive Experience */}
          <div>
            <h2 className="font-serif font-bold text-[7.5px] uppercase tracking-widest border-b border-slate-300 pb-0.5 mb-1" style={{ color: accent }}>
              INVESTMENT BANKING & TRANSACTION ADVISORY
            </h2>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-[7px]">{exp.title}</span>
                  <span className="font-sans text-[5.8px] text-slate-500">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="flex justify-between italic text-slate-700 text-[6.2px] mb-0.5">
                  <span>{exp.company}</span>
                  <span className="not-italic text-slate-500">{exp.location}</span>
                </div>
                <p className="text-slate-700 text-[6.2px] line-clamp-2 leading-relaxed">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          {/* Education & Credentials */}
          <div className="mt-1.5 pt-1 border-t border-slate-300 flex justify-between text-[5.8px] text-slate-700 font-serif">
            <div>
              <span className="font-bold">Education: </span>
              {candidate.education[0].institution} — {candidate.education[0].degree}
            </div>
            <div className="font-sans text-slate-500">GPA: {candidate.education[0].gpa || '3.9 / 4.0'}</div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. CONSULTING EDGE (Bold Navy & Gold MBB Strategy Layout)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'consulting-edge') {
    return (
      <div className="w-full h-full bg-white text-slate-800 select-none font-sans leading-tight flex flex-col justify-between p-2.5">
        <div>
          {/* Deep Navy Left Accent Bar Header */}
          <div className="border-l-4 pl-2 pb-1 mb-1.5 flex justify-between items-baseline" style={{ borderColor: '#0F172A' }}>
            <div>
              <h1 className="font-black text-[11px] uppercase tracking-tight text-slate-900">
                {candidate.name}
              </h1>
              <p className="font-bold text-[6.5px] text-teal-800 uppercase tracking-wider">
                {candidate.role}
              </p>
            </div>
            <p className="text-[5.5px] text-slate-500 text-right">
              {candidate.location} · {candidate.email}
            </p>
          </div>

          {/* 3 Colorful Pastel KPI Metric Cards */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            <div className="p-1 rounded bg-amber-50 border border-amber-200 text-center">
              <p className="font-black text-[8.5px] text-amber-800">+$18.5M</p>
              <p className="text-[5px] text-amber-900 uppercase font-bold">Client OpEx Savings</p>
            </div>
            <div className="p-1 rounded bg-emerald-50 border border-emerald-200 text-center">
              <p className="font-black text-[8.5px] text-emerald-800">4.8x</p>
              <p className="text-[5px] text-emerald-900 uppercase font-bold">Digital Ops ROI</p>
            </div>
            <div className="p-1 rounded bg-sky-50 border border-sky-200 text-center">
              <p className="font-black text-[8.5px] text-sky-800">32%</p>
              <p className="text-[5px] text-sky-900 uppercase font-bold">Cost Reduction</p>
            </div>
          </div>

          {/* Structured Situation–Action–Impact Experience */}
          <div className="space-y-1.5">
            <p className="font-bold text-[7px] uppercase tracking-wider text-slate-900">
              STRATEGIC TRANSFORMATION ENGAGEMENTS
            </p>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1 p-1 rounded bg-slate-50/60 border border-slate-200/60">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-[6.8px]">{exp.title} — {exp.company}</span>
                  <span className="font-normal text-slate-400 text-[5.5px]">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-slate-600 text-[6.2px] line-clamp-2 mt-0.5 leading-relaxed">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          {/* Core Competencies */}
          <div className="mt-1.5 pt-1 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-x-2 text-[5.8px] text-slate-700 font-medium">
              <div>• Cloud Operating Models & Digitization</div>
              <div>• Post-Merger Enterprise Integration</div>
              <div>• Supply-Chain Demand Forecasting</div>
              <div>• Fortune 50 C-Suite Stakeholder Advisory</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ATS STANDARD (Crisp Corporate Steel-Blue Single Column)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'ats-standard' || layout === 'ats-standard-blue') {
    return (
      <div className="w-full h-full bg-white text-slate-900 select-none font-sans leading-tight flex flex-col justify-between p-3">
        <div>
          {/* Subtle Light-Blue Tinted Header Background */}
          <div className="bg-[#EFF6FF] border border-blue-200 p-2 rounded mb-2">
            <h1 className="font-black text-[12px] uppercase tracking-tight text-blue-900">
              {candidate.name}
            </h1>
            <p className="font-bold text-[6.5px] uppercase tracking-widest text-blue-700 mt-0.5">
              {candidate.role}
            </p>
            <p className="text-[5.8px] text-slate-600 mt-0.5">
              {candidate.location} · {candidate.email} · {candidate.phone}
            </p>
          </div>

          {/* Professional Summary */}
          <div className="mb-2">
            <h2 className="font-black text-[7.5px] uppercase tracking-wider text-blue-800 border-b-2 border-blue-600 pb-0.5 mb-1">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-slate-700 text-[6.2px] leading-relaxed line-clamp-2">
              {candidate.summary}
            </p>
          </div>

          {/* Work Experience */}
          <div className="mb-2">
            <h2 className="font-black text-[7.5px] uppercase tracking-wider text-blue-800 border-b-2 border-blue-600 pb-0.5 mb-1">
              ENTERPRISE SECURITY & CLOUD EXPERIENCE
            </h2>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-[7px] text-slate-900">{exp.title} — {exp.company}</span>
                  <span className="font-normal text-slate-500 text-[5.8px]">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-slate-700 text-[6.2px] line-clamp-2 mt-0.5 leading-relaxed">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          {/* Clean 3-Column Skills Bullet Grid */}
          <div>
            <h2 className="font-black text-[7.5px] uppercase tracking-wider text-blue-800 border-b-2 border-blue-600 pb-0.5 mb-1">
              TECHNICAL SECURITY COMPETENCIES
            </h2>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[5.8px] text-slate-700">
              {candidate.skills.slice(0, 6).map((sk, idx) => (
                <span key={idx}>• {sk}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. MONOCHROME MINIMAL (High-Contrast Stark Editorial Black & White)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'monochrome-minimal' || layout === 'monochrome-editorial') {
    return (
      <div className="w-full h-full bg-white text-black select-none font-sans leading-tight flex flex-col justify-between p-3">
        <div>
          {/* Oversized 32px / Stark Black Name & Thick 3px Solid Bar */}
          <div className="pb-1 mb-2 border-b-4 border-black">
            <h1 className="font-black text-[14px] uppercase tracking-tighter text-black">
              {candidate.name}
            </h1>
            <div className="flex justify-between items-baseline mt-0.5 text-[6.5px] font-bold text-black uppercase tracking-widest">
              <span>{candidate.role}</span>
              <span className="font-mono text-[5.5px] font-normal">{candidate.location} · {candidate.email}</span>
            </div>
          </div>

          {/* Asymmetric Left-Date (25%) / Right-Content (75%) Column Layout */}
          <div className="space-y-2">
            <p className="font-mono font-black text-[7px] uppercase tracking-widest text-black border-b border-black pb-0.5">
              EXPERIENCE
            </p>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="grid grid-cols-12 gap-2 text-[6.2px]">
                <div className="col-span-3 font-mono font-bold text-black text-[5.5px]">
                  {exp.startDate} — {exp.endDate}
                  <p className="text-stone-500 font-normal">{exp.location}</p>
                </div>
                <div className="col-span-9">
                  <p className="font-bold text-black">{exp.title} — {exp.company}</p>
                  <p className="text-stone-700 leading-relaxed mt-0.5 line-clamp-2">• {exp.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Education & Core Knowledge */}
          <div className="mt-2 pt-1 border-t-2 border-black grid grid-cols-12 gap-2 text-[6px]">
            <div className="col-span-3 font-mono font-bold text-black text-[5.5px]">
              CREDENTIALS
            </div>
            <div className="col-span-9 text-stone-800">
              <p className="font-bold">{candidate.education[0].institution} — {candidate.education[0].degree}</p>
              <p className="text-stone-600 mt-0.5">{candidate.skills.slice(0, 5).join(' · ')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. TIMELINE (Vibrant Vertical Career Spine with Milestone Nodes)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'timeline' || layout === 'timeline-spine') {
    return (
      <div className="w-full h-full bg-white text-slate-800 select-none font-sans leading-tight flex flex-col justify-between p-2.5">
        <div>
          {/* Header */}
          <div className="border-b pb-1.5 mb-2" style={{ borderColor: `${accent}40` }}>
            <h1 className="font-black text-[11px] uppercase tracking-tight text-slate-900">
              {candidate.name}
            </h1>
            <p className="font-semibold text-[6.5px]" style={{ color: accent }}>
              {candidate.role} · {candidate.location} · {candidate.email}
            </p>
          </div>

          {/* Vertical Colored Timeline Spine */}
          <div className="relative pl-3 border-l-2 space-y-2 mt-1" style={{ borderColor: accent }}>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="relative bg-[#F8FAFC] border border-slate-200/80 rounded-lg p-1.5 shadow-2xs">
                {/* Milestone Node */}
                <span
                  className="absolute -left-[18px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: accent }}
                />
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-[6.8px]">{exp.title}</span>
                  <span className="text-[5.5px] font-normal text-slate-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="italic text-slate-500 text-[6px]">{exp.company} — {exp.location}</p>
                <p className="text-slate-600 text-[6.2px] line-clamp-2 mt-0.5 leading-relaxed">
                  • {exp.description}
                </p>
              </div>
            ))}

            {/* Education Milestone Node */}
            <div className="relative pt-1">
              <span
                className="absolute -left-[18px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
                style={{ backgroundColor: accent }}
              />
              <p className="font-bold text-[6.8px] text-slate-900">{candidate.education[0].institution}</p>
              <p className="text-[5.8px] text-slate-500">{candidate.education[0].degree}</p>
            </div>
          </div>

          {/* Colorful Rounded Skill Pills at Bottom */}
          <div className="mt-2 pt-1 border-t border-slate-200">
            <p className="font-bold text-[6.5px] uppercase tracking-wider mb-1" style={{ color: accent }}>
              CORE TECHNOLOGIES & INFRASTRUCTURE
            </p>
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 6).map((sk, idx) => (
                <span key={idx} className="text-[5.5px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium border border-slate-200">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. EDITORIAL (Warm Terracotta & Cream Magazine Spread)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'editorial' || layout === 'editorial-serif') {
    return (
      <div className="w-full h-full bg-[#FDF8F0] text-stone-900 select-none font-serif leading-tight flex flex-col justify-between p-3">
        <div>
          {/* Terracotta / Burnt-Orange Oversized Serif Masthead */}
          <div className="text-center pb-2 border-b-2 border-stone-300">
            <h1 className="font-serif font-black text-[14px] tracking-tight uppercase text-[#C2410C]">
              {candidate.name}
            </h1>
            <p className="font-sans text-[6.5px] tracking-widest uppercase text-stone-600 mt-0.5">
              {candidate.role}
            </p>
            <p className="font-sans text-[5.8px] text-stone-500 mt-0.5">
              {candidate.location} · {candidate.email}
            </p>
          </div>

          {/* Pull-Quote with Thick Left Terracotta Border */}
          <div className="my-2 italic text-stone-800 text-[6.5px] bg-[#FAF3E8] p-2 rounded-r border-l-4 border-[#C2410C]">
            "{candidate.summary}"
          </div>

          {/* Magazine 2-Column Experience Layout */}
          <div className="mt-2">
            <p className="font-sans font-bold text-[7px] uppercase tracking-wider text-[#C2410C] mb-1">
              DESIGN PORTFOLIO & LEADERSHIP
            </p>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between items-baseline font-bold text-stone-900">
                  <span className="text-[7px]">{exp.title} — {exp.company}</span>
                  <span className="font-sans font-normal text-stone-400 text-[5.5px]">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-stone-700 text-[6.2px] line-clamp-2 mt-0.5">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          {/* Credentials */}
          <div className="mt-1.5 pt-1 border-t border-stone-300 flex justify-between text-[5.8px] text-stone-600 font-sans">
            <div>
              <span className="font-bold">Education: </span>
              {candidate.education[0].institution} — {candidate.education[0].degree}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. SWISS GRID (Bold Bauhaus Geometric Color-Block Grid)
  // ───────────────────────────────────────────────────────────────────────────
  if (template.id === 'swiss-grid' || layout === 'swiss-grid') {
    return (
      <div className="w-full h-full bg-white text-slate-900 select-none font-sans leading-tight flex flex-col justify-between p-2">
        <div className="border-2 border-stone-800 h-full flex flex-col">
          {/* Top Grid: Vibrant Colored Top-Left Name Quadrant */}
          <div className="grid grid-cols-12 border-b-2 border-stone-800">
            <div className="col-span-8 p-2 text-white" style={{ backgroundColor: '#1E40AF' }}>
              <h1 className="font-black text-[12px] uppercase tracking-tighter text-white">
                {candidate.name}
              </h1>
              <p className="font-mono text-[6.2px] uppercase tracking-wider text-blue-200">
                {candidate.role}
              </p>
            </div>
            <div className="col-span-4 p-2 bg-stone-100 flex flex-col justify-center text-[5.5px] font-mono text-stone-600">
              <p>{candidate.location}</p>
              <p>{candidate.email}</p>
            </div>
          </div>

          {/* Section 01: Experience */}
          <div className="p-2 border-b-2 border-stone-800 flex-1">
            <p className="font-mono font-black text-[6.5px] uppercase tracking-widest text-stone-800 mb-1">
              01 / EXPERIENCE
            </p>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between items-baseline font-bold text-slate-900 text-[6.8px]">
                  <span>{exp.title} — {exp.company}</span>
                  <span className="font-mono text-[5.5px] text-slate-500">{exp.startDate}–{exp.endDate}</span>
                </div>
                <p className="text-slate-600 text-[6px] line-clamp-2 mt-0.5">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          {/* Section 02 & 03: Stack & Education */}
          <div className="grid grid-cols-2">
            <div className="p-1.5 border-r-2 border-stone-800">
              <p className="font-mono font-black text-[6px] uppercase text-stone-800 mb-0.5">
                02 / STACK
              </p>
              <div className="space-y-0.5 text-[5.5px] text-slate-700">
                {candidate.skills.slice(0, 4).map((sk, idx) => (
                  <p key={idx} className="truncate">• {sk}</p>
                ))}
              </div>
            </div>
            <div className="p-1.5">
              <p className="font-mono font-black text-[6px] uppercase text-stone-800 mb-0.5">
                03 / EDUCATION
              </p>
              <p className="font-bold text-[6px] text-slate-900">{candidate.education[0].institution}</p>
              <p className="text-[5.2px] text-slate-500">{candidate.education[0].degree}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. LATEX CLASSIC (Academic & SDE Jake's Format)
  // ───────────────────────────────────────────────────────────────────────────
  if (layout === 'latex-academic') {
    return (
      <div
        className={`w-full h-full bg-white text-slate-900 select-none font-serif leading-tight flex flex-col justify-between ${
          isMini ? 'p-3 text-[7.5px]' : 'p-8 text-[11px] shadow-lg'
        }`}
      >
        <div>
          <div className="text-center pb-1.5 border-b border-slate-300">
            <h1
              className={`font-serif font-black uppercase tracking-wider ${isMini ? 'text-[12px]' : 'text-2xl'}`}
              style={{ color: accent }}
            >
              {candidate.name}
            </h1>
            <p className={`text-slate-600 mt-0.5 flex items-center justify-center gap-1.5 ${isMini ? 'text-[6.5px]' : 'text-xs'}`}>
              <span>{candidate.location}</span>
              <span>·</span>
              <span>{candidate.phone}</span>
              <span>·</span>
              <span>{candidate.email}</span>
            </p>
            <div className={`flex items-center justify-center gap-2 mt-0.5 text-blue-700 underline font-sans ${isMini ? 'text-[6px]' : 'text-xs'}`}>
              <span>linkedin.com/in/{candidate.name.toLowerCase().replace(/\s+/g, '')}</span>
              <span>·</span>
              <span>github.com/{candidate.name.toLowerCase().replace(/\s+/g, '')}</span>
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-bold tracking-widest uppercase border-b border-slate-400 pb-0.5 mb-1" style={{ fontSize: isMini ? '7.5px' : '11px', color: accent }}>
              EDUCATION
            </h2>
            {candidate.education.slice(0, 1).map((edu) => (
              <div key={edu.id} className="mb-1">
                <div className="flex justify-between items-baseline font-bold">
                  <span>{edu.institution}</span>
                  <span className="font-normal text-slate-500">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="flex justify-between italic text-slate-700">
                  <span>{edu.degree}</span>
                  <span className="not-italic text-slate-500">{(edu as any).location || 'India'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <h2 className="font-bold tracking-widest uppercase border-b border-slate-400 pb-0.5 mb-1" style={{ fontSize: isMini ? '7.5px' : '11px', color: accent }}>
              WORK EXPERIENCE
            </h2>
            {candidate.experience.slice(0, 2).map((exp) => (
              <div key={exp.id} className="mb-1.5">
                <div className="flex justify-between items-baseline font-bold">
                  <span>{exp.title}</span>
                  <span className="font-normal text-slate-500">{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="flex justify-between italic text-slate-700 mb-0.5">
                  <span>{exp.company}</span>
                  <span className="not-italic text-slate-500">{exp.location}</span>
                </div>
                <p className="text-slate-700 line-clamp-2 leading-relaxed">
                  • {exp.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-1.5">
            <h2 className="font-bold tracking-widest uppercase border-b border-slate-400 pb-0.5 mb-1" style={{ fontSize: isMini ? '7.5px' : '11px', color: accent }}>
              TECHNICAL SKILLS
            </h2>
            <div className="space-y-0.5 text-slate-800">
              <p><span className="font-bold">Languages & Cloud:</span> GCP, Python, Go, TypeScript, Docker, SQL</p>
              <p><span className="font-bold">Frameworks & Tools:</span> FastAPI, React, Kubernetes, PostgreSQL, Redis</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10. EXECUTIVE BANNER (Executive, Directorate)
  // ───────────────────────────────────────────────────────────────────────────
  if (layout === 'executive-banner') {
    return (
      <div className="w-full h-full bg-white text-slate-800 select-none font-sans leading-tight flex flex-col justify-between">
        <div>
          <div className="bg-slate-900 text-white p-3 border-b-2" style={{ borderColor: accent }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-black uppercase tracking-wider text-[11px] text-white">
                  {candidate.name}
                </h1>
                <p className="font-bold text-[6.5px] uppercase tracking-widest text-amber-400">
                  {candidate.role}
                </p>
              </div>
              <div className="text-[5.5px] text-slate-300 text-right space-y-0.5 font-mono">
                <p>{candidate.location}</p>
                <p>{candidate.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2.5 space-y-2">
            <div>
              <p className="font-black text-[7px] uppercase tracking-wider text-slate-900 mb-0.5">
                EXECUTIVE PROFILE
              </p>
              <p className="text-slate-600 text-[6.2px] leading-relaxed line-clamp-2">
                {candidate.summary}
              </p>
            </div>

            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <p className="font-bold text-[6.5px] uppercase text-slate-900 mb-1" style={{ color: accent }}>
                CORE EXECUTIVE COMPETENCIES
              </p>
              <div className="grid grid-cols-3 gap-1 text-[5.8px] text-slate-700 font-medium">
                <div>• Enterprise Architecture</div>
                <div>• P&L & Cloud Budgeting</div>
                <div>• High-Throughput SLA</div>
                <div>• SRE & Reliability</div>
                <div>• Multi-Region Strategy</div>
                <div>• Engineering Leadership</div>
              </div>
            </div>

            <div>
              <p className="font-black text-[7px] uppercase tracking-wider text-slate-900 mb-1">
                PROFESSIONAL EXPERIENCE
              </p>
              {candidate.experience.slice(0, 2).map((exp) => (
                <div key={exp.id} className="mb-1.5 border-l-2 pl-1.5" style={{ borderColor: accent }}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[6.8px]">{exp.title} — {exp.company}</span>
                    <span className="font-normal text-slate-400 text-[5.5px]">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 text-[6px] line-clamp-2 mt-0.5">
                    • {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 11. SIDEBAR LEFT FULL (Bold Split, Dark Slate Split, Studio, Terracotta, Emerald Matrix)
  // Matches cards Andy Smith (AS), Henry Parker (HP), Jasmine Brown (JB)
  // ───────────────────────────────────────────────────────────────────────────
  if (layout === 'sidebar-left-full') {
    return (
      <div className="w-full h-full bg-white select-none font-sans leading-tight flex overflow-hidden">
        <div
          className="w-[34%] text-white p-2.5 flex flex-col justify-between"
          style={{ backgroundColor: candidate.avatarBg || accent }}
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-md bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center font-black text-[12px] tracking-wider text-white shadow-sm">
              {candidate.initials}
            </div>

            <div className="space-y-1 pt-1 border-t border-white/20 text-[5.5px] text-white/90">
              <p className="font-bold uppercase tracking-wider text-[6.5px] text-white/80">CONTACT</p>
              <p className="truncate">• {candidate.phone}</p>
              <p className="truncate">• {candidate.email}</p>
              <p className="truncate">• {candidate.location}</p>
            </div>

            <div className="space-y-0.5 pt-1 border-t border-white/20 text-[5.5px] text-white/90">
              <p className="font-bold uppercase tracking-wider text-[6.5px] text-white/80">EDUCATION</p>
              <p className="font-bold">{candidate.education[0].institution}</p>
              <p className="text-white/70">{candidate.education[0].degree}</p>
            </div>

            <div className="space-y-0.5 pt-1 border-t border-white/20 text-[5.5px] text-white/90">
              <p className="font-bold uppercase tracking-wider text-[6.5px] text-white/80">KEY SKILLS</p>
              {candidate.skills.slice(0, 5).map((sk, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/80 shrink-0" />
                  <span className="truncate">{sk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[66%] p-3 text-slate-800 flex flex-col justify-between">
          <div>
            <div className="border-b-2 pb-1.5 mb-2" style={{ borderColor: accent }}>
              <h1 className="font-black uppercase tracking-tight text-slate-900 text-[11px]">
                {candidate.name}
              </h1>
              <p className="font-bold text-[6.5px] uppercase tracking-wider" style={{ color: accent }}>
                {candidate.role}
              </p>
            </div>

            <div>
              <p className="font-bold text-[7px] uppercase tracking-wider mb-1" style={{ color: accent }}>
                PROFESSIONAL EXPERIENCE
              </p>
              {candidate.experience.slice(0, 2).map((exp) => (
                <div key={exp.id} className="mb-2">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[6.8px]">{exp.title}</span>
                    <span className="font-normal text-slate-400 text-[5.5px]">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p className="italic text-slate-500 text-[6px] mb-0.5">{exp.company} — {exp.location}</p>
                  <p className="text-slate-600 text-[6.2px] line-clamp-2 leading-relaxed">
                    • {exp.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-1 border-t border-slate-200">
              <p className="font-bold text-[6.5px] uppercase tracking-wider text-slate-900 mb-0.5">
                CERTIFICATIONS
              </p>
              <p className="text-slate-600 text-[5.8px]">
                Google Cloud Professional Cloud Architect · Certified Kubernetes Administrator (CKA)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. SPLIT BANNER SIDEBAR (Metro, Sleek Hybrid, Nordic, Clarity)
  // ───────────────────────────────────────────────────────────────────────────
  if (layout === 'split-banner-sidebar') {
    return (
      <div className="w-full h-full bg-white select-none font-sans leading-tight flex flex-col justify-between">
        <div>
          <div className="p-2.5 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/25 border border-white/40 flex items-center justify-center font-black text-[10px] text-white shrink-0">
                {candidate.initials}
              </div>
              <div>
                <h1 className="font-black uppercase tracking-wider text-[11px] text-white">
                  {candidate.name}
                </h1>
                <p className="font-medium text-[6.2px] text-white/90">
                  {candidate.role}
                </p>
              </div>
            </div>
            <div className="text-[5.5px] text-white/80 text-right">
              {candidate.location}<br />{candidate.email}
            </div>
          </div>

          <div className="grid grid-cols-12 h-full">
            <div className="col-span-4 bg-slate-100/80 p-2 space-y-2 border-r border-slate-200">
              <div>
                <p className="font-bold text-[6.5px] uppercase tracking-wider text-slate-900 mb-0.5">
                  CONTACT
                </p>
                <p className="text-[5.5px] text-slate-600 truncate">{candidate.phone}</p>
                <p className="text-[5.5px] text-slate-600 truncate">{candidate.email}</p>
              </div>

              <div>
                <p className="font-bold text-[6.5px] uppercase tracking-wider text-slate-900 mb-0.5">
                  EDUCATION
                </p>
                <p className="font-bold text-[6px] text-slate-900">{candidate.education[0].institution}</p>
                <p className="text-[5.5px] text-slate-500">{candidate.education[0].degree}</p>
              </div>

              <div>
                <p className="font-bold text-[6.5px] uppercase tracking-wider text-slate-900 mb-0.5">
                  KEY SKILLS
                </p>
                <div className="space-y-0.5 text-[5.8px] text-slate-700">
                  {candidate.skills.slice(0, 5).map((sk, idx) => (
                    <p key={idx} className="truncate">• {sk}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-8 p-2.5 space-y-2">
              <div>
                <p className="font-bold text-[6.8px] uppercase tracking-wider mb-0.5" style={{ color: accent }}>
                  ABOUT ME
                </p>
                <p className="text-slate-600 text-[6.2px] line-clamp-2 leading-relaxed">
                  {candidate.summary}
                </p>
              </div>

              <div>
                <p className="font-bold text-[6.8px] uppercase tracking-wider mb-1" style={{ color: accent }}>
                  PROFESSIONAL EXPERIENCE
                </p>
                {candidate.experience.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="mb-1.5">
                    <p className="font-bold text-[6.8px] text-slate-900">{exp.title} — {exp.company}</p>
                    <p className="text-slate-600 text-[6px] line-clamp-2 mt-0.5">• {exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 13. DEFAULT MONOGRAM CARDS (Studio, Aura Golden Hour, Modern Clean)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full bg-white text-slate-800 select-none font-sans leading-tight flex flex-col justify-between p-2.5">
      <div>
        <div className="border-b-2 pb-1.5 mb-2" style={{ borderColor: accent }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-xs"
              style={{ backgroundColor: candidate.avatarBg || accent }}
            >
              {candidate.initials}
            </div>
            <div className="flex-1">
              <h1 className="font-black text-[11px] uppercase tracking-tight text-slate-900">
                {candidate.name}
              </h1>
              <p className="font-bold text-[6.5px]" style={{ color: accent }}>
                {candidate.role}
              </p>
            </div>
            <p className="text-[5.5px] text-slate-500 text-right">
              {candidate.location}<br />{candidate.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7 space-y-1.5">
            <div>
              <p className="font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accent }}>
                Summary
              </p>
              <p className="text-slate-600 text-[6.2px] leading-relaxed line-clamp-2">{candidate.summary}</p>
            </div>

            <div>
              <p className="font-bold text-[7px] uppercase tracking-wider mb-1" style={{ color: accent }}>
                Experience
              </p>
              {candidate.experience.slice(0, 2).map((exp) => (
                <div key={exp.id} className="mb-1 p-1 rounded bg-slate-50/80 border border-slate-100">
                  <p className="font-bold text-[6.8px] text-slate-900">{exp.title} — {exp.company}</p>
                  <p className="text-slate-600 text-[6px] line-clamp-2">• {exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 space-y-1.5 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
            <div>
              <p className="font-bold text-[7px] uppercase tracking-wider mb-1" style={{ color: accent }}>
                Core Skills
              </p>
              <div className="space-y-0.5 text-[5.8px] text-slate-700">
                {candidate.skills.slice(0, 5).map((sk, idx) => (
                  <p key={idx} className="truncate">• {sk}</p>
                ))}
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200">
              <p className="font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accent }}>
                Education
              </p>
              <p className="font-bold text-[6.2px] text-slate-900">{candidate.education[0].institution}</p>
              <p className="text-[5.5px] text-slate-500">{candidate.education[0].degree}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplatePreview;
