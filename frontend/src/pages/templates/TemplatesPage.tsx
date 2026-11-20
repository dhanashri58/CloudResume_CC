import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Lock, ArrowRight, Sparkles } from 'lucide-react';
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

// ─── Template card ────────────────────────────────────────────────────────────

const TemplateCard: React.FC<{
  template: ResumeTemplate;
  onSelect: (id: string) => void;
  selected: boolean;
}> = ({ template, onSelect, selected }) => {
  const { colorScheme: cs } = template;

  return (
    <div
      className={`group relative rounded-3xl border overflow-hidden bg-[var(--bg-surface)] transition-all duration-300 cursor-pointer shadow-xs ${
        selected
          ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
          : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:shadow-md hover:-translate-y-0.5'
      }`}
      onClick={() => onSelect(template.id)}
    >
      {/* Premium badge */}
      {template.premium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300">
          <Lock size={10} />
          Pro
        </div>
      )}

      {/* Popular badge */}
      {template.popular && !template.premium && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs font-bold text-amber-800 dark:text-amber-300 shadow-2xs">
          <Star size={10} className="fill-amber-600 text-amber-600" />
          Popular
        </div>
      )}

      {/* Template preview */}
      <div
        className="h-44 p-4 relative"
        style={{ background: cs.bg }}
      >
        {/* Accent stripe */}
        <div
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ background: cs.accent }}
        />
        <div className="mt-2 space-y-1.5">
          <div
            className="h-2.5 w-24 rounded-full"
            style={{ background: cs.primary, opacity: 0.85 }}
          />
          <div
            className="h-1.5 w-16 rounded-full"
            style={{ background: cs.accent, opacity: 0.7 }}
          />
        </div>
        <div className="mt-4 space-y-1">
          {[75, 60, 50, 65].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${w}%`,
                background: cs.primary,
                opacity: 0.12 + i * 0.04,
              }}
            />
          ))}
        </div>
        <div className="mt-4 pt-3 border-t" style={{ borderColor: `${cs.primary}20` }}>
          <div
            className="h-1.5 w-14 rounded-full mb-2"
            style={{ background: cs.accent, opacity: 0.6 }}
          />
          {[68, 55].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full mb-1"
              style={{ width: `${w}%`, background: cs.primary, opacity: 0.1 }}
            />
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" className="shadow-md">
              Use template
            </Button>
          </div>
        </div>

        {/* Selected indicator */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-600/15 backdrop-blur-[1px]">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 12 12" className="w-4 h-4 text-white fill-current">
                <path d="M10 3L5 9 2 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)] font-serif">{template.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Templates page ───────────────────────────────────────────────────────────

const TemplatesPage: React.FC = () => {
  const [category, setCategory] = useState<TemplateCategory>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = RESUME_TEMPLATES.filter((t) => {
    const matchCat = category === 'all' || t.category === category;
    const q = search.toLowerCase();
    const matchSearch =
      q === '' ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2 border border-amber-500/20">
          <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
          <span>Curated Color Palettes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-2 font-serif tracking-tight">
          Resume Templates
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          {RESUME_TEMPLATES.length} professionally crafted templates engineered for ATS compatibility and vector ReportLab PDF export.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--text-muted)] font-medium">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
          <SlidersHorizontal size={13} />
          Sort: Recommended first
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] p-8">
          <p className="text-sm font-semibold mb-1 text-[var(--text-primary)]">No templates found</p>
          <p className="text-xs">Try a different search query or category filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* CTA when template selected */}
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