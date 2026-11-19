import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'unihub:theme';
const VALID_THEMES = ['light', 'dark', 'system'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      return VALID_THEMES.includes(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches);
      const activeTheme = isDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = activeTheme;
    };

    apply();
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Theme preference is optional. */
    }

    if (theme !== 'system') return undefined;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider');
  return context;
}
