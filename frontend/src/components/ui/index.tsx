import React from 'react';

// ─── Button ────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 focus:ring-indigo-500 shadow-md shadow-indigo-500/20',
    secondary:
      'bg-white/[0.08] text-slate-100 hover:bg-white/[0.14] border border-white/[0.1] focus:ring-slate-400',
    ghost:
      'text-slate-400 hover:bg-white/[0.06] hover:text-white focus:ring-slate-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    outline:
      'border border-white/[0.15] text-slate-200 hover:bg-white/[0.06] hover:text-white focus:ring-indigo-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = '',
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  return (
    <div
      className={`bg-[#11192e]/80 border border-white/[0.08] text-slate-100 rounded-xl shadow-xl shadow-black/20 backdrop-blur-sm ${
        hover
          ? 'hover:shadow-2xl hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
          : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-[#0a0f1d]/90 text-slate-100 placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 ${
          error ? 'border-red-400' : 'border-white/[0.12] hover:border-white/[0.2]'
        } ${className}`}
        {...rest}
      />
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

// ─── Textarea ───────────────────────────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...rest
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-[#0a0f1d]/90 text-slate-100 placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 resize-none ${
          error ? 'border-red-400' : 'border-white/[0.12] hover:border-white/[0.2]'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

// ─── Section header ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Divider ────────────────────────────────────────────────────────────────

export const Divider: React.FC<{ className?: string }> = ({
  className = '',
}) => <hr className={`border-white/[0.08] ${className}`} />;

// ─── Spinner ────────────────────────────────────────────────────────────────

export const Spinner: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    className={`animate-spin h-5 w-5 text-blue-600 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ─── Empty state ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-4">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// ─── ATS score ring ──────────────────────────────────────────────────────────

interface AtsScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

export const AtsScore: React.FC<AtsScoreProps> = ({ score, size = 'md' }) => {
  const color =
    score >= 85
      ? 'text-emerald-600'
      : score >= 70
      ? 'text-amber-600'
      : 'text-red-500';

  const sizeClass = size === 'sm' ? 'text-sm font-bold' : 'text-xl font-bold';

  return (
    <span className={`${sizeClass} ${color} tabular-nums`}>{score}%</span>
  );
};

export { default as MeadowRiseFooter } from './meadow-rise-footer';

