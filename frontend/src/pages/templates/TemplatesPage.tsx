import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Zap,
  ChevronDown,
  Check,
  Eye,
  X,
  Layers,
  Filter,
} from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/mockData';
import { ResumeTemplatePreview } from '../../components/templates/ResumeTemplatePreview';
import type { TemplateCategory, ResumeTemplate } from '../../types';

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'all', label: 'All templates' },
  { value: 'academic', label: 'Academic' },
  { value: 'modern', label: 'Modern' },
  { value: 'professional', label: 'Professional' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
];

const SWATCH_COLORS = [
  { id: 'steel', name: 'Steel Cerulean', hex: '#0F6292' },
  { id: 'sapphire', name: 'Royal Sapphire', hex: '#2563EB' },
  { id: 'navy', name: 'Deep Navy', hex: '#1E3A5F' },
  { id: 'amber', name: 'Warm Amber', hex: '#D97706' },
  { id: 'emerald', name: 'Forest Emerald', hex: '#059669' },
  { id: 'iris', name: 'Purple Iris', hex: '#7C3AED' },
  { id: 'crimson', name: 'Ruby Crimson', hex: '#DC2626' },
  { id: 'slate', name: 'Charcoal Slate', hex: '#1E293B' },
];

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState(SWATCH_COLORS[0].hex);
  const [filterHeadshot, setFilterHeadshot] = useState<'all' | 'with' | 'no'>('all');
  const [filterGraphics, setFilterGraphics] = useState<'all' | 'minimal' | 'modern'>('all');
  const [filterColumns, setFilterColumns] = useState<'all' | '1' | '2'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'ats' | 'name'>('recommended');

  // Modal full-size preview state
  const [previewModalTemplate, setPreviewModalTemplate] = useState<ResumeTemplate | null>(null);
  const [modalColor, setModalColor] = useState<string>(SWATCH_COLORS[0].hex);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filtered & Sorted Templates
  const filteredTemplates = useMemo(() => {
    let result = [...RESUME_TEMPLATES];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Search query filter (by name, tags, description, or role)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t.roleCategory && t.roleCategory.toLowerCase().includes(q))
      );
    }

    // Headshot filter
    if (filterHeadshot === 'with') {
      result = result.filter((t) => t.headshot === true);
    } else if (filterHeadshot === 'no') {
      result = result.filter((t) => !t.headshot);
    }

    // Graphics filter
    if (filterGraphics !== 'all') {
      result = result.filter((t) => t.graphics === filterGraphics);
    }

    // Columns filter
    if (filterColumns === '1') {
      result = result.filter((t) => t.columns === 1);
    } else if (filterColumns === '2') {
      result = result.filter((t) => t.columns === 2);
    }

    // Sort
    if (sortBy === 'recommended') {
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    } else if (sortBy === 'ats') {
      result.sort((a, b) => (b.atsScore || 90) - (a.atsScore || 90));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    selectedCategory,
    searchQuery,
    filterHeadshot,
    filterGraphics,
    filterColumns,
    sortBy,
  ]);

  const handleUseTemplate = (template: ResumeTemplate, colorHex?: string) => {
    const activeHex = colorHex || selectedColor;
    navigate(`/editor/new?template=${template.id}&color=${encodeURIComponent(activeHex)}`);
  };

  const handleOpenPreview = (template: ResumeTemplate) => {
    setPreviewModalTemplate(template);
    setModalColor(selectedColor);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-250 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3 border border-amber-500/20">
            <Layers size={13} className="text-amber-600 dark:text-amber-400" />
            <span>28 Production-Grade Engineered Architectures</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight font-sans">
            Resume Templates
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] font-normal max-w-xl mx-auto">
            You can always change your template later. Hand-crafted for maximum ATS scoring, LaTeX engineering precision, and recruiter engagement.
          </p>
        </div>

        {/* ─── CONTROLS & FILTER BAR ───────────────────────────────────────── */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-4 sm:p-5 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Dropdowns Row: Headshot, Graphics, Columns, Sort */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1 uppercase tracking-wider">
                <Filter size={12} /> Filter by:
              </span>

              {/* Headshot Dropdown */}
              <div className="relative">
                <select
                  value={filterHeadshot}
                  onChange={(e) => setFilterHeadshot(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Headshot: All</option>
                  <option value="with">With Headshot</option>
                  <option value="no">No Headshot</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-3 pointer-events-none text-[var(--text-muted)]" />
              </div>

              {/* Graphics Dropdown */}
              <div className="relative">
                <select
                  value={filterGraphics}
                  onChange={(e) => setFilterGraphics(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Graphics: All</option>
                  <option value="minimal">Minimal / ATS</option>
                  <option value="modern">Modern / Visual</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-3 pointer-events-none text-[var(--text-muted)]" />
              </div>

              {/* Columns Dropdown */}
              <div className="relative">
                <select
                  value={filterColumns}
                  onChange={(e) => setFilterColumns(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">Columns: All</option>
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-3 pointer-events-none text-[var(--text-muted)]" />
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="ats">Sort: Highest ATS Score</option>
                  <option value="name">Sort: Alphabetical</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-3 pointer-events-none text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Live Palette Swatches */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-[var(--border-subtle)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Palette:
              </span>
              <div className="flex items-center gap-1.5">
                {SWATCH_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                      selectedColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-amber-600 scale-110 shadow-xs'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.hex && (
                      <Check size={10} className="text-white font-black stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Categories Row & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-[var(--border-subtle)]">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                      isActive
                        ? 'bg-[#18181B] dark:bg-amber-600 text-white shadow-xs'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3.5 top-3 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or tech stack..."
                className="w-full pl-9 pr-8 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Count Indicator */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} available
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive real-time previews</span>
          </div>
        </div>

        {/* ─── 4-COLUMN DESKTOP GRID (28 TEMPLATES) ─────────────────────────── */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = selectedId === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedId((prev) => (prev === template.id ? null : template.id))}
                  className={`group cursor-pointer bg-[var(--bg-surface)] border ${
                    isSelected
                      ? 'border-amber-600 ring-2 ring-amber-500/40 shadow-xl'
                      : 'border-[var(--border-subtle)] hover:border-amber-500/60 shadow-xs hover:shadow-xl'
                  } rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Full-Bleed A4 Paper Preview Viewport (Zero Oversized Grey Padding) */}
                  <div className="relative w-full aspect-[1/1.38] bg-[#F6F3ED] dark:bg-slate-900/60 p-2 sm:p-2.5 flex items-center justify-center overflow-hidden rounded-t-2xl">
                    <div className="w-full h-full bg-white rounded-lg shadow-md border border-[#E6DFD3] dark:border-slate-800 overflow-hidden relative group/sheet transition-transform duration-300">
                      <ResumeTemplatePreview
                        template={template}
                        accentColor={selectedColor}
                        scale="mini"
                      />

                      {/* Top-Right Circular Preview Magnifying Glass (Matches Reference Screenshot) */}
                      <button
                        type="button"
                        title="Preview template"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(template);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 dark:bg-slate-800/90 dark:text-slate-100 shadow-md flex items-center justify-center opacity-0 group-hover/sheet:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Centered Orange/Amber Pill Button (Matches Reference Screenshot) */}
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover/sheet:opacity-100 transition-all duration-200 flex items-center justify-center p-3 pointer-events-none group-hover/sheet:pointer-events-auto z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template, selectedColor);
                          }}
                          className="py-2 px-5 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 pointer-events-auto"
                        >
                          <span>Use Template</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compact Structured Card Metadata Footer Directly Below Preview */}
                  <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] space-y-1">
                    {/* Row 1: Template Name + Compact Status Badge */}
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate font-sans">
                        {template.name}
                      </h3>
                      {template.id === 'latex-classic' ? (
                        <span className="shrink-0 text-[8.5px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
                          LaTeX
                        </span>
                      ) : template.popular ? (
                        <span className="shrink-0 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center gap-0.5">
                          <Zap size={8} className="text-amber-600 dark:text-amber-400" />
                          <span>Popular</span>
                        </span>
                      ) : template.atsScore && template.atsScore >= 98 ? (
                        <span className="shrink-0 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                          ATS {template.atsScore}%
                        </span>
                      ) : template.columns === 2 ? (
                        <span className="shrink-0 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-800 dark:text-purple-300">
                          2-Col
                        </span>
                      ) : (
                        <span className="shrink-0 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          ATS {template.atsScore || 96}%
                        </span>
                      )}
                    </div>

                    {/* Row 2: One-line Role Description + 2 Category Tags */}
                    <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--text-muted)] pt-0.5">
                      <span className="truncate max-w-[130px] sm:max-w-[150px]">
                        {template.roleCategory || template.category}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {template.tags
                          .filter(
                            (tag) =>
                              tag.toLowerCase() !== template.name.toLowerCase() &&
                              !CATEGORIES.some(
                                (c) =>
                                  c.label.toLowerCase() === tag.toLowerCase() ||
                                  c.value.toLowerCase() === tag.toLowerCase()
                              )
                          )
                          .slice(0, 2)
                          .map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[8.5px] font-medium px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-20 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Layers size={22} />
            </div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">No templates found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
              Try adjusting your search query or reset your filters to view all 28 production architectures.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setFilterHeadshot('all');
                setFilterGraphics('all');
                setFilterColumns('all');
              }}
              className="px-5 py-2 text-xs font-bold bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>

      {/* ─── FULL SIZE A4 PREVIEW MODAL ─────────────────────────────────────── */}
      {previewModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-sans">
                    {previewModalTemplate.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                    ATS {previewModalTemplate.atsScore || 98}% Verified
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {previewModalTemplate.roleCategory} · {previewModalTemplate.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalTemplate(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: A4 Scrollable Preview + Right Customizer Sidebar */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 dark:bg-slate-900/60 flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
              
              {/* Scaled A4 Sheet Container */}
              <div className="w-full max-w-[500px] aspect-[1/1.414] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">
                <ResumeTemplatePreview
                  template={previewModalTemplate}
                  accentColor={modalColor}
                  scale="modal"
                />
              </div>

              {/* Sidebar Customizer */}
              <div className="w-full md:w-64 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Live Palette
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {SWATCH_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setModalColor(c.hex)}
                        title={c.name}
                        className={`h-8 rounded-xl transition-all flex items-center justify-center ${
                          modalColor === c.hex
                            ? 'ring-2 ring-offset-2 ring-amber-600 scale-105 shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {modalColor === c.hex && (
                          <Check size={14} className="text-white font-extrabold stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Category</span>
                    <span className="font-bold uppercase text-[10px]">{previewModalTemplate.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Layout Architecture</span>
                    <span className="font-bold">{previewModalTemplate.columns} Column</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">ATS Optimization</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {previewModalTemplate.atsScore || 98} / 100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Headshot Layout</span>
                    <span className="font-bold">{previewModalTemplate.headshot ? 'Yes' : 'No (Parser Pure)'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleUseTemplate(previewModalTemplate, modalColor);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-full shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  <span>Use This Template in Editor</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ─── Selected Template Bottom Floating Bar ─────────────────────────── */}
      {selectedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl rounded-full px-6 py-3.5 flex items-center gap-4 animate-fadeIn">
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {filteredTemplates.find((t) => t.id === selectedId)?.name || 'Template'} selected
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Ready to craft your resume?
            </p>
          </div>
          <Link to={`/editor/new?template=${selectedId}&color=${encodeURIComponent(selectedColor)}`}>
            <button className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 hover:scale-105 transition-all">
              <span>Use this template</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      )}

    </div>
  );
};

export default TemplatesPage;
