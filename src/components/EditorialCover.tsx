import React, { useState } from 'react';
import { Book } from 'lucide-react';

interface EditorialCoverProps {
  titulo: string;
  autor: string;
  capaUrl?: string;
  categoria?: string;
  ano?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Paleta sofisticada para capas tipográficas editoriais sem imagem
const COLOR_THEMES = [
  { bg: 'from-amber-950 via-stone-900 to-stone-950', accent: 'text-amber-200/90', border: 'border-amber-700/40', tag: 'bg-amber-900/60 text-amber-200' },
  { bg: 'from-sky-950 via-slate-900 to-slate-950', accent: 'text-sky-200/90', border: 'border-sky-700/40', tag: 'bg-sky-900/60 text-sky-200' },
  { bg: 'from-emerald-950 via-stone-900 to-stone-950', accent: 'text-emerald-200/90', border: 'border-emerald-700/40', tag: 'bg-emerald-900/60 text-emerald-200' },
  { bg: 'from-rose-950 via-stone-900 to-stone-950', accent: 'text-rose-200/90', border: 'border-rose-700/40', tag: 'bg-rose-900/60 text-rose-200' },
  { bg: 'from-purple-950 via-zinc-900 to-zinc-950', accent: 'text-purple-200/90', border: 'border-purple-700/40', tag: 'bg-purple-900/60 text-purple-200' },
  { bg: 'from-stone-900 via-stone-950 to-black', accent: 'text-amber-100/90', border: 'border-stone-700/40', tag: 'bg-stone-800 text-amber-100' },
];

function getThemeByTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_THEMES.length;
  return COLOR_THEMES[index];
}

export const EditorialCover: React.FC<EditorialCoverProps> = ({
  titulo,
  autor,
  capaUrl,
  categoria,
  ano,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [capaUrl]);

  const theme = getThemeByTitle(titulo || 'Livro');

  const sizeClasses = {
    sm: 'h-24 w-16 text-[9px]',
    md: 'h-48 w-full text-xs',
    lg: 'h-64 w-44 text-sm',
    xl: 'h-80 w-56 text-base',
  };

  const hasValidImage = capaUrl && !imgError && capaUrl.trim() !== '';

  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden group/cover ${sizeClasses[size]} ${className}`}>
        <img
          src={capaUrl}
          alt={`Capa de ${titulo}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center shadow-xs transition-transform duration-300 group-hover/cover:scale-[1.02]"
        />
        {/* Efeito sutil de vinco de lombada */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Capa Tipográfica Editorial (quando sem imagem ou imagem falhou)
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${theme.bg} text-white p-3 sm:p-4 flex flex-col justify-between select-none shadow-xs border ${theme.border} ${sizeClasses[size]} ${className}`}
    >
      {/* Efeito de lombada à esquerda */}
      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-3 w-px bg-white/15 pointer-events-none" />

      {/* Topo da capa: Categoria / Ano */}
      <div className="relative z-10 pl-2">
        {categoria ? (
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase truncate max-w-full ${theme.tag}`}
          >
            {categoria}
          </span>
        ) : (
          <div className="flex items-center gap-1 opacity-70 text-[10px]">
            <Book className="w-3 h-3" />
            <span>LibreOteca</span>
          </div>
        )}
      </div>

      {/* Centro da capa: Título em destaque tipográfico */}
      <div className="relative z-10 pl-2 my-auto">
        <h3 className="font-serif font-bold leading-tight tracking-tight text-stone-100 line-clamp-3 drop-shadow-sm">
          {titulo || 'Sem Título'}
        </h3>
        <p className={`mt-1 font-medium tracking-wide ${theme.accent} line-clamp-1 text-[11px]`}>
          {autor || 'Autor Não Informado'}
        </p>
      </div>

      {/* Base da capa: Detalhe ornamental */}
      <div className="relative z-10 pl-2 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-stone-400">
        <span className="font-mono">{ano ? ano : 'Acervo'}</span>
        <span className="text-[9px] uppercase tracking-widest font-semibold text-stone-300">
          Edição
        </span>
      </div>

      {/* Textura sutil de fundo */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
    </div>
  );
};
