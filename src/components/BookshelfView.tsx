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

  // Agrupa os livros em prateleiras temáticas inspiradas na Readowl
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

    // 1. Destaques e Mais Lidos (livros com mais exemplares ou com boas resenhas)
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
        titulo: 'Conhecimento & Ciências',
        subtitulo: 'Exploração do mundo, sociedade, ensaios e história',
        badge: `${ciencias.length} títulos`,
        livros: ciencias,
      });
    }

    if (outros.length > 0) {
      result.push({
        id: 'outros',
        titulo: 'Novas Aquisições & Acervo Geral',
        subtitulo: 'Mais volumes catalogados na estante',
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
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                {shelf.titulo}
              </h3>
              {shelf.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {shelf.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {shelf.subtitulo}
            </p>
          </div>

          {/* O Contêiner da Estante com os Livros Físicos em Fileira */}
          <div className="relative bg-gradient-to-b from-[#FDFBF7] to-[#F5EFE6] rounded-2xl p-4 sm:p-6 border border-[#E8DFC8]/80 shadow-xs">
            {/* Linha de Livros com scroll horizontal suave caso ultrapasse */}
            <div className="overflow-x-auto scrollbar-thin pb-4 pt-2">
              <div className="flex items-end gap-5 sm:gap-7 min-w-max px-2">
                {shelf.livros.map(livro => {
                  const disponivel = livro.disponiveis > 0;

                  return (
                    <div
                      key={livro.id}
                      className="group flex flex-col items-center w-36 sm:w-40 md:w-44 select-none shrink-0"
                    >
                      {/* O Volume Físico do Livro com Sombra de Prateleira e Efeito 3D */}
                      <div
                        onClick={() => onVerDetalhes(livro)}
                        className="relative w-32 sm:w-36 md:w-38 h-48 sm:h-52 md:h-56 cursor-pointer transition-all duration-300 ease-out group-hover:-translate-y-3.5 group-hover:scale-[1.03] group-hover:-rotate-1"
                        title={`Clique para ver detalhes de "${livro.titulo}"`}
                      >
                        {/* Sombra de Contato Físico na Prateleira de Madeira */}
                        <div className="absolute -bottom-2 inset-x-2 h-4 bg-stone-900/40 blur-md rounded-full group-hover:bg-stone-900/60 group-hover:blur-xl group-hover:scale-x-125 transition-all duration-300" />

                        {/* Corpo do Livro com Capa */}
                        <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden shadow-[0_12px_22px_-4px_rgba(40,25,10,0.35)] group-hover:shadow-[0_24px_34px_-6px_rgba(40,25,10,0.5)] border border-stone-900/10 bg-stone-900">
                          <EditorialCover
                            titulo={livro.titulo}
                            autor={livro.autor}
                            capaUrl={livro.capa_url}
                            categoria={livro.categoria}
                            ano={livro.ano_publicacao}
                            size="md"
                            className="w-full h-full object-cover"
                          />

                          {/* Vinco / Dobra da Lombada Físico */}
                          <div className="absolute left-0 inset-y-0 w-3 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />

                          {/* Feixe de Luz / Brilho Suave ao passar o mouse */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                          {/* Borda direita simulando páginas de papel */}
                          <div className="absolute right-0 inset-y-0 w-0.5 bg-gradient-to-b from-stone-200 via-stone-100 to-stone-300 opacity-90 pointer-events-none" />

                          {/* Status de Disponibilidade em Badge Flutuante */}
                          <div className="absolute top-2 right-2 z-10">
                            {disponivel ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/85 text-emerald-200 backdrop-blur-xs border border-emerald-400/40 shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {livro.disponiveis} disp.
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-950/85 text-rose-200 backdrop-blur-xs border border-rose-400/40 shadow-xs">
                                <Clock className="w-2.5 h-2.5 text-rose-300" />
                                Emprestado
                              </span>
                            )}
                          </div>

                          {/* Código da Prateleira */}
                          <div className="absolute bottom-2 left-2 z-10">
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/70 text-amber-200 backdrop-blur-xs border border-white/10">
                              {livro.codigo_interno}
                            </span>
                          </div>

                          {/* Botão Hover "Explorar" */}
                          <div className="absolute inset-x-2 bottom-2 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-900/95 text-amber-100 shadow-md backdrop-blur-xs flex items-center gap-1">
                              <span>Abrir</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Informações Editoriais Abaixo do Livro */}
                      <div className="mt-3 text-center w-full px-1">
                        <h4
                          onClick={() => onVerDetalhes(livro)}
                          className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 hover:text-amber-800 cursor-pointer transition-colors"
                          title={livro.titulo}
                        >
                          {livro.titulo}
                        </h4>
                        <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                          {livro.autor}
                        </p>

                        {/* Botões Rápidos */}
                        <div className="mt-2 flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onVerDetalhes(livro)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            Detalhes
                          </button>

                          {isProfessor && disponivel && (
                            <button
                              onClick={() => onEmprestar(livro)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-800 hover:bg-amber-900 text-white transition-colors flex items-center gap-1 shadow-2xs"
                              title="Registrar empréstimo para este livro"
                            >
                              <ArrowRightLeft className="w-2.5 h-2.5" />
                              Emprestar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* A Prateleira de Madeira Tridimensional Realista (Estilo Readowl) */}
            <div className="mt-1 relative w-full">
              {/* Plano Superior da Prateleira com reflexo de luz */}
              <div className="h-3.5 w-full bg-gradient-to-r from-[#dfd0b5] via-[#f0e3cc] to-[#dfd0b5] rounded-t-sm shadow-inner border-t border-[#cebb99]" />
              {/* Borda Frontal da Madeira Maciça com sombra projetada */}
              <div className="h-3 w-full bg-gradient-to-b from-[#bda076] to-[#a4865a] shadow-[0_8px_18px_rgba(80,50,15,0.24)] rounded-b-md border-t border-[#e2d2b5]" />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
