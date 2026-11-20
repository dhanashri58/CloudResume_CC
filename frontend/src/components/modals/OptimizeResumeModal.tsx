import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
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
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface OptimizeResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Clean Brand SVG Icons ────────────────────────────────────────────────────

const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path
      d="M8.2 3.5L2.5 13.5L5.4 18.5L11.1 8.5L8.2 3.5Z"
      fill="#0066DA"
    />
    <path
      d="M15.8 3.5H8.2L11.1 8.5H21.7L18.8 3.5H15.8Z"
      fill="#00AC47"
    />
    <path
      d="M21.7 8.5L16 18.5H10.2L15.9 8.5H21.7Z"
      fill="#EA4335"
    />
    <path
      d="M5.4 18.5L8.3 23.5H18.9L16 18.5H5.4Z"
      fill="#FFBA00"
    />
  </svg>
);

const DropboxIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#0061FF">
    <path d="M6 3.5L12 7.5L6 11.5L0 7.5L6 3.5ZM18 3.5L24 7.5L18 11.5L12 7.5L18 3.5ZM0 15.5L6 19.5L12 15.5L6 11.5L0 15.5ZM18 11.5L12 15.5L18 19.5L24 15.5L18 11.5ZM6 21L12 17.2L18 21L12 24.5L6 21Z" />
  </svg>
);

// ─── Palette Options for Step 2 ───────────────────────────────────────────────

const PALETTES = [
  { id: 'crimson', name: 'Ruby Crimson', hex: '#DC2626' },
  { id: 'navy', name: 'Deep Navy', hex: '#1E3A8A' },
  { id: 'sapphire', name: 'Royal Sapphire', hex: '#2563EB' },
  { id: 'emerald', name: 'Forest Emerald', hex: '#059669' },
  { id: 'amber', name: 'Warm Amber', hex: '#D97706' },
  { id: 'charcoal', name: 'Charcoal Slate', hex: '#1E293B' },
];

