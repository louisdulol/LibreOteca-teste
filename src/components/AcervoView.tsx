import React, { useState, useMemo } from 'react';
import { Livro, UsuarioSessao } from '../types';
import { StorageService } from '../lib/storage';
import { BookCard } from './BookCard';
import { EditorialCover } from './EditorialCover';
import { BookshelfView } from './BookshelfView';
import { WeeklyDiscoveryShowcase } from './WeeklyDiscoveryShowcase';
import { Modal } from './Modal';
import {
  Search,
  Plus,
  Sparkles,
  Download,
  LayoutGrid,
  List,
  Library,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trash2,
  Edit2,
  Eye,
  ArrowRightLeft,
  AlertTriangle,
  Flame,
  Star,
  Clock,
  Layers,
  ArrowRight,
  Tablet,
  X,
} from 'lucide-react';

interface AcervoViewProps {
  livros: Livro[];
  usuarioAtual: UsuarioSessao | null;
  onRefresh: () => void;
  onOpenNovoLivro: () => void;
  onOpenExplorarOpenLibrary: () => void;
  onEmprestarLivro: (livro: Livro) => void;
  onEditarLivro: (livro: Livro) => void;
  onVerDetalhes: (livro: Livro) => void;
  onOpenTabletKiosk?: () => void;
}

