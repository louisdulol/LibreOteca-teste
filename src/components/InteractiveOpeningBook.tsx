import React, { useState } from 'react';
import { Livro } from '../types';
import { StorageService, sanitizarAutor } from '../lib/storage';
import { EditorialCover } from './EditorialCover';
import {
  BookOpen,
  Star,
  Sparkles,
  ChevronRight,
  BookMarked,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Quote,
  Eye,
  X,
} from 'lucide-react';

interface InteractiveOpeningBookProps {
  livro: Livro;
  onVerDetalhes: (livro: Livro) => void;
  onEmprestar?: (livro: Livro) => void;
  isProfessor?: boolean;
}

export const InteractiveOpeningBook: React.FC<InteractiveOpeningBookProps> = ({
  livro,
  onVerDetalhes,
  onEmprestar,
  isProfessor = false,
}) => {
  const [isAberto, setIsAberto] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState<'sinopse' | 'ficha'>('sinopse');

  const disponivel = livro.disponiveis > 0;
  const autorLimpo = sanitizarAutor(livro.autor);

  return (
    <div className="w-full flex flex-col items-center justify-center select-none py-2">
      {!isAberto ? (
        /* ESTADO: LIVRO FECHADO / STANDING 3D */
        <div className="flex flex-col items-center group cursor-pointer" onClick={() => setIsAberto(true)}>
          <div className="relative transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:scale-[1.02]">
            {/* Sombra de Contato Suave */}
            <div className="absolute -bottom-4 inset-x-4 h-6 bg-black/80 blur-lg rounded-full group-hover:bg-black/95 group-hover:blur-xl transition-all" />

            {/* Volume do Livro Fechado */}
            <div className="relative w-48 sm:w-64 md:w-72 h-72 sm:h-92 md:h-96 rounded-r-xl rounded-l-xs overflow-hidden shadow-2xl border border-slate-700/80 bg-[#0d121c] flex flex-col">
              {/* Capa */}
              <EditorialCover
                titulo={livro.titulo}
                autor={autorLimpo}
                capaUrl={livro.capa_url}
                categoria={livro.categoria}
                ano={livro.ano_publicacao}
                size="lg"
                className="w-full h-full object-cover"
              />

              {/* Lombada com Vinco Tátil */}
              <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/80 via-white/10 to-transparent pointer-events-none" />

              {/* Fita Marcadora Dourada (Bookmark) */}
              <div className="absolute top-0 right-8 w-4 h-12 bg-amber-500 shadow-md transform -translate-y-1 rounded-b-sm border-b border-amber-600 pointer-events-none" />

              {/* Badge Flutuante de Status */}
              <div className="absolute top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/90 text-amber-300 backdrop-blur-md border border-amber-500/40 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Obra em Destaque</span>
                </span>
              </div>

              {/* Badge de Disponibilidade */}
              <div className="absolute bottom-3 left-4 z-10">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-md ${
                    disponivel
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                      : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {disponivel ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{livro.disponiveis} disp. para empréstimo</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-rose-300" />
                      <span>Todos exemplares emprestados</span>
                    </>
                  )}
                </span>
              </div>

              {/* Overlay Interativo ao passar o mouse */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-5 text-center">
                <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <BookOpen className="w-4 h-4" />
                  <span>Clique para Folhear o Livro</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors">
              <span>Toque na capa para abrir e ler trechos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : (
        /* ESTADO: LIVRO ABERTO (DUAL PAGE SPREAD REALISTA COM SUPORTE A TEMA CLARO E ESCURO) */
        <div className="w-full max-w-full sm:max-w-2xl animate-in zoom-in-95 duration-200 min-w-0">
          <div className="relative bg-slate-50 dark:bg-[#0f1523] border border-slate-200 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-3.5 sm:p-5 flex flex-col space-y-3 sm:space-y-4 text-slate-900 dark:text-white transition-colors w-full max-w-full min-w-0 overflow-hidden">
            {/* Faixa Superior com Controles de Folheamento */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5 text-[11px]">
                  <BookMarked className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Leitura Editorial</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  {livro.codigo_interno}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-900 p-0.5 text-[11px]">
                  <button
                    onClick={() => setPaginaAtiva('sinopse')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      paginaAtiva === 'sinopse'
                        ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sinopse
                  </button>
                  <button
                    onClick={() => setPaginaAtiva('ficha')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      paginaAtiva === 'ficha'
                        ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Ficha Técnica
                  </button>
                </div>

                <button
                  onClick={() => setIsAberto(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Fechar folheamento"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo Central: Capa + Apresentação Editorial */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* PÁGINA ESQUERDA: Capa */}
              <div className="sm:col-span-4 flex flex-col items-center">
                <div className="w-32 sm:w-full aspect-2/3 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900">
                  <EditorialCover
                    titulo={livro.titulo}
                    autor={autorLimpo}
                    capaUrl={livro.capa_url}
                    categoria={livro.categoria}
                    ano={livro.ano_publicacao}
                    size="md"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* PÁGINA DIREITA: Conteúdo Textual e Avaliação */}
              <div className="sm:col-span-8 flex flex-col justify-between space-y-3">
                {paginaAtiva === 'sinopse' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-serif italic">
                      <Quote className="w-4 h-4 shrink-0" />
                      <span>Apresentação da Obra</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-serif line-clamp-5">
                      {livro.sinopse ||
                        `Uma obra magistral da literatura que transporta o leitor através de reflexões profundas sobre a condição humana, o tempo e os dilemas que moldam nossa jornada coletiva. Indispensável para enriquecer o repertório cultural de estudantes e educadores.`}
                    </p>

                    {(() => {
                      const { media, total } = StorageService.getMediaNotaLivro(livro.id);
                      return (
                        <div className="p-2.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-500">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    total > 0 && i <= Math.round(media)
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300 dark:text-slate-600 fill-slate-200 dark:fill-slate-700/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {total > 0 ? media.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              • {total > 0 ? `${total} resenhas` : 'Sem avaliações'}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                              disponivel
                                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                            }`}
                          >
                            {disponivel ? `${livro.disponiveis} na estante` : 'Esgotado'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Ficha de Catalogação</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Código Interno</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{livro.codigo_interno}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">ISBN</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">{livro.isbn || 'Não cadastrado'}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Editora</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{livro.editora || 'Edição Especial'}</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Páginas</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{livro.paginas ? `${livro.paginas} págs.` : 'Completo'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ações da Obra no Rodapé do Livro Aberto */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onVerDetalhes(livro)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Abrir Ficha Completa & Resenhas</span>
              </button>

              {isProfessor && disponivel && onEmprestar && (
                <button
                  type="button"
                  onClick={() => onEmprestar(livro)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 dark:border-slate-700 hover:border-amber-500/40 transition-colors shadow-xs cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Emprestar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
