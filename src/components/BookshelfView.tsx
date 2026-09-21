import React from 'react';
import { Livro, UsuarioSessao } from '../types';
import { EditorialCover } from './EditorialCover';
import {
  Sparkles,
  BookOpen,
  ArrowRightLeft,
  Eye,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface BookshelfViewProps {
  livros: Livro[];
  usuarioAtual: UsuarioSessao | null;
  onVerDetalhes: (livro: Livro) => void;
  onEmprestar: (livro: Livro) => void;
  onEditar?: (livro: Livro) => void;
}

interface ShelfSection {
  id: string;
  titulo: string;
  subtitulo: string;
  badge?: string;
  livros: Livro[];
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  livros,
  usuarioAtual,
  onVerDetalhes,
  onEmprestar,
}) => {
  const isProfessor = usuarioAtual?.role === 'professor';

  // Agrupa os livros em prateleiras temáticas
  const shelves = React.useMemo<ShelfSection[]>(() => {
    if (livros.length <= 6) {
      return [
        {
          id: 'acervo-principal',
          titulo: 'Prateleira de Leituras',
          subtitulo: 'Todos os títulos do acervo selecionados para você',
          badge: `${livros.length} obras`,
          livros,
        },
      ];
    }

    // 1. Destaques e Mais Lidos
    const destaques = livros.slice(0, 6);

    // 2. Literatura, Ficção e Poesia
    const literatura = livros.filter(
      l =>
        l.categoria?.toLowerCase().includes('literatura') ||
        l.categoria?.toLowerCase().includes('ficção') ||
        l.categoria?.toLowerCase().includes('romance') ||
        l.categoria?.toLowerCase().includes('poesia') ||
        l.categoria?.toLowerCase().includes('juvenil')
    );

    // 3. Ciências, História e Conhecimento
    const ciencias = livros.filter(
      l =>
        l.categoria?.toLowerCase().includes('ciência') ||
        l.categoria?.toLowerCase().includes('história') ||
        l.categoria?.toLowerCase().includes('filosofia') ||
        l.categoria?.toLowerCase().includes('biografia') ||
        l.categoria?.toLowerCase().includes('didático')
    );

    // 4. Outras categorias ou restante
    const idsJaClassificados = new Set([
      ...destaques.map(l => l.id),
      ...literatura.map(l => l.id),
      ...ciencias.map(l => l.id),
    ]);
    const outros = livros.filter(l => !idsJaClassificados.has(l.id));

    const result: ShelfSection[] = [
      {
        id: 'destaques',
        titulo: 'Destaques & Recomendações',
        subtitulo: 'Obras mais procuradas e leituras imperdíveis',
        badge: 'Em alta',
        livros: destaques,
      },
    ];

    if (literatura.length > 0) {
      result.push({
        id: 'literatura',
        titulo: 'Literatura & Narrativas',
        subtitulo: 'Romances, contos, clássicos universais e fantasia',
        badge: `${literatura.length} títulos`,
        livros: literatura,
      });
    }

    if (ciencias.length > 0) {
      result.push({
        id: 'ciencias',
        titulo: 'Ciências & Humanidades',
        subtitulo: 'Divulgação científica, história, ensaios e reflexão',
        badge: `${ciencias.length} títulos`,
        livros: ciencias,
      });
    }

    if (outros.length > 0) {
      result.push({
        id: 'diversos',
        titulo: 'Novas Aquisições & Diversos',
        subtitulo: 'Exploração livre do catálogo da biblioteca',
        badge: `${outros.length} títulos`,
        livros: outros,
      });
    }

    return result;
  }, [livros]);

  return (
    <div className="space-y-10 py-2">
      {shelves.map(shelf => (
        <section key={shelf.id} className="relative">
          {/* Cabeçalho da Prateleira */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 px-1 gap-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                {shelf.titulo}
              </h3>
              {shelf.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {shelf.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {shelf.subtitulo}
            </p>
          </div>

          {/* O Contêiner da Estante */}
          <div className="relative bg-gradient-to-b from-[#131926] to-[#0c1018] rounded-3xl p-5 sm:p-7 border border-slate-800/80 shadow-2xl">
            {/* Linha de Livros com scroll horizontal suave */}
            <div className="overflow-x-auto scrollbar-thin pb-4 pt-2">
              <div className="flex items-end gap-5 sm:gap-7 min-w-max px-2">
                {shelf.livros.map(livro => {
                  const disponivel = livro.disponiveis > 0;

                  return (
                    <div
                      key={livro.id}
                      className="group flex flex-col items-center w-36 sm:w-40 md:w-44 select-none shrink-0"
                    >
                      {/* Capa do Livro na Prateleira */}
                      <div
                        onClick={() => onVerDetalhes(livro)}
                        className="relative w-32 sm:w-36 md:w-38 h-48 sm:h-52 md:h-56 cursor-pointer transition-all duration-200 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]"
                        title={`Clique para ver detalhes de "${livro.titulo}"`}
                      >
                        {/* Sombra de Contato na Prateleira */}
                        <div className="absolute -bottom-2 inset-x-2 h-3 bg-black/80 blur-sm rounded-full transition-all duration-200" />

                        {/* Corpo do Livro com Capa */}
                        <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg border border-slate-700/60 group-hover:border-amber-400/60 bg-[#0d121c]">
                          <EditorialCover
                            titulo={livro.titulo}
                            autor={livro.autor}
                            capaUrl={livro.capa_url}
                            categoria={livro.categoria}
                            ano={livro.ano_publicacao}
                            size="md"
                            className="w-full h-full object-cover"
                          />

                          {/* Vinco sutil da Lombada */}
                          <div className="absolute left-0 inset-y-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

                          {/* Status de Disponibilidade em Badge Flutuante */}
                          <div className="absolute top-2 right-2 z-10">
                            {disponivel ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/90 text-emerald-300 backdrop-blur-xs border border-emerald-500/50 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {livro.disponiveis} disp.
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/90 text-rose-300 backdrop-blur-xs border border-rose-500/50 shadow-xs">
                                <Clock className="w-2.5 h-2.5 text-rose-300" />
                                Esgotado
                              </span>
                            )}
                          </div>

                          {/* Código da Prateleira */}
                          <div className="absolute bottom-2 left-2 z-10">
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/80 text-amber-300 backdrop-blur-xs border border-white/10">
                              {livro.codigo_interno}
                            </span>
                          </div>

                          {/* Botão Hover "Abrir" */}
                          <div className="absolute inset-x-2 bottom-2 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-lg backdrop-blur-xs flex items-center gap-1">
                              <span>Abrir Ficha</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Informações Editoriais Abaixo do Livro */}
                      <div className="mt-3 text-center w-full px-1">
                        <h4
                          onClick={() => onVerDetalhes(livro)}
                          className="font-serif font-bold text-xs sm:text-sm text-white line-clamp-1 hover:text-amber-400 cursor-pointer transition-colors"
                          title={livro.titulo}
                        >
                          {livro.titulo}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {livro.autor}
                        </p>

                        {/* Botões Rápidos */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onVerDetalhes(livro)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-2.5 h-2.5 text-amber-400" />
                            <span>Detalhes</span>
                          </button>

                          {isProfessor && disponivel && (
                            <button
                              onClick={() => onEmprestar(livro)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1 shadow-xs"
                              title="Registrar empréstimo para este livro"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              <span>Emprestar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* A Prateleira de Madeira Tridimensional Realista */}
            <div className="mt-1 relative w-full">
              {/* Plano Superior da Prateleira com reflexo de luz */}
              <div className="h-3 w-full bg-gradient-to-r from-[#2a1d15] via-[#453123] to-[#2a1d15] rounded-t-sm shadow-inner border-t border-[#5c4331]" />
              {/* Borda Frontal da Madeira Maciça */}
              <div className="h-3.5 w-full bg-gradient-to-b from-[#241710] to-[#140c08] shadow-[0_10px_24px_rgba(0,0,0,0.8)] rounded-b-md border-t border-[#422c1e]" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
