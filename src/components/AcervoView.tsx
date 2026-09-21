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
  ExternalLink,
  Bookmark,
  Star,
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
}) => {
  const isProfessor = usuarioAtual?.role === 'professor';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<'todos' | 'disponiveis' | 'esgotados'>('todos');
  const [viewMode, setViewMode] = useState<'prateleiras' | 'grid' | 'table'>('prateleiras');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal de confirmação de exclusão garantido (evita bloqueio de window.confirm em iframe)
  const [livroParaExcluir, setLivroParaExcluir] = useState<Livro | null>(null);

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
    <div className="space-y-6">
      {/* Destaque Editorial: Descoberta da Semana com Livro Aberto Físico e layout idêntico à referência */}
      {livros.length > 0 && (
        <WeeklyDiscoveryShowcase
          livros={livros}
          usuarioAtual={usuarioAtual}
          onVerDetalhes={onVerDetalhes}
          onEmprestarLivro={onEmprestarLivro}
          onOpenNovoLivro={onOpenNovoLivro}
        />
      )}

      {/* Barra de Ações Administrativas e de Exploração */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Catálogo & Estantes
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {livros.length} títulos cadastrados • {totalExemplaresGeral} exemplares no acervo ({totalDisponiveisGeral} disponíveis)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isProfessor ? (
            <>
              <button
                id="btn-explorar-ol-acervo"
                onClick={onOpenExplorarOpenLibrary}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Explorar Open Library
              </button>

              <button
                id="btn-exportar-csv-acervo"
                onClick={() => StorageService.exportarLivrosCsv()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                title="Baixar planilha CSV de livros"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>

              <button
                id="btn-cadastrar-livro-acervo"
                onClick={onOpenNovoLivro}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Livro
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Clique no livro para ver resenhas de colegas e dar sua nota!</span>
            </div>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              id="input-busca-acervo"
              placeholder="Buscar por título, autor, ISBN, código de prateleira..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro de Categoria */}
          <select
            id="select-categoria-acervo"
            value={selectedCategoria}
            onChange={e => setSelectedCategoria(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="todas">Todas as Categorias ({livros.length})</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Filtro de Disponibilidade */}
          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50">
            <button
              onClick={() => setFiltroDisponibilidade('todos')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filtroDisponibilidade === 'todos'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroDisponibilidade('disponiveis')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filtroDisponibilidade === 'disponiveis'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Disponíveis
            </button>
            <button
              onClick={() => setFiltroDisponibilidade('esgotados')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filtroDisponibilidade === 'esgotados'
                  ? 'bg-white text-rose-800 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Esgotados
            </button>
          </div>

          {/* Alternador Estante / Grade / Tabela */}
          <div className="hidden sm:inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 shrink-0">
            <button
              onClick={() => setViewMode('prateleiras')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'prateleiras'
                  ? 'bg-amber-900 text-amber-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Visualização em Estante de Madeira"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Estante</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-900 text-amber-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
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
                  ? 'bg-amber-900 text-amber-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>
        </div>
      </div>

      {/* Listagem de Livros */}
      {livrosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-base font-serif font-bold text-stone-800">
            Nenhum livro encontrado
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {livros.length === 0
              ? 'O acervo da biblioteca está vazio no momento. Professores podem cadastrar novos livros usando o formulário ou buscar na Open Library.'
              : 'Não encontramos livros que correspondam aos filtros selecionados. Tente limpar os filtros de busca.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            {livros.length > 0 ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria('todas');
                  setFiltroDisponibilidade('todos');
                }}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
              >
                Limpar Filtros
              </button>
            ) : isProfessor ? (
              <button
                onClick={onOpenNovoLivro}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold"
              >
                + Cadastrar Primeiro Livro
              </button>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'prateleiras' ? (
        <BookshelfView
          livros={livrosFiltrados}
          usuarioAtual={usuarioAtual}
          onVerDetalhes={onVerDetalhes}
          onEmprestar={onEmprestarLivro}
          onEditar={onEditarLivro}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Capa & Código</th>
                  <th className="py-3 px-4">Título e Autor</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4 text-center">Disponibilidade</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {livrosFiltrados.map(livro => (
                  <tr key={livro.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <EditorialCover
                          titulo={livro.titulo}
                          autor={livro.autor}
                          capaUrl={livro.capa_url}
                          categoria={livro.categoria}
                          size="sm"
                          className="w-9 h-12 rounded-sm shrink-0"
                        />
                        <span className="font-mono font-bold text-stone-800 text-[11px]">
                          {livro.codigo_interno}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p
                        onClick={() => onVerDetalhes(livro)}
                        className="font-serif font-bold text-stone-900 text-sm hover:text-amber-800 cursor-pointer"
                      >
                        {livro.titulo}
                      </p>
                      <p className="text-stone-500 text-[11px]">{livro.autor}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-stone-100 text-stone-700 font-medium">
                        {livro.categoria}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                      {livro.isbn || '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          livro.disponiveis > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
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
                              className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold text-[11px] disabled:opacity-40 transition-colors"
                            >
                              Emprestar
                            </button>
                            <button
                              onClick={() => onEditarLivro(livro)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setLivroParaExcluir(livro)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-stone-200"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onVerDetalhes(livro)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-[11px]"
                          >
                            <MessageSquare className="w-3 h-3 text-amber-400" />
                            <span>Ver Ficha & Comentários</span>
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

      {/* Modal de Confirmação de Exclusão (In-App, 100% à prova de restrições de sandbox) */}
      {livroParaExcluir && (
        <Modal
          isOpen={true}
          onClose={() => setLivroParaExcluir(null)}
          title="Excluir Livro do Acervo"
          subtitle="Esta ação removerá o título e todos os registros associados"
          maxWidth="md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  Tem certeza que deseja remover esta obra?
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  Você está excluindo: <strong>{livroParaExcluir.titulo}</strong> (Código: {livroParaExcluir.codigo_interno}, {livroParaExcluir.total_exemplares} exemplares).
                </p>
                <p className="text-[11px] text-rose-600 mt-1">
                  Quaisquer empréstimos e resenhas vinculadas a este livro também serão limpos para manter a integridade do sistema.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancelar-exclusao"
                onClick={() => setLivroParaExcluir(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-exclusao"
                onClick={confirmarExclusao}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Livro
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
