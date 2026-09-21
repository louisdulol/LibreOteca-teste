export type ThemePaletteId =
  // Temas Escuros
  | 'dark-default'
  | 'dark-blue'
  | 'dark-green'
  | 'dark-purple'
  | 'dark-sepia'
  // Temas Claros
  | 'light-default'
  | 'light-blue'
  | 'light-green'
  | 'light-sepia'
  // Compatibilidade
  | 'obsidian'
  | 'midnight'
  | 'forest'
  | 'sepia'
  | 'amethyst'
  | 'titanium';

export interface ThemePalette {
  id: ThemePaletteId;
  modo: 'escuro' | 'claro';
  nome: string;
  corBase: string;
  corCard: string;
  corAcento: string;
}

export const PALETAS_ESCURAS: ThemePalette[] = [
  {
    id: 'dark-default',
    modo: 'escuro',
    nome: 'Escuro Padrão',
    corBase: '#0b0e14',
    corCard: '#131926',
    corAcento: '#f59e0b',
  },
  {
    id: 'dark-blue',
    modo: 'escuro',
    nome: 'Azul Escuro',
    corBase: '#060b17',
    corCard: '#0d162a',
    corAcento: '#38bdf8',
  },
  {
    id: 'dark-green',
    modo: 'escuro',
    nome: 'Verde Escuro',
    corBase: '#06120e',
    corCard: '#0b2018',
    corAcento: '#10b981',
  },
  {
    id: 'dark-purple',
    modo: 'escuro',
    nome: 'Roxo Escuro',
    corBase: '#0e0918',
    corCard: '#181128',
    corAcento: '#a855f7',
  },
  {
    id: 'dark-sepia',
    modo: 'escuro',
    nome: 'Sépia Escuro',
    corBase: '#14100d',
    corCard: '#201915',
    corAcento: '#ea580c',
  },
];

export const PALETAS_CLARAS: ThemePalette[] = [
  {
    id: 'light-default',
    modo: 'claro',
    nome: 'Claro Padrão',
    corBase: '#f8fafc',
    corCard: '#ffffff',
    corAcento: '#d97706',
  },
  {
    id: 'light-blue',
    modo: 'claro',
    nome: 'Azul Claro',
    corBase: '#f0f7ff',
    corCard: '#ffffff',
    corAcento: '#0284c7',
  },
  {
    id: 'light-green',
    modo: 'claro',
    nome: 'Verde Claro',
    corBase: '#f0fdf4',
    corCard: '#ffffff',
    corAcento: '#059669',
  },
  {
    id: 'light-sepia',
    modo: 'claro',
    nome: 'Sépia Claro',
    corBase: '#fbf7ee',
    corCard: '#ffffff',
    corAcento: '#c2410c',
  },
];

export const TODAS_PALETAS: ThemePalette[] = [
  ...PALETAS_ESCURAS,
  ...PALETAS_CLARAS,
];

// Alias para retrocompatibilidade
export const PALETAS_DISPONIVEIS = TODAS_PALETAS;

const THEME_STORAGE_KEY = 'libreoteca_active_theme';

export const ThemeService = {
  getTheme(): ThemePaletteId {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePaletteId | null;
      if (saved) {
        if (saved === 'obsidian' || saved === 'titanium') return 'dark-default';
        if (saved === 'midnight') return 'dark-blue';
        if (saved === 'forest') return 'dark-green';
        if (saved === 'amethyst') return 'dark-purple';
        if (saved === 'sepia') return 'dark-sepia';
        if (TODAS_PALETAS.some(p => p.id === saved)) {
          return saved;
        }
      }
    } catch {
      // Fallback
    }
    return 'dark-default';
  },

  setTheme(themeId: ThemePaletteId): void {
    const canonicalId: ThemePaletteId =
      themeId === 'obsidian' || themeId === 'titanium'
        ? 'dark-default'
        : themeId === 'midnight'
        ? 'dark-blue'
        : themeId === 'forest'
        ? 'dark-green'
        : themeId === 'amethyst'
        ? 'dark-purple'
        : themeId === 'sepia'
        ? 'dark-sepia'
        : themeId;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, canonicalId);
    } catch {}

    const isLight = canonicalId.startsWith('light-');
    document.documentElement.setAttribute('data-theme', canonicalId);
    document.documentElement.setAttribute('data-mode', isLight ? 'light' : 'dark');
    window.dispatchEvent(new CustomEvent('libreoteca-theme-changed', { detail: canonicalId }));
  },

  initTheme(): ThemePaletteId {
    const current = this.getTheme();
    this.setTheme(current);
    return current;
  },
};
