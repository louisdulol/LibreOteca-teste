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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all shadow-xs active:scale-95 cursor-pointer"
      title={`Alternar para ${isLight ? 'Tema Escuro' : 'Tema Claro'}`}
      aria-label="Alternar tema claro/escuro"
    >
      {isLight ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {!compact && <span className="hidden sm:inline font-medium">Tema Claro</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {!compact && <span className="hidden sm:inline font-medium">Tema Escuro</span>}
        </>
      )}
    </button>
  );
};
