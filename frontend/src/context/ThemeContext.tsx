import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'golden' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'golden',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('cloudresume_theme') as AppTheme;
      if (saved === 'golden' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'golden';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'golden', 'dark');
    root.classList.add(theme);

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('cloudresume_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'golden' ? 'dark' : 'golden'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
