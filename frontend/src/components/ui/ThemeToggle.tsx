import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        onClick={() => setTheme('golden')}
        title="Warm Golden Hour Theme"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === 'golden'
            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Sparkles size={12} className="text-amber-600" />
        <span className="hidden sm:inline">Golden</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Crisp Light Theme"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === 'light'
            ? 'bg-white text-blue-700 border border-blue-200 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Sun size={12} className="text-blue-600" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Midnight Dark Theme"
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 text-blue-400 border border-slate-700 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Moon size={12} className="text-blue-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