export const AcervoView: React.FC<AcervoViewProps> = ({
  livros,
  usuarioAtual,
  onRefresh,
  onOpenNovoLivro,
  onOpenExplorarOpenLibrary,
  onEmprestarLivro,
  onEditarLivro,
  onVerDetalhes,
  onOpenTabletKiosk,
}) => {
  const isProfessor = usuarioAtual?.role === 'professor';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<'todos' | 'disponiveis' | 'esgotados'>('todos');
  const [viewMode, setViewMode] = useState<'prateleiras' | 'grid' | 'table'>('prateleiras');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de confirmação de exclusão
  const [livroParaExcluir, setLivroParaExcluir] = useState<Livro | null>(null);

  // Livros populares para a seção "Popular Agora"
  const livrosPopulares = useMemo(() => {
    return livros.slice(0, 4);
  }, [livros]);

  // Extrai lista única de categorias
  const categorias = useMemo(() => {
    const set = new Set<string>();
    livros.forEach(l => {
      if (l.categoria) set.add(l.categoria);
    });
    return Array.from(set).sort();
  }, [livros]);

  // Filtragem e busca
  const livrosFiltrados = useMemo(() => {
    return livros.filter(livro => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        livro.titulo.toLowerCase().includes(term) ||
        livro.autor.toLowerCase().includes(term) ||
        livro.codigo_interno.toLowerCase().includes(term) ||
        (livro.isbn && livro.isbn.includes(term)) ||
        livro.categoria.toLowerCase().includes(term);

      if (!matchSearch) return false;

      if (selectedCategoria !== 'todas' && livro.categoria !== selectedCategoria) {
        return false;
      }

      if (filtroDisponibilidade === 'disponiveis' && livro.disponiveis <= 0) {
        return false;
      }
      if (filtroDisponibilidade === 'esgotados' && livro.disponiveis > 0) {
        return false;
      }

      return true;
    });
  }, [livros, searchTerm, selectedCategoria, filtroDisponibilidade]);

  const totalExemplaresGeral = useMemo(() => {
    return livros.reduce((acc, l) => acc + l.total_exemplares, 0);
  }, [livros]);

  const totalDisponiveisGeral = useMemo(() => {
    return livros.reduce((acc, l) => acc + l.disponiveis, 0);
  }, [livros]);

  const confirmarExclusao = () => {
    if (!livroParaExcluir) return;
    const res = StorageService.deleteLivro(livroParaExcluir.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      onRefresh();
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setLivroParaExcluir(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-10">
      {/* 1. SEÇÃO HERO: DESCOBERTA DA SEMANA COM O LIVRO INTERATIVO */}
      {livros.length > 0 && (
        <WeeklyDiscoveryShowcase
          livroDestaque={livros[0]}
          onVerDetalhes={onVerDetalhes}
          onEmprestar={onEmprestarLivro}
          isProfessor={isProfessor}
        />
      )}

      {/* 2. SEÇÃO DESTAQUES: POPULAR AGORA */}
      {livros.length > 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                Popular Agora
              </h2>
            </div>
            <span className="text-xs text-slate-400">Títulos com maior circulação</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {livrosPopulares.map(livro => {
              const { media, total } = StorageService.getMediaNotaLivro(livro.id);
              return (
                <div
                  key={livro.id}
                  onClick={() => onVerDetalhes(livro)}
                  className="group bg-[#131926] hover:bg-[#182133] border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md flex gap-4 items-center"
                >
                  <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden shadow-md border border-slate-700/60 group-hover:scale-105 transition-transform duration-200">
                    <EditorialCover
                      titulo={livro.titulo}
                      autor={livro.autor}
                      capaUrl={livro.capa_url}
                      categoria={livro.categoria}
                      ano={livro.ano_publicacao}
                      size="sm"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-semibold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 inline-block">
                      {livro.categoria}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {livro.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{livro.autor}</p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Star
                          className={`w-3.5 h-3.5 ${
                            total > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500 fill-slate-500/20'
                          }`}
                        />
                        <span className={`font-bold ${total > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {total > 0 ? media.toFixed(1) : '0.0'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {total > 0 ? `(${total})` : '(sem avaliações)'}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          livro.disponiveis > 0
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {livro.disponiveis > 0 ? `${livro.disponiveis} disp.` : 'Esgotado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SEÇÃO PRINCIPAL: CATÁLOGO COMPLETO, BUSCA, FILTROS E ESTANTES */}
      <div id="secao-catalogo-completo" className="pt-2 space-y-6">
        {/* Barra de Ações & Estatísticas do Catálogo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131926] p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-xl">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span>Catálogo Geral & Prateleiras</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {livros.length} títulos catalogados • {totalExemplaresGeral} exemplares no acervo ({totalDisponiveisGeral} disponíveis)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botão Modo Totem Tablet para consulta rápida */}
            {onOpenTabletKiosk && (
              <button
                id="btn-abrir-totem-acervo"
                onClick={onOpenTabletKiosk}
                className="p-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Modo Totem (Autoatendimento e Consulta)"
                aria-label="Modo Totem"
              >
                <Tablet className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {isProfessor ? (
              <>
                <button
                  id="btn-explorar-ol-acervo"
                  onClick={onOpenExplorarOpenLibrary}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors shadow-sm"
                  title="Buscar e importar títulos da Open Library"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Library</span>
                </button>

                <button
                  id="btn-exportar-csv-acervo"
                  onClick={() => StorageService.exportarLivrosCsv()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Baixar planilha CSV de livros"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  id="btn-cadastrar-livro-acervo"
                  onClick={onOpenNovoLivro}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Livro</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Clique em qualquer livro para ver a ficha completa e deixar sua resenha!</span>
              </div>
            )}
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/40 text-rose-300 border border-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Barra de Filtros e Busca */}
        <div className="bg-[#131926] p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                id="input-busca-acervo"
                placeholder="Buscar por título, autor, ISBN, código de prateleira..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 p-0.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro de Categoria */}
            <select
              id="select-categoria-acervo"
              value={selectedCategoria}
              onChange={e => setSelectedCategoria(e.target.value)}
              className="px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="todas">Todas as Categorias ({livros.length})</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Filtro de Disponibilidade */}
            <div className="inline-flex rounded-xl border border-slate-700/80 p-0.5 bg-slate-900">
              <button
                onClick={() => setFiltroDisponibilidade('todos')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filtroDisponibilidade === 'todos'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroDisponibilidade('disponiveis')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filtroDisponibilidade === 'disponiveis'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-xs border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Disponíveis
              </button>
              <button
                onClick={() => setFiltroDisponibilidade('esgotados')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filtroDisponibilidade === 'esgotados'
                    ? 'bg-rose-500/20 text-rose-300 shadow-xs border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Esgotados
              </button>
            </div>

            {/* Botão Reset de Filtros se algum estiver ativo */}
            {(searchTerm || selectedCategoria !== 'todas' || filtroDisponibilidade !== 'todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria('todas');
                  setFiltroDisponibilidade('todos');
                }}
                className="px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Resetar todos os filtros de busca"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}

            {/* Alternador de Visualização: Estante / Grade / Tabela */}
            <div className="hidden sm:inline-flex rounded-xl border border-slate-700/80 p-0.5 bg-slate-900 shrink-0">
              <button
                onClick={() => setViewMode('prateleiras')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'prateleiras'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Prateleiras de Madeira"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Estante</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Grade de Livros"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Tabela Detalhada"
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>
          </div>
        </div>

        {/* Listagem de Livros */}
        {livrosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-[#131926] rounded-3xl border border-slate-800/80 shadow-xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-serif font-bold text-white">
              Nenhum livro encontrado
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {livros.length === 0
                ? 'O acervo da biblioteca está vazio no momento. Cadastre novos livros usando o formulário ou importe dados via Open Library.'
                : 'Não encontramos livros que correspondam aos filtros selecionados. Tente limpar a busca ou selecionar outra categoria.'}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              {livros.length > 0 ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategoria('todas');
                    setFiltroDisponibilidade('todos');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Limpar Filtros
                </button>
              ) : isProfessor ? (
                <button
                  onClick={onOpenNovoLivro}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold"
                >
                  + Cadastrar Primeiro Livro
                </button>
              ) : null}
            </div>
          </div>
        ) : viewMode === 'prateleiras' ? (
          /* Visualização em Estante */
          <BookshelfView
            livros={livrosFiltrados}
            usuarioAtual={usuarioAtual}
            onVerDetalhes={onVerDetalhes}
            onEmprestar={onEmprestarLivro}
            onEditar={onEditarLivro}
          />
        ) : viewMode === 'grid' ? (
          /* Visualização em Grade */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {livrosFiltrados.map(livro => (
              <BookCard
                key={livro.id}
                livro={livro}
                usuarioAtual={usuarioAtual}
                onEmprestar={onEmprestarLivro}
                onEditar={onEditarLivro}
                onExcluir={livro => setLivroParaExcluir(livro)}
                onVerDetalhes={onVerDetalhes}
              />
            ))}
          </div>
        ) : (
          /* Visualização em Tabela */
          <div className="bg-[#131926] rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Capa & Código</th>
                    <th className="py-3 px-4">Título e Autor</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4 text-center">Disponibilidade</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {livrosFiltrados.map(livro => (
                    <tr key={livro.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <EditorialCover
                            titulo={livro.titulo}
                            autor={livro.autor}
                            capaUrl={livro.capa_url}
                            categoria={livro.categoria}
                            size="sm"
                            className="w-8 h-11 rounded-sm shrink-0"
                          />
                          <span className="font-mono font-bold text-amber-300 text-[11px]">
                            {livro.codigo_interno}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p
                          onClick={() => onVerDetalhes(livro)}
                          className="font-serif font-bold text-white text-sm hover:text-amber-400 cursor-pointer"
                        >
                          {livro.titulo}
                        </p>
                        <p className="text-slate-400 text-[11px]">{livro.autor}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                          {livro.categoria}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {livro.isbn || '-'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            livro.disponiveis > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {livro.disponiveis} de {livro.total_exemplares}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isProfessor ? (
                            <>
                              <button
                                onClick={() => onEmprestarLivro(livro)}
                                disabled={livro.disponiveis <= 0}
                                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-semibold text-[11px] disabled:opacity-40 transition-colors"
                              >
                                Emprestar
                              </button>
                              <button
                                onClick={() => onEditarLivro(livro)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setLivroParaExcluir(livro)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-800"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onVerDetalhes(livro)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-[11px] border border-slate-700"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-400" />
                              <span>Ver Ficha</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {livroParaExcluir && (
        <Modal
          isOpen={true}
          onClose={() => setLivroParaExcluir(null)}
          title="Excluir Livro do Acervo"
          subtitle="Esta ação removerá o título e todos os registros associados"
          maxWidth="md"
          zIndex="z-[80]"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-2xl flex items-start gap-3 text-rose-200">
              <div className="w-10 h-10 rounded-xl bg-rose-900/50 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-100">
                  Tem certeza que deseja remover esta obra?
                </h4>
                <p className="text-xs text-rose-300 mt-1">
                  Você está excluindo: <strong>{livroParaExcluir.titulo}</strong> (Código: {livroParaExcluir.codigo_interno}, {livroParaExcluir.total_exemplares} exemplares).
                </p>
                <p className="text-[11px] text-rose-400/80 mt-1">
                  Quaisquer empréstimos e resenhas vinculadas a este livro também serão limpos para manter a integridade do sistema.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancelar-exclusao"
                onClick={() => setLivroParaExcluir(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-exclusao"
                onClick={confirmarExclusao}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Livro</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