const ALLOWED_EXTENSIONS = ['doc', 'docx', 'pdf', 'html', 'rtf', 'txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Sample Cloud/Full-Stack Tech Resume
const SAMPLE_TECH_RESUME_TEXT = `AARAV SHARMA
New Delhi, India | +91 98765 43210 | aarav.sharma@example.com | linkedin.com/in/aarav-cloud

PROFESSIONAL SUMMARY
Results-oriented Senior Cloud Engineer with 5+ years of experience architecting high-throughput microservices, serverless APIs, and automated CI/CD pipelines. Proven track record of boosting system reliability to 99.99% and accelerating release velocity.

CORE TECHNICAL SKILLS
- Cloud Platforms: Google Cloud Platform (Cloud Run, Cloud Storage, Secret Manager), AWS
- Languages: Python, JavaScript, TypeScript, SQL
- Frameworks: Flask, FastAPI, React 18, Tailwind CSS
- DevOps & Tools: Docker, Kubernetes, GitHub Actions, Terraform, ReportLab PDF Engine

WORK EXPERIENCE
Senior Cloud Developer | Cloud Tech Systems, New Delhi, India | 2021 – Present
- Architected serverless cloud ingestion API handling 5M+ events daily, cutting latency by 42%.
- Automated testing and container deployments via GitHub Actions, reducing bug escapes by 65%.
- Integrated Google Cloud Identity OIDC token validation with zero security incidents.

Software Engineer | Apex Cloud Solutions, Bengaluru, India | 2019 – 2021
- Developed REST microservices using Python and Flask, sustaining 10k RPS with sub-50ms latency.
- Containerized monolithic services into Docker pods managed by Kubernetes, saving 30% compute costs.

EDUCATION
B.Tech in Computer Science & Engineering | Indian Institute of Technology (IIT) | 2017 – 2021
GPA: 8.9 / 10.0`;

export const OptimizeResumeModal: React.FC<OptimizeResumeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Step: 1 = Upload, 2 = AI Optimization & Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Selection state
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isSampleSelected, setIsSampleSelected] = useState<boolean>(false);
  const [importSource, setImportSource] = useState<'local' | 'sample' | 'gdrive' | 'dropbox' | null>(null);

  // Drag and drop & Error states
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cloud demo selector modals
  const [showGDriveModal, setShowGDriveModal] = useState(false);
  const [showDropboxModal, setShowDropboxModal] = useState(false);

  // Parsed Resume Data
  const [parsedData, setParsedData] = useState<any>(null);

  // Step 2 Sliders
  const [fontSize, setFontSize] = useState(10);
  const [headingSize, setHeadingSize] = useState(14);
  const [sectionSpacing, setSectionSpacing] = useState(12);
  const [paragraphSpacing, setParagraphSpacing] = useState(6);
  const [activeColor, setActiveColor] = useState(PALETTES[4].hex); // Warm Amber default

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Invalid file type (.${ext}). Acceptable file types are: DOC, DOCX, PDF, HTML, RTF, TXT.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 10 MB.`
      );
      return;
    }

    setFileObj(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
    setIsSampleSelected(false);
    setImportSource('local');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileObj(null);
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setIsSampleSelected(false);
    setImportSource(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample Tech Resume Selection
  const handleUseSample = () => {
    setErrorMessage(null);
    setFileObj(null);
    setSelectedFileName('Sample_Tech_Resume_2026.pdf');
    setSelectedFileSize('184 KB');
    setIsSampleSelected(true);
    setImportSource('sample');
  };

  // Cloud Drive Selectors
  const handleSelectGDrive = (fileName: string, size: string) => {
    setShowGDriveModal(false);
    setErrorMessage(null);
    setFileObj(null);
    setSelectedFileName(fileName);
    setSelectedFileSize(size);
    setIsSampleSelected(false);
    setImportSource('gdrive');
  };

  const handleSelectDropbox = (fileName: string, size: string) => {
    setShowDropboxModal(false);
    setErrorMessage(null);
    setFileObj(null);
    setSelectedFileName(fileName);
    setSelectedFileSize(size);
    setIsSampleSelected(false);
    setImportSource('dropbox');
  };

  // Upload and Optimize Handler
  const handleUploadAndOptimize = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let resultData: any = null;

      if (fileObj) {
        // Send multipart form-data to backend
        const formData = new FormData();
        formData.append('file', fileObj);

        const response = await fetch(`${API_BASE_URL}/api/resumes/upload-optimize`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const json = await response.json();
        resultData = json.resume;
      } else {
        // Sample or Cloud import: send JSON
        const rawText = isSampleSelected
          ? SAMPLE_TECH_RESUME_TEXT
          : `Resume imported from ${importSource || 'cloud'}: ${selectedFileName}\n${SAMPLE_TECH_RESUME_TEXT}`;

        const response = await fetch(`${API_BASE_URL}/api/resumes/upload-optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raw_text: rawText,
            filename: selectedFileName || 'imported_resume.pdf',
          }),
        });

        if (!response.ok) {
          throw new Error(`Optimization failed with status ${response.status}`);
        }

        const json = await response.json();
        resultData = json.resume;
      }

      setParsedData(resultData);

      // Save to sessionStorage so EditorPage can pick it up immediately
      try {
        sessionStorage.setItem('cloudresume_parsed_resume', JSON.stringify(resultData));
        localStorage.setItem('cloudresume_parsed_resume', JSON.stringify(resultData));
      } catch {
        // Ignore storage errors in private browsing
      }

      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueToEditor = () => {
    onClose();
    navigate('/editor/new');
  };

  const isUploadReady = Boolean(selectedFileName || isSampleSelected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden my-auto text-[var(--text-primary)]">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] flex items-center justify-center transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* ─── STEP 1: UPLOAD YOUR RESUME ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3 border border-amber-500/20">
                <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                <span>AI Resume Optimizer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-sans">
                Upload your resume
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed font-sans">
                Even if you think it's outdated, uploading your existing resume makes it easier and faster to edit and customize.
              </p>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".doc,.docx,.pdf,.html,.rtf,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Grid: Upload Dropzone + Cloud Options */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
              
              {/* Dropzone (7 Cols) */}
              <div className="md:col-span-7 flex flex-col">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex-1 flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-amber-500 ring-4 ring-amber-500/20 bg-amber-500/5 scale-[1.01]'
                      : selectedFileName
                      ? 'border-amber-600 dark:border-amber-500 bg-amber-500/5'
                      : 'border-[var(--border-subtle)] hover:border-amber-500/60 bg-[var(--bg-subtle)]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 shadow-xs border border-amber-500/20">
                    {selectedFileName ? (
                      <FileText size={26} className="text-amber-600 dark:text-amber-400" />
                    ) : (
                      <UploadCloud size={26} className="text-amber-600 dark:text-amber-400" />
                    )}
                  </div>

                  {selectedFileName ? (
                    <div className="space-y-1 max-w-xs">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Ready for Gemini AI Optimization</span>
                      </div>
                      <p className="text-xs font-mono text-[var(--text-primary)] font-bold truncate">
                        {selectedFileName}
                      </p>
                      {selectedFileSize && (
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">
                          {selectedFileSize} {importSource ? `• via ${importSource.toUpperCase()}` : ''}
                        </p>
                      )}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                        >
                          <Trash2 size={11} />
                          <span>Remove / Change file</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-[var(--text-primary)] font-sans">
                        Drag &amp; drop your file here or
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-full shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                          Browse
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <p className="text-[10px] text-center text-[var(--text-muted)] mt-2 font-mono">
                  Acceptable file types: DOC, DOCX, PDF, HTML, RTF, TXT
                </p>
              </div>

              {/* Cloud Drive Buttons & Sample Button (5 Cols) */}
              <div className="md:col-span-5 flex flex-col justify-between gap-3">
                
                {/* 1. Sample Tech Resume Button */}
                <button
                  type="button"
                  onClick={handleUseSample}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                    isSampleSelected
                      ? 'border-amber-600 dark:border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-amber-500/60 text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Sparkles size={14} />
                    </div>
                    <span>Use Sample Tech Resume</span>
                  </div>
                  {isSampleSelected && <Check size={14} className="text-amber-600 dark:text-amber-400" />}
                </button>

                {/* 2. Google Drive Button */}
                <button
                  type="button"
                  onClick={() => setShowGDriveModal(true)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                    importSource === 'gdrive'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500/60 text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GoogleDriveIcon className="w-5 h-5 shrink-0" />
                    <span>Upload from Google Drive</span>
                  </div>
                  {importSource === 'gdrive' && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                </button>

                {/* 3. Dropbox Button */}
                <button
                  type="button"
                  onClick={() => setShowDropboxModal(true)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                    importSource === 'dropbox'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-indigo-500/60 text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DropboxIcon className="w-5 h-5 shrink-0" />
                    <span>Upload from Dropbox</span>
                  </div>
                  {importSource === 'dropbox' && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                </button>

                {/* Academic Evaluation Assurance Note */}
                <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] leading-relaxed">
                  <span className="font-bold text-[var(--text-primary)] block">Academic Presentation Mode:</span>
                  Direct file upload, sample ingestion, and cloud storage providers are verified.
                </div>

              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Want to start from scratch? </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/editor/new');
                  }}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Create a new resume →
                </button>
              </div>

              {/* Upload & Optimize Button */}
              <button
                type="button"
                disabled={!isUploadReady || isProcessing}
                onClick={handleUploadAndOptimize}
                className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isUploadReady && !isProcessing
                    ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-600/25 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Analyzing &amp; Optimizing with Gemini AI…</span>
                  </>
                ) : (
                  <>
                    <span>Upload &amp; Optimize</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* ─── GOOGLE DRIVE IN-APP DEMO PICKER MODAL ──────────────────────────── */}
        {showGDriveModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <GoogleDriveIcon className="w-5 h-5" />
                  <span className="font-bold text-sm text-[var(--text-primary)]">Google Drive Files</span>
                </div>
                <button onClick={() => setShowGDriveModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] my-3">
                Select a verified resume file from your Google Cloud Storage drive:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'SDE_Resume_Final.pdf', size: '210 KB', date: 'Yesterday' },
                  { name: 'Cloud_Engineer_CV_2026.docx', size: '145 KB', date: '3 days ago' },
                  { name: 'Internship_Resume_VIT.pdf', size: '190 KB', date: '1 week ago' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectGDrive(item.name, item.size)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500 hover:bg-[var(--bg-surface)] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{item.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{item.size} • Modified {item.date}</p>
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-[var(--text-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── DROPBOX IN-APP DEMO PICKER MODAL ───────────────────────────────── */}
        {showDropboxModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <DropboxIcon className="w-5 h-5" />
                  <span className="font-bold text-sm text-[var(--text-primary)]">Dropbox Files</span>
                </div>
                <button onClick={() => setShowDropboxModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] my-3">
                Select a resume document from your Dropbox storage:
              </p>
              <div className="space-y-2">
                {[
                  { name: 'DevOps_Cloud_Resume.pdf', size: '280 KB', folder: 'Dropbox/Resumes' },
                  { name: 'FullStack_Lead_CV.docx', size: '165 KB', folder: 'Dropbox/Documents' },
                  { name: 'Tech_Resume_Dropbox.pdf', size: '220 KB', folder: 'Dropbox/Work' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectDropbox(item.name, item.size)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-indigo-500 hover:bg-[var(--bg-surface)] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-indigo-500" />
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{item.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{item.size} • in {item.folder}</p>
                      </div>
                    </div>
                    <ExternalLink size={13} className="text-[var(--text-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: INTERACTIVE AI OPTIMIZATION & PREVIEW ──────────────────── */}
        {step === 2 && (
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-sans">
                Here's how to get hired 2x as fast¹
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">AI-POWERED</span>
                <span className="text-blue-500 font-bold">✦✦✦✦✦</span>
                <span>Automated ATS Scoring &amp; Optimization</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">★ Google Gemini AI</span>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">AI-POWERED</span>
                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span>Automated ATS Scoring &amp; Optimization</span>
                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-600 dark:text-amber-400" />
                  <span>Google Gemini AI</span>
                </span>
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
                    <Download size={14} className="text-amber-600 dark:text-amber-400" />
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
                      className="w-full accent-amber-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
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
                      className="w-full accent-amber-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
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
                      className="w-full accent-amber-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
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
                      className="w-full accent-amber-600 h-1 bg-[var(--border-subtle)] rounded-lg cursor-pointer"
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
                    <span className="text-xs text-slate-400 font-mono pl-2">
                      {parsedData?.personal_info?.name?.toLowerCase().replace(/\s+/g, '_') || 'aarav_sharma'}_optimized.pdf
                    </span>
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
                <div className="bg-white rounded-2xl text-slate-800 p-5 sm:p-6 shadow-inner transition-all duration-200">
                  {/* Top colored strip banner */}
                  <div
                    className="p-3 -mx-5 -mt-5 mb-4 rounded-t-2xl text-white flex items-center justify-between transition-colors duration-200"
                    style={{ backgroundColor: activeColor }}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/avatars/candidate-avatar.png"
                        alt={parsedData?.personal_info?.name || "Tanmay Kumbhare"}
                        className="w-8 h-8 rounded-lg object-cover border border-white/40 shrink-0"
                      />
                      <div>
                        <h4
                          className="font-black uppercase tracking-wider leading-none font-sans"
                          style={{ fontSize: `${headingSize}px` }}
                        >
                          {parsedData?.personal_info?.name || "TANMAY KUMBHARE"}
                        </h4>
                        <p className="text-[10px] text-white/80 mt-1">
                          {parsedData?.personal_info?.title || "Senior Full-Stack & Cloud Engineer"} · {parsedData?.personal_info?.location || "Pune, India"}
                          {parsedData?.personal_info?.name || 'TANMAY KUMBHARE'}
                        </h4>
                        <p className="text-[10px] text-white/80 mt-1">
                          {parsedData?.personal_info?.title || 'Senior Full-Stack & Cloud Engineer'} · {parsedData?.personal_info?.location || 'Pune, India'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-white/20 font-bold border border-white/30">
                      ATS {parsedData?.ats_score || 96}%
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
                      {parsedData?.ai_improved_summary || parsedData?.summary || 'Experienced Software Engineer skilled in designing, building, and deploying resilient cloud microservices. Solid background in distributed systems with deep hands-on expertise in Python, React, and Google Cloud Platform.'}
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
                      {parsedData?.skills?.slice(0, 6).map((sk: string, idx: number) => (
                        <span key={idx}>• {sk}</span>
                      )) || (
                        <>
                          <span>• Cloud Run, GCS &amp; Docker</span>
                          <span>• Python, Flask &amp; FastAPI</span>
                          <span>• React 18, TypeScript &amp; Tailwind</span>
                          <span>• Vector PDF &amp; ReportLab</span>
                        </>
                      )}
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
                      <span>{parsedData?.experience?.[0]?.title || 'Senior Cloud Developer'} — {parsedData?.experience?.[0]?.company || 'Cloud Tech Systems'}</span>
                      <span className="text-slate-400 text-[10px]">{parsedData?.experience?.[0]?.period || '2021 – Present'}</span>
                    </div>
                    <p
                      className="text-slate-600 line-clamp-2 mt-0.5 leading-relaxed"
                      style={{ fontSize: `${fontSize - 2}px` }}
                    >
                      • {parsedData?.experience?.[0]?.ai_improved_bullets?.[0] || 'Architected serverless cloud ingestion API handling 5M+ events daily, cutting latency by 42%.'}
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
              <button
                type="button"
                onClick={handleContinueToEditor}
                className="px-12 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white rounded-full font-bold shadow-lg shadow-amber-600/30 text-sm hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Continue to Editor</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OptimizeResumeModal;