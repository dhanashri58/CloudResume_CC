import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Lock, ArrowRight } from 'lucide-react';
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
      className={`group relative rounded-xl border-2 overflow-hidden bg-white transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-blue-500 shadow-md shadow-blue-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(template.id)}
    >
      {/* Premium badge */}
      {template.premium && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
          <Lock size={10} />
          Pro
        </div>
      )}

      {/* Popular badge */}
      {template.popular && !template.premium && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
          <Star size={10} className="fill-blue-500" />
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" className="shadow-md">
              Use template
            </Button>
          </div>
        </div>

        {/* Selected indicator */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                <path d="M10 3L5 9 2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3.5 border-t border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded"
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Resume Templates
        </h1>
        <p className="text-slate-500 text-sm">
          {RESUME_TEMPLATES.length} professionally crafted templates. Free and
          Pro options available.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                category === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <SlidersHorizontal size={13} />
          Sort: Popular first
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm font-medium mb-1">No templates found</p>
          <p className="text-xs">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {RESUME_TEMPLATES.find((t) => t.id === selectedId)?.name} selected
            </p>
            <p className="text-xs text-slate-500">
              Ready to build your resume?
            </p>
          </div>
          <Link to={`/editor/new?template=${selectedId}`}>
            <Button size="md">
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

