import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '@/types/food';

const STORAGE_KEY = 'diet-theme';

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode): void {
  const dark = mode === 'dark' || (mode === 'system' && getSystemDark());
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  return { theme, setTheme };
}
