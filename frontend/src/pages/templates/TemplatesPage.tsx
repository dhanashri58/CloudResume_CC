import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Check,
  MapPin,
  Mail,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import { Button } from '../../components/ui';
import type { TemplateCategory, ResumeTemplate } from '../../types';

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All templates' },
  { value: 'professional', label: 'Professional' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
  { value: 'academic', label: 'Academic' },
];

const SWATCH_COLORS = [
  { id: 'sapphire', name: 'Royal Sapphire', hex: '#2563EB' },
  { id: 'slate', name: 'Charcoal Slate', hex: '#1E293B' },
  { id: 'sand', name: 'Warm Taupe', hex: '#A38F78' },
  { id: 'navy', name: 'Deep Navy', hex: '#1E3A8A' },
  { id: 'sky', name: 'Sky Azure', hex: '#38BDF8' },
  { id: 'teal', name: 'Forest Emerald', hex: '#059669' },
  { id: 'orange', name: 'Warm Amber', hex: '#EA580C' },
  { id: 'crimson', name: 'Ruby Crimson', hex: '#DC2626' },
];

// ─── Realistic Resume Miniature Preview (Matches Screenshot) ─────────────────

const RealisticResumeMini: React.FC<{
  template: ResumeTemplate;
  accentColor: string;
}> = ({ template, accentColor }) => {
  const candidateName = 'TANMAY KUMBHARE';
  const candidateInitials = 'TK';
  const candidateRole = 'Senior Full-Stack & Cloud Engineer';

  // Determine layout style according to template ID
  const isDarkBanner = template.id === 'executive' || template.id === 'pulse';
  const isMonogram = template.id === 'clarity' || template.id === 'scholar';
  const isTwoColumnWithPhoto = template.id === 'horizon' || template.id === 'prism';

  return (
    <div className="h-56 p-3 bg-white text-slate-800 relative overflow-hidden select-none font-sans text-[7px] leading-tight flex flex-col justify-between shadow-inner">
      {/* ─── LAYOUT TYPE 1: Dark / Accent Header Banner (Screenshot Card 1) ─── */}
      {isDarkBanner && (
        <div className="flex-1 flex flex-col">
          {/* Header Banner */}
          <div
            className="p-2 -mx-3 -mt-3 mb-2 flex items-center gap-2 text-white transition-colors duration-200"
            style={{ backgroundColor: accentColor || '#1E293B' }}
          >
            <img
              src="/avatars/candidate-avatar.png"
              alt={candidateName}
              className="w-6 h-6 rounded-md object-cover border border-white/40 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-extrabold tracking-wider text-[9px] uppercase leading-none">{candidateName}</p>
              <p className="text-[6px] text-white/80 mt-0.5 truncate">Pune, India · tanmay.kumbhare24@vit.edu</p>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-2">
            <p className="font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
              SUMMARY
            </p>
            <p className="text-[6.5px] text-slate-600 line-clamp-2 leading-relaxed">
              Customer-focused professional with solid understanding of sales dynamics, operations, and modern cloud architectures.
            </p>
          </div>

          {/* Skills (2 Columns) */}
          <div className="mb-2">
            <p className="font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
              SKILLS
            </p>
            <div className="grid grid-cols-2 gap-x-2 text-[6px] text-slate-600">
              <span>• Cloud Architecture</span>
              <span>• Microservices</span>
              <span>• Team Leadership</span>
              <span>• Fast Troubleshooting</span>
            </div>
          </div>

          {/* Experience */}
          <div className="mt-auto">
            <p className="font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
              EXPERIENCE
            </p>
            <div className="flex items-center justify-between text-[6.5px] font-semibold text-slate-900">
              <span className="truncate">{candidateRole}</span>
              <span className="text-[5.5px] text-slate-400">02/2019 – Present</span>
            </div>
            <p className="text-[6px] text-slate-500 italic">ZARA · New Delhi, India</p>
            <p className="text-[6px] text-slate-600 line-clamp-2 mt-0.5">
              • Increased monthly sales by 32% by elevating customer experience and technical product recommendations.
            </p>
          </div>
        </div>
      )}

      {/* ─── LAYOUT TYPE 2: Monogram Minimal Centered (Screenshot Card 2) ─── */}
      {isMonogram && (
        <div className="flex-1 flex flex-col text-center">
          {/* Circular Monogram */}
          <div className="flex flex-col items-center pt-1 mb-2">
            <div
              className="w-7 h-7 rounded-full border flex items-center justify-center font-serif text-[8px] font-bold text-slate-900 mb-0.5 transition-colors"
              style={{ borderColor: accentColor }}
            >
              {candidateInitials}
            </div>
            <p className="font-serif font-black tracking-wide text-[10px] text-slate-900 uppercase">
              {candidateName}
            </p>
            <p className="text-[6px] text-slate-400">tanmay.kumbhare24@vit.edu · Pune, India</p>
            <div className="w-12 h-0.5 mt-1 transition-colors" style={{ backgroundColor: accentColor }} />
          </div>

          {/* Summary */}
          <div className="text-left mb-2">
            <p className="font-serif font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
              Summary
            </p>
            <p className="text-[6.5px] text-slate-600 line-clamp-2 leading-relaxed">
              Customer-focused professional offering 5 years of experience delivering quality services and modern cloud solutions.
            </p>
          </div>

          {/* Skills & Experience */}
          <div className="text-left mt-auto">
            <p className="font-serif font-bold text-[7px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
              Experience
            </p>
            <div className="flex items-center justify-between text-[6.5px] font-bold text-slate-900">
              <span>{candidateRole}</span>
              <span className="text-[5.5px] text-slate-400">2019 - Present</span>
            </div>
            <p className="text-[6px] text-slate-600 line-clamp-2 mt-0.5">
              • Managed operations and high-impact stakeholder accounts with 99.8% customer satisfaction score.
            </p>
          </div>
        </div>
      )}

      {/* ─── LAYOUT TYPE 3: Two-Column with Photo (Screenshot Card 3) ─── */}
      {isTwoColumnWithPhoto && (
        <div className="flex-1 flex gap-2">
          {/* Left Column (Photo & Quick Contact) */}
          <div className="w-[30%] border-r border-slate-200 pr-1.5 flex flex-col items-center text-center">
            {/* Candidate Photo */}
            <div
              className="w-10 h-10 rounded-md border overflow-hidden p-0.5 mb-1.5 shrink-0 transition-colors"
              style={{ borderColor: accentColor }}
            >
              <img
                src="/avatars/candidate-avatar.png"
                alt={candidateName}
                className="w-full h-full rounded object-cover"
              />
            </div>

            <p className="text-[6px] font-bold text-slate-800">CONTACT</p>
            <p className="text-[5.5px] text-slate-500 truncate w-full flex items-center justify-center gap-0.5">
              <MapPin size={6} className="shrink-0" />
              <span>Pune, India</span>
            </p>
            <p className="text-[5.5px] text-slate-500 truncate w-full flex items-center justify-center gap-0.5">
              <Mail size={6} className="shrink-0" />
              <span>vit.edu</span>
            </p>

            <div className="mt-2 text-left w-full">
              <p className="text-[6px] font-bold text-slate-800 mb-0.5">SKILLS</p>
              <p className="text-[5.5px] text-slate-600">• Cloud APIs</p>
              <p className="text-[5.5px] text-slate-600">• Docker</p>
              <p className="text-[5.5px] text-slate-600">• Python</p>
            </div>
          </div>

          {/* Right Column (Header, Summary, Experience) */}
          <div className="flex-1 flex flex-col justify-between pl-0.5">
            <div>
              <p className="font-extrabold text-[9px] uppercase tracking-tight text-slate-900 leading-none">
                {candidateName}
              </p>
              <div className="w-full h-0.5 my-1 transition-colors" style={{ backgroundColor: accentColor }} />
            </div>

            <div>
              <p className="font-bold text-[6.5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
                SUMMARY
              </p>
              <p className="text-[6px] text-slate-600 line-clamp-2 leading-relaxed">
                Customer-focused Software Engineer with solid understanding of modern cloud architectures and scalable microservices.
              </p>
            </div>

            <div>
              <p className="font-bold text-[6.5px] uppercase tracking-wider mb-0.5" style={{ color: accentColor }}>
                EXPERIENCE
              </p>
              <p className="text-[6.5px] font-bold text-slate-900 leading-tight">Senior Engineer — ZARA / Cisco</p>
              <p className="text-[5.5px] text-slate-400">02/2019 – Present | New Delhi, India</p>
              <p className="text-[6px] text-slate-600 line-clamp-2 mt-0.5">
                • Increased monthly efficiency by 34% through proactive microservice architecture and caching.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── DEFAULT / CLASSIC TYPE 4: Clean Executive Layout ─── */}
      {!isDarkBanner && !isMonogram && !isTwoColumnWithPhoto && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="border-b pb-1.5" style={{ borderColor: `${accentColor}40` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-[9px] uppercase tracking-wide text-slate-900">{candidateName}</p>
                <p className="text-[6px] text-slate-500">New Delhi, India · +91 11 5555 5555</p>
              </div>
              <div
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[7px] text-white"
                style={{ backgroundColor: accentColor }}
              >
                {candidateInitials}
              </div>
            </div>
          </div>

          <div className="my-1">
            <p className="font-bold text-[7px] uppercase tracking-wider" style={{ color: accentColor }}>
              Professional Summary
            </p>
            <p className="text-[6.5px] text-slate-600 line-clamp-2">
              Results-oriented cloud architect with experience in designing, testing, and automating high-throughput infrastructure.
            </p>
          </div>

          <div>
            <p className="font-bold text-[7px] uppercase tracking-wider" style={{ color: accentColor }}>
              Experience & Projects
            </p>
            <p className="text-[6.5px] font-bold text-slate-900">Lead Cloud Engineer — Tech Systems</p>
            <p className="text-[6px] text-slate-600 line-clamp-2 mt-0.5">
              • Architected serverless Cloud Run pipelines cutting API latency by 40% and sustaining 10k RPS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Template Card Component ─────────────────────────────────────────────────

const TemplateCard: React.FC<{
  template: ResumeTemplate;
  onSelect: (id: string) => void;
  selected: boolean;
  activeColor: string;
}> = ({ template, onSelect, selected, activeColor }) => {
  const isRecommended = template.popular || template.id === 'clarity' || template.id === 'horizon';

  return (
    <div
      className={`group relative rounded-3xl border overflow-hidden bg-[var(--bg-surface)] transition-all duration-300 cursor-pointer shadow-xs ${
        selected
          ? 'border-amber-500 shadow-md ring-2 ring-amber-500/30'
          : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:shadow-lg hover:-translate-y-1'
      }`}
      onClick={() => onSelect(template.id)}
    >
      {/* Recommended badge (Matches Screenshot) */}
      {isRecommended && !template.premium && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-full text-[10px] font-bold shadow-xs">
          Recommended
        </div>
      )}

      {/* Premium badge */}
      {template.premium && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] font-bold text-amber-800 dark:text-amber-300 shadow-xs">
          <Lock size={10} />
          Pro
        </div>
      )}

      {/* Realistic Resume Preview Miniature */}
      <RealisticResumeMini
        template={template}
        accentColor={activeColor || template.colorScheme.accent}
      />

      {/* Hover Overlay Button */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 dark:group-hover:bg-black/45 transition-colors pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-200 pointer-events-auto flex items-center gap-2">
          <Button size="sm" className="shadow-lg">
            Use template
          </Button>
        </div>
      </div>

      {/* Selected indicator overlay */}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-600/15 backdrop-blur-[1px] pointer-events-none">
          <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <Check size={18} className="text-white font-bold" />
          </div>
        </div>
      )}

      {/* Card Info Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)] font-serif">{template.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
              {template.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {template.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Templates Page Component ────────────────────────────────────────────────

const TemplatesPage: React.FC = () => {
  const [category, setCategory] = useState<TemplateCategory>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filters from Screenshot
  const [headshotFilter, setHeadshotFilter] = useState<string>('all');
  const [graphicsFilter, setGraphicsFilter] = useState<string>('all');
  const [columnsFilter, setColumnsFilter] = useState<string>('all');
  const [activeColor, setActiveColor] = useState<string>(SWATCH_COLORS[0].hex);

  const filtered = useMemo(() => {
    return RESUME_TEMPLATES.filter((t) => {
      // Category match
      const matchCat = category === 'all' || t.category === category;

      // Search match
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));

      // Headshot filter
      const hasHeadshot = t.id === 'horizon' || t.id === 'prism' || t.id === 'pulse';
      if (headshotFilter === 'with' && !hasHeadshot) return false;
      if (headshotFilter === 'without' && hasHeadshot) return false;

      // Columns filter
      const isTwoColumn = t.id === 'horizon' || t.id === 'prism' || t.id === 'atlas';
      if (columnsFilter === '1' && isTwoColumn) return false;
      if (columnsFilter === '2' && !isTwoColumn) return false;

      // Graphics filter
      if (graphicsFilter === 'modern' && t.category !== 'modern') return false;
      if (graphicsFilter === 'minimal' && t.category !== 'minimal') return false;
      if (graphicsFilter === 'creative' && t.category !== 'creative') return false;

      return matchCat && matchSearch;
    });
  }, [category, search, headshotFilter, graphicsFilter, columnsFilter]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* ─── Page Header (Matches Screenshot) ─────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2.5 border border-amber-500/20">
          <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
          <span>Resume Templates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-2 font-sans tracking-tight">
          Templates we recommend for you
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
          You can always change your template later.
        </p>
      </div>

      {/* ─── Filter Bar (Matches Screenshot) ───────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl sm:rounded-full p-3 sm:px-6 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Left Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight mr-1">
            Filter by
          </span>

          {/* Dropdown: Headshot */}
          <div className="relative">
            <select
              value={headshotFilter}
              onChange={(e) => setHeadshotFilter(e.target.value)}
              className="appearance-none text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-full pl-3.5 pr-8 py-2 focus:outline-none focus:border-[var(--accent-primary)] cursor-default transition-colors"
            >
              <option value="all">Headshot: All</option>
              <option value="with">With Headshot</option>
              <option value="without">Without Headshot</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Dropdown: Graphics */}
          <div className="relative">
            <select
              value={graphicsFilter}
              onChange={(e) => setGraphicsFilter(e.target.value)}
              className="appearance-none text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-full pl-3.5 pr-8 py-2 focus:outline-none focus:border-[var(--accent-primary)] cursor-default transition-colors"
            >
              <option value="all">Graphics: All</option>
              <option value="modern">Modern Accents</option>
              <option value="minimal">Minimal Lines</option>
              <option value="creative">Creative Flair</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Dropdown: Columns */}
          <div className="relative">
            <select
              value={columnsFilter}
              onChange={(e) => setColumnsFilter(e.target.value)}
              className="appearance-none text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-full pl-3.5 pr-8 py-2 focus:outline-none focus:border-[var(--accent-primary)] cursor-default transition-colors"
            >
              <option value="all">Columns: All</option>
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Right Color Swatches Picker (Matches Screenshot) */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-[var(--text-primary)] hidden md:inline">
            Colors
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SWATCH_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveColor(c.hex)}
                title={c.name}
                className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                  activeColor === c.hex
                    ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110 shadow-xs'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {activeColor === c.hex && <Check size={11} className="text-white font-black" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Search & Category Row ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-[var(--border-subtle)] rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/40 focus:border-[var(--accent-primary)] shadow-2xs transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                category === cat.value
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)] shadow-xs'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Showing Count & Sort ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
          <SlidersHorizontal size={13} />
          <span>Sort: Recommended first</span>
        </div>
      </div>

      {/* ─── Template Grid (Realistic Cards) ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] p-8">
          <p className="text-sm font-semibold mb-1 text-[var(--text-primary)]">No templates found</p>
          <p className="text-xs">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              onSelect={handleSelect}
              activeColor={activeColor}
            />
          ))}
        </div>
      )}

      {/* ─── Selected Template Bottom Floating Bar ─────────────────────────── */}
      {selectedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl rounded-full px-6 py-3.5 flex items-center gap-4 animate-fadeIn">
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {RESUME_TEMPLATES.find((t) => t.id === selectedId)?.name} selected
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Ready to craft your resume?
            </p>
          </div>
          <Link to={`/editor/new?template=${selectedId}`}>
            <Button size="sm">
              Use this template
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
