import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeService, ThemeMode } from '../lib/theme';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    setTheme(ThemeService.initTheme());

    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };

    window.addEventListener('libreoteca-theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('libreoteca-theme-changed', handleThemeChange);
    };
  }, []);

  const handleToggle = () => {
    const next = ThemeService.toggleTheme();
    setTheme(next);
  };

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      id="btn-toggle-tema"
      onClick={handleToggle}
      className="p-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
      title={`Alternar para ${isLight ? 'Tema Escuro' : 'Tema Claro'}`}
      aria-label={`Alternar para ${isLight ? 'Tema Escuro' : 'Tema Claro'}`}
    >
      {isLight ? (
        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-amber-400 shrink-0" />
      )}
    </button>
  );
};
