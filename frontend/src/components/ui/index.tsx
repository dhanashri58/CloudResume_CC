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
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 focus:ring-[var(--accent-primary)] shadow-sm active:scale-[0.98]',
    secondary:
      'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] focus:ring-[var(--accent-primary)] shadow-2xs',
    ghost:
      'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:ring-[var(--accent-primary)]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
    outline:
      'border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus:ring-[var(--accent-primary)]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3 gap-2',
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
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-stone-100 text-stone-700 border-stone-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
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
      className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl shadow-sm transition-colors ${
        hover
          ? 'hover:shadow-md hover:border-[var(--accent-primary)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
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
          className="block text-xs font-bold text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] focus:bg-[var(--bg-surface)] ${
          error ? 'border-rose-400' : 'border-[var(--border-subtle)] hover:border-[var(--border-card)]'
        } ${className}`}
        {...rest}
      />
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
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
          className="block text-xs font-bold text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-xs border rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] focus:bg-[var(--bg-surface)] resize-none ${
          error ? 'border-rose-400' : 'border-[var(--border-subtle)] hover:border-[var(--border-card)]'
        } ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
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
      <h2 className="text-base font-bold text-[var(--text-primary)] font-serif">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── Divider ────────────────────────────────────────────────────────────────

export const Divider: React.FC<{ className?: string }> = ({
  className = '',
}) => <hr className={`border-[var(--border-subtle)] ${className}`} />;

// ─── Spinner ────────────────────────────────────────────────────────────────

export const Spinner: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    className={`animate-spin h-5 w-5 text-amber-700 ${className}`}
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
    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mb-4 border border-amber-200">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-[#1C1917] mb-1">{title}</h3>
    <p className="text-sm text-stone-500 max-w-xs mb-6">{description}</p>
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
      ? 'text-emerald-700'
      : score >= 70
      ? 'text-amber-700'
      : 'text-rose-600';

  const sizeClass = size === 'sm' ? 'text-sm font-extrabold' : 'text-xl font-extrabold';

  return (
    <span className={`${sizeClass} ${color} tabular-nums`}>{score}%</span>
  );
};

export { default as MeadowRiseFooter } from './meadow-rise-footer';
