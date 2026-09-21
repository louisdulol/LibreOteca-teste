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
  Calendar as CalendarIcon,
  Star,
  Clock,
  Layers,
  ArrowRight,
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

  // Modal de confirmação de exclusão
  const [livroParaExcluir, setLivroParaExcluir] = useState<Livro | null>(null);

  // Livros populares para a seção "Popular Agora"
  const livrosPopulares = useMemo(() => {
    return livros.slice(0, 4);
  }, [livros]);

  // Coleção em destaque
  const colecaoDestaque = useMemo(() => {
    if (livros.length >= 2) {
      return {
        livros: [livros[0], livros[1]],
        titulo: 'Coleção Clássicos & Ficção Universal',
        volumes: 2,
        capitulos: 'Obras essenciais para a formação leitora',
      };
    }
    return null;
  }, [livros]);

  // Resenhas recentes da comunidade
  const comentariosRecentes = useMemo(() => {
    const todos = StorageService.getComentarios();
    if (todos.length > 0) {
      return todos.slice(0, 2);
    }
    return [
      {
        id: 'sample-1',
        livro_id: livros[0]?.id || '',
        leitor_id: 'sample-1',
        autor_nome: 'Roberto Jordan',
        autor_tipo: 'aluno' as const,
        nota: 5,
        texto: 'Que narrativa esplêndida! As reflexões e o desenvolvimento dos personagens prendem do início ao fim.',
        criado_em: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        status: 'aprovado' as const,
      },
      {
        id: 'sample-2',
        livro_id: livros[1]?.id || '',
        leitor_id: 'sample-2',
        autor_nome: 'Anna Henry',
        autor_tipo: 'aluno' as const,
        nota: 5,
        texto: 'Terminei a leitura ontem à noite e fiquei impressionada com a riqueza de detalhes e a sensibilidade do autor.',
        criado_em: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
        status: 'aprovado' as const,
      },
    ];
  }, [livros]);

  // Dias da semana para o cronograma
  const diasSemana = useMemo(() => {
    return [
      { nome: 'Dom', dia: 15 },
      { nome: 'Seg', dia: 16 },
      { nome: 'Ter', dia: 17 },
      { nome: 'Qua', dia: 18 },
      { nome: 'Qui', dia: 19 },
      { nome: 'Sex', dia: 20 },
      { nome: 'Sáb', dia: 21, ativo: true },
    ];
  }, []);

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

      {/* 2. SEÇÃO DESTAQUES: POPULAR AGORA & PAINÉIS LATERAIS */}
      {livros.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LADO ESQUERDO (8 COLUNAS): POPULAR AGORA */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  Popular Agora
                </h2>
              </div>
              <span className="text-xs text-slate-400">Títulos com maior circulação</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {livrosPopulares.map(livro => (
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
                      <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold">5.0</span>
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
              ))}
            </div>
          </div>

          {/* LADO DIREITO (4 COLUNAS): COLEÇÃO EM DESTAQUE & RESENHAS */}
          <div className="lg:col-span-4 space-y-5">
            {/* Cartão de Coleção */}
            {colecaoDestaque && (
              <div className="bg-[#131926] border border-slate-800/80 rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                    Coleção Temática
                  </span>
                  <span className="text-slate-500">{colecaoDestaque.volumes} volumes</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4 shrink-0">
                    {colecaoDestaque.livros.map((item, idx) => (
                      <div
                        key={item.id}
                        style={{ zIndex: 10 - idx }}
                        className="w-14 h-20 rounded-md overflow-hidden shadow-lg border border-slate-700 bg-slate-900"
                      >
                        <EditorialCover
                          titulo={item.titulo}
                          autor={item.autor}
                          capaUrl={item.capa_url}
                          categoria={item.categoria}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-white line-clamp-1">
                      {colecaoDestaque.titulo}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {colecaoDestaque.capitulos}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Resenhas da Comunidade */}
            <div className="bg-[#131926] border border-slate-800/80 rounded-2xl p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-serif font-bold text-white">Vozes dos Leitores</span>
                </div>
                <span className="text-[11px] text-slate-400">Comunidade</span>
              </div>

              <div className="space-y-3 divide-y divide-slate-800/60">
                {comentariosRecentes.map((com, i) => (
                  <div key={com.id || i} className={i > 0 ? 'pt-3' : ''}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{com.autor_nome}</span>
                      <div className="flex text-amber-400">
                        {[...Array(com.nota || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 italic mt-1 line-clamp-2">
                      "{com.texto}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cronograma Semanal */}
            <div className="bg-[#131926] border border-slate-800/80 rounded-2xl p-5 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  <span>Meta de Leitura</span>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">7 dias ativos</span>
              </div>

              <div className="flex justify-between gap-1 pt-2">
                {diasSemana.map(d => (
                  <div
                    key={d.nome}
                    className={`flex-1 py-1.5 rounded-lg text-center ${
                      d.ativo
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span className="text-[9px] block uppercase">{d.nome}</span>
                    <span className="text-xs font-bold block">{d.dia}</span>
                  </div>
                ))}
              </div>
            </div>
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
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/90 text-amber-300 border border-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
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
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filtroDisponibilidade === 'todos'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroDisponibilidade('disponiveis')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filtroDisponibilidade === 'disponiveis'
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-xs border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Disponíveis
              </button>
              <button
                onClick={() => setFiltroDisponibilidade('esgotados')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filtroDisponibilidade === 'esgotados'
                    ? 'bg-rose-500/20 text-rose-300 shadow-xs border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Esgotados
              </button>
            </div>

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
