import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  Download,
  Printer,
  Mail,
  ArrowRight,
  HardDrive,
  Cloud,
  Check,
} from 'lucide-react';
import { Button } from '../ui';

interface OptimizeResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PALETTES = [
  { id: 'crimson', name: 'Ruby Crimson', hex: '#DC2626' },
  { id: 'navy', name: 'Deep Navy', hex: '#1E3A8A' },
  { id: 'sapphire', name: 'Royal Sapphire', hex: '#2563EB' },
  { id: 'emerald', name: 'Forest Emerald', hex: '#059669' },
  { id: 'amber', name: 'Warm Amber', hex: '#EA580C' },
  { id: 'charcoal', name: 'Charcoal Slate', hex: '#1E293B' },
];

export const OptimizeResumeModal: React.FC<OptimizeResumeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  // Step 1: Upload, Step 2: AI Optimization & Preview
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Editor Sliders State for Step 2
  const [fontSize, setFontSize] = useState(10);
  const [headingSize, setHeadingSize] = useState(14);
  const [sectionSpacing, setSectionSpacing] = useState(12);
  const [paragraphSpacing, setParagraphSpacing] = useState(6);
  const [activeColor, setActiveColor] = useState(PALETTES[0].hex);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  const handleUseSample = () => {
    setSelectedFile('aarav_sharma_cloud_engineer_resume.pdf');
  };

  const handleProceedToStep2 = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 800);
  };

  const handleContinueToEditor = () => {
    onClose();
    navigate('/editor/new');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden my-auto text-[var(--text-primary)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* ─── STEP 1: UPLOAD YOUR RESUME (Matches media_1795180072474_eab8c8cb.png) ─── */}
        {step === 1 && (
          <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 border border-blue-500/20">
                <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
                <span>AI Resume Optimizer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-sans">
                Upload your resume
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                Even if you think it's outdated, uploading your existing resume makes it easier and faster to edit and customize with Google Gemini AI.
              </p>
            </div>

            {/* Grid: Upload Dropzone + Cloud Options */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
              {/* Dropzone (7 Cols) */}
              <div className="md:col-span-7">
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--bg-subtle)]'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      {selectedFile ? (
                        <CheckCircle2 size={26} className="text-emerald-500" />
                      ) : (
                        <UploadCloud size={26} />
                      )}
                    </div>

                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          File selected successfully
                        </p>
                        <p className="text-xs text-[var(--text-primary)] font-mono truncate max-w-xs mx-auto">
                          {selectedFile}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] underline pt-1">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          Drag &amp; drop your file here or
                        </p>
                        <div className="mt-3">
                          <span className="inline-block px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-sm hover:bg-amber-400 transition-colors">
                            Browse
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </label>
                <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
                  Acceptable file types: DOC, DOCX, PDF, HTML, RTF, TXT
                </p>
              </div>

              {/* Cloud Drive Buttons & Sample (5 Cols) */}
              <div className="md:col-span-5 space-y-3">
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-[var(--accent-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors shadow-2xs"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>⚡ Use Sample Tech Resume</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseSample}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500 text-xs font-bold text-[var(--text-primary)] transition-colors"
                >
                  <Cloud size={14} className="text-blue-500" />
                  <span>Upload from Google Drive</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseSample}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-indigo-500 text-xs font-bold text-[var(--text-primary)] transition-colors"
                >
                  <HardDrive size={14} className="text-indigo-500" />
                  <span>Upload from Dropbox</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Want to start from scratch? </span>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/editor/new');
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a new resume →
                </button>
              </div>

              <Button
                disabled={!selectedFile || isProcessing}
                onClick={handleProceedToStep2}
                className="w-full sm:w-auto px-8 rounded-full font-bold"
              >
                {isProcessing ? 'Analyzing with Gemini AI…' : 'Upload & Optimize'}
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: INTERACTIVE AI OPTIMIZATION (Matches media_1795179999257_f8128493.jpg) ─── */}
        {step === 2 && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-sans">
                Here's how to get hired 2x as fast¹
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">EXCELLENT</span>
                <span className="text-emerald-500 font-bold">★★★★★</span>
                <span>4.5 out of 5 based on 19,914 reviews</span>
                <span className="font-semibold text-emerald-600">★ Trustpilot</span>
              </div>
            </div>

            {/* Workspace: Left Steps + Center Editor Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (4 cols): Steps & Perks */}
              <div className="lg:col-span-4 space-y-3">
                {/* Step Pill 1 */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Upload &amp; pick a template</p>
                    <div className="w-24 h-1.5 bg-emerald-500 rounded-full mt-1" />
                  </div>
                </div>

                {/* Step Pill 2 */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Add content with AI</p>
                    <div className="w-24 h-1.5 bg-amber-500 rounded-full mt-1" />
                  </div>
                </div>

                {/* Step Pill 3 */}
                <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                    <Download size={14} className="text-blue-500" />
                    <span>Download &amp; send</span>
                  </div>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500" />
                      <span>Popular file formats (PDF, DOCX)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500" />
                      <span>Instant digital profile</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500" />
                      <span>Unlimited versions</span>
                    </li>
                  </ul>
                </div>

                {/* Sliders Control Card */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3">
                  <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sliders size={13} />
                    <span>Live Typography &amp; Spacing</span>
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                      <span>Font Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={14}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                      <span>Heading Size</span>
                      <span>{headingSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={headingSize}
                      onChange={(e) => setHeadingSize(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                      <span>Section Spacing</span>
                      <span>{sectionSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={20}
                      value={sectionSpacing}
                      onChange={(e) => setSectionSpacing(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-semibold">
                      <span>Paragraph Spacing</span>
                      <span>{paragraphSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={12}
                      value={paragraphSpacing}
                      onChange={(e) => setParagraphSpacing(Number(e.target.value))}
                      className="w-full accent-blue-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (8 cols): Editor Canvas & Tools */}
              <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-4 sm:p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                {/* Editor Header Bar with Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-400 font-mono pl-2">aarav_optimized.pdf</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-full transition-colors">
                      <Download size={11} />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-full transition-colors">
                      <Printer size={11} />
                      <span>Print</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-full transition-colors">
                      <Mail size={11} />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Resume White Canvas inside Editor Frame */}
                <div className="bg-white rounded-xl text-slate-800 p-5 sm:p-6 shadow-inner transition-all duration-200">
                  {/* Top colored strip banner */}
                  <div
                    className="p-3 -mx-5 -mt-5 mb-4 rounded-t-xl text-white flex items-center justify-between transition-colors duration-200"
                    style={{ backgroundColor: activeColor }}
                  >
                    <div>
                      <h4
                        className="font-black uppercase tracking-wider leading-none"
                        style={{ fontSize: `${headingSize}px` }}
                      >
                        AARAV SHARMA
                      </h4>
                      <p className="text-[10px] text-white/80 mt-1">
                        Senior Full-Stack &amp; Cloud Engineer · New Delhi, India
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 font-bold">
                      ATS 98%
                    </span>
                  </div>

                  {/* Summary */}
                  <div style={{ marginBottom: `${sectionSpacing}px` }}>
                    <p
                      className="font-extrabold uppercase tracking-wider mb-1"
                      style={{ color: activeColor, fontSize: `${fontSize}px` }}
                    >
                      PROFESSIONAL SUMMARY
                    </p>
                    <p
                      className="text-slate-600 leading-relaxed"
                      style={{ fontSize: `${fontSize - 1.5}px` }}
                    >
                      Experienced Software Engineer skilled in designing, building, and deploying resilient cloud microservices. Solid background in distributed systems with deep hands-on expertise in Python, React, and Google Cloud Platform.
                    </p>
                  </div>

                  {/* Skills */}
                  <div style={{ marginBottom: `${sectionSpacing}px` }}>
                    <p
                      className="font-extrabold uppercase tracking-wider mb-1"
                      style={{ color: activeColor, fontSize: `${fontSize}px` }}
                    >
                      CORE TECHNICAL SKILLS
                    </p>
                    <div
                      className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-700"
                      style={{ fontSize: `${fontSize - 2}px` }}
                    >
                      <span>• Cloud Run, GCS &amp; Docker</span>
                      <span>• Python, Flask &amp; FastAPI</span>
                      <span>• React 18, TypeScript &amp; Tailwind</span>
                      <span>• Vector PDF &amp; ReportLab</span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div style={{ marginBottom: `${paragraphSpacing}px` }}>
                    <p
                      className="font-extrabold uppercase tracking-wider mb-1"
                      style={{ color: activeColor, fontSize: `${fontSize}px` }}
                    >
                      WORK EXPERIENCE
                    </p>
                    <div className="flex items-center justify-between text-slate-900 font-bold text-[11px]">
                      <span>Senior Cloud Developer — Tech Systems</span>
                      <span className="text-slate-400 text-[10px]">2021 – Present</span>
                    </div>
                    <p
                      className="text-slate-600 line-clamp-2 mt-0.5 leading-relaxed"
                      style={{ fontSize: `${fontSize - 2}px` }}
                    >
                      • Architected serverless cloud ingestion API handling 5M+ events daily, cutting latency by 42%.
                    </p>
                  </div>
                </div>

                {/* Palette Switcher Bar inside Editor */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Accent Color:</span>
                  <div className="flex items-center gap-1.5">
                    {PALETTES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveColor(p.hex)}
                        title={p.name}
                        className={`w-5 h-5 rounded-full transition-all ${
                          activeColor === p.hex
                            ? 'ring-2 ring-white scale-125'
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Final CTA */}
            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={handleContinueToEditor}
                className="rounded-full px-12 font-bold shadow-lg shadow-blue-600/30 text-sm"
              >
                Continue to Editor
                <ArrowRight size={15} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default OptimizeResumeModal;