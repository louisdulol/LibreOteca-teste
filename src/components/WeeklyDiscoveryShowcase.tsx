import React from 'react';
import { Livro } from '../types';
import { StorageService, sanitizarAutor } from '../lib/storage';
import { InteractiveOpeningBook } from './InteractiveOpeningBook';
import {
  Sparkles,
  Star,
  BookOpen,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Award,
  Layers,
} from 'lucide-react';

interface WeeklyDiscoveryShowcaseProps {
  livroDestaque: Livro;
  onVerDetalhes: (livro: Livro) => void;
  onEmprestar: (livro: Livro) => void;
  isProfessor?: boolean;
}

export const WeeklyDiscoveryShowcase: React.FC<WeeklyDiscoveryShowcaseProps> = ({
  livroDestaque,
  onVerDetalhes,
  onEmprestar,
  isProfessor = false,
}) => {
  const disponivel = livroDestaque.disponiveis > 0;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#131926] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl text-slate-900 dark:text-white transition-colors w-full max-w-full">
      {/* Luz ambiente sutil decorativa de fundo */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center w-full max-w-full min-w-0">
        {/* COLUNA ESQUERDA: Texto Editorial e Destaque da Semana */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left min-w-0 w-full">
          {/* Badge de Curadoria */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span className="tracking-wide uppercase text-[10px] sm:text-[11px]">Descoberta da Semana • Curadoria</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              {livroDestaque.titulo}
            </h1>
            <p className="text-xs sm:text-base text-amber-600 dark:text-amber-400 font-medium mt-1.5 sm:mt-2 flex items-center gap-2">
              <span>por</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sanitizarAutor(livroDestaque.autor)}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{livroDestaque.ano_publicacao || 'Edição Especial'}</span>
            </p>
          </div>

          {/* Avaliação e Estatística */}
          {(() => {
            const { media, total } = StorageService.getMediaNotaLivro(livroDestaque.id);
            return (
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          total > 0 && i <= Math.round(media)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-600 fill-slate-200 dark:fill-slate-700/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-1">
                    {total > 0 ? media.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    • {total > 0 ? `${total} resenha(s) verificada(s)` : 'Sem avaliações'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>{livroDestaque.total_exemplares} exemplares no acervo</span>
                </div>
              </div>
            );
          })()}

          {/* Sinopse / Citação Editorial */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-serif line-clamp-4 max-w-xl">
            {livroDestaque.sinopse ||
              `Uma leitura fundamental selecionada pela equipe da biblioteca. Obra com narrativa envolvente, excelente receptividade entre leitores e rica em conexões pedagógicas e culturais.`}
          </p>

          {/* Pílulas de Metadados */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {livroDestaque.categoria}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-700">
              Prateleira: {livroDestaque.codigo_interno}
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                disponivel
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/50'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600/50'
              }`}
            >
              {disponivel ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{livroDestaque.disponiveis} disponíveis</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                  <span>Esgotado</span>
                </>
              )}
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              id="btn-destaque-ver-detalhes"
              onClick={() => onVerDetalhes(livroDestaque)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Ficha Completa & Resenhas</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {isProfessor && disponivel && (
              <button
                id="btn-destaque-emprestar"
                onClick={() => onEmprestar(livroDestaque)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-slate-700 hover:border-amber-500/40 transition-colors shadow-xs cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Registrar Empréstimo</span>
              </button>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Livro Interativo com Folheamento Realista */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <InteractiveOpeningBook
            livro={livroDestaque}
            onVerDetalhes={onVerDetalhes}
            onEmprestar={onEmprestar}
            isProfessor={isProfessor}
          />
        </div>
      </div>
    </section>
  );
};
