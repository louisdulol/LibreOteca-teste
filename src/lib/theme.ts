export type ThemeMode = 'dark' | 'light';

export interface ThemeOption {
  id: ThemeMode;
  nome: string;
  descricao: string;
}

export const TEMAS: ThemeOption[] = [
  {
    id: 'dark',
    nome: 'Tema Escuro',
    descricao: 'Fundo escuro profundo com alto contraste e acentos âmbar',
  },
  {
    id: 'light',
    nome: 'Tema Claro',
    descricao: 'Fundo claro e limpo para leitura diurna',
  },
];

const THEME_STORAGE_KEY = 'libreoteca_theme_mode';

export const ThemeService = {
  getTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {}
    return 'dark';
  },

  setTheme(mode: ThemeMode): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}

    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-mode', mode);
    if (mode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    window.dispatchEvent(new CustomEvent('libreoteca-theme-changed', { detail: mode }));
  },

  toggleTheme(): ThemeMode {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  initTheme(): ThemeMode {
    const current = this.getTheme();
    this.setTheme(current);
    return current;
  },
};
