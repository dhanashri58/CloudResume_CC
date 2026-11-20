import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shadow-2xs transition-colors ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        onClick={() => setTheme('golden')}
        title="Warm Golden Hour Theme"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === 'golden'
            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Sun size={12} className="text-amber-600" />
        <span>Golden</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Midnight Dark Theme"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-[#162032] text-blue-300 border border-blue-500/40 shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        <Moon size={12} className="text-blue-400" />
        <span>Dark</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
