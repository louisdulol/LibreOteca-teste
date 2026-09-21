import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Check, ChevronDown } from 'lucide-react';
import {
  ThemeService,
  PALETAS_ESCURAS,
  PALETAS_CLARAS,
  TODAS_PALETAS,
  ThemePaletteId,
  ThemePalette,
} from '../lib/theme';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const [activeTheme, setActiveTheme] = useState<ThemePaletteId>('dark-default');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTheme(ThemeService.initTheme());

    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setActiveTheme(e.detail);
      }
    };

    window.addEventListener('libreoteca-theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('libreoteca-theme-changed', handleThemeChange);
    };
  }, []);

  // Fechar dropdown ao clicar fora ou ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: ThemePaletteId) => {
    ThemeService.setTheme(id);
    setActiveTheme(id);
    setIsOpen(false);
  };

  const paletaAtiva = TODAS_PALETAS.find(p => p.id === activeTheme) || TODAS_PALETAS[0];
  const isLight = paletaAtiva.modo === 'claro';

  const renderPaletteButton = (paleta: ThemePalette) => {
    const isSelected = paleta.id === activeTheme;
    return (
      <button
        key={paleta.id}
        type="button"
        id={`btn-tema-${paleta.id}`}
        onClick={() => handleSelect(paleta.id)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
          isSelected
            ? 'bg-slate-800 text-white font-bold ring-1 ring-amber-500/50'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Amostra Visual */}
          <div
            className="w-5 h-5 rounded-full border border-slate-600 shadow-xs relative overflow-hidden shrink-0"
            style={{ backgroundColor: paleta.corBase }}
          >
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-tl-sm"
              style={{ backgroundColor: paleta.corAcento }}
            />
          </div>
          <span className="text-xs">{paleta.nome}</span>
        </div>

        {isSelected && (
          <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3] shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Botão no Navbar */}
      <button
        type="button"
        id="btn-seletor-tema-navbar"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-colors shadow-xs active:scale-95"
        title="Alterar tema (Claro / Escuro)"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          {isLight ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-amber-400" />
          )}

          {!compact && (
            <span className="hidden sm:inline font-medium text-xs">
              {paletaAtiva.nome}
            </span>
          )}
        </div>

        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          id="menu-temas"
          className="absolute right-0 mt-2 w-64 bg-[#131926] border border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Seção Temas Escuros */}
          <div className="mb-2">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3 h-3 text-slate-400" />
              <span>Temas Escuros</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {PALETAS_ESCURAS.map(renderPaletteButton)}
            </div>
          </div>

          <div className="h-px bg-slate-800 my-2" />

          {/* Seção Temas Claros */}
          <div>
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Temas Claros</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {PALETAS_CLARAS.map(renderPaletteButton)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
