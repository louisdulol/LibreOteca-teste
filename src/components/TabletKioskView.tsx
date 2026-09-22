import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Livro, UsuarioSessao } from '../types';
import { StorageService, sanitizarAutor } from '../lib/storage';
import { EditorialCover } from './EditorialCover';
import {
  Search,
  X,
  Tablet,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Layers,
  ArrowRightLeft,
  QrCode,
  Tag,
} from 'lucide-react';
import { ThemeService } from '../lib/theme';

interface TabletKioskViewProps {
  isOpen: boolean;
  onClose: () => void;
  livros: Livro[];
  usuarioAtual: UsuarioSessao | null;
  onEmprestarLivro?: (livro: Livro) => void;
  nomeBiblioteca: string;
}

export const TabletKioskView: React.FC<TabletKioskViewProps> = ({
  isOpen,
  onClose,
  livros,
  usuarioAtual,
  onEmprestarLivro,
  nomeBiblioteca,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);
  const [selectedLivro, setSelectedLivro] = useState<Livro | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [horaAtual, setHoraAtual] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Relógio do Totem
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHoraAtual(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Monitorar tema
  useEffect(() => {
    const theme = ThemeService.getTheme();
    setCurrentTheme(theme === 'light' ? 'light' : 'dark');
  }, [isOpen]);

  // Bloquear scroll do body quando totem aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    } else {
      document.body.style.overflow = 'unset';
      setSelectedLivro(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  // Categorias únicas
  const categorias = useMemo(() => {
    const set = new Set<string>();
    livros.forEach(l => {
      if (l.categoria && l.categoria.trim()) {
        set.add(l.categoria.trim());
      }
    });
    return Array.from(set).sort();
  }, [livros]);

  // Filtragem rápida
  const livrosFiltrados = useMemo(() => {
    return livros.filter(livro => {
      if (apenasDisponiveis && livro.disponiveis <= 0) return false;
      if (selectedCategoria !== 'todas' && livro.categoria !== selectedCategoria) return false;

      if (searchTerm.trim()) {
        const termo = searchTerm.toLowerCase();
        const noTitulo = livro.titulo.toLowerCase().includes(termo);
        const noAutor = livro.autor.toLowerCase().includes(termo);
        const noCodigo = livro.codigo_interno?.toLowerCase().includes(termo);
        const noIsbn = livro.isbn?.toLowerCase().includes(termo);
        const naCategoria = livro.categoria?.toLowerCase().includes(termo);
        return noTitulo || noAutor || noCodigo || noIsbn || naCategoria;
      }
      return true;
    });
  }, [livros, searchTerm, selectedCategoria, apenasDisponiveis]);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    ThemeService.setTheme(nextTheme);
    setCurrentTheme(nextTheme);
  };

  if (!isOpen) return null;

  return (
    <div
      id="tablet-kiosk-container"
      className="fixed inset-0 z-[100] bg-slate-100 dark:bg-[#0b0e14] text-slate-900 dark:text-white flex flex-col overflow-hidden animate-in fade-in duration-200 select-none transition-colors"
    >
      {/* 1. CABEÇALHO DO TOTEM (ESTILO CONSOLE / BIG PICTURE) */}
      <header className="shrink-0 bg-white dark:bg-[#0f1420] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Identificação do Totem */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Tablet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Totem da Biblioteca
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Autoatendimento
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-md">
              {nomeBiblioteca} • Toque no livro para ver localização na estante
            </p>
          </div>
        </div>

        {/* Lado Direito: Relógio e Controles do Totem */}
        <div className="flex items-center gap-2 sm:gap-3">
          {horaAtual && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{horaAtual}</span>
            </div>
          )}

          {/* Alternar Tema */}
          <button
            onClick={handleToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Alternar Tema Claro / Escuro"
          >
            {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Fechar / Sair do Modo Totem */}
          <button
            id="btn-sair-totem"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Sair do Totem</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE BUSCA & FILTROS GIGANTES DE FÁCIL TOQUE */}
      <div className="shrink-0 bg-white/90 dark:bg-[#0f1420]/80 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-4 space-y-3 backdrop-blur-md">
        {/* Barra de Busca Gigante para Tablet */}
        <div className="relative max-w-4xl mx-auto">
          <Search className="w-6 h-6 text-amber-500 dark:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            id="input-busca-totem"
            placeholder="Digite o nome do livro, autor ou código de prateleira (ex: LO-000001)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-13 pr-12 py-3.5 sm:py-4 bg-slate-50 dark:bg-[#131926] border-2 border-slate-200 dark:border-slate-700/80 focus:border-amber-500 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden shadow-inner transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-200 dark:bg-slate-800/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pílulas de Categoria & Filtro de Disponibilidade */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setApenasDisponiveis(!apenasDisponiveis)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              apenasDisponiveis
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-[#131926] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apenas Disponíveis na Estante</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />

          <button
            onClick={() => setSelectedCategoria('todas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategoria === 'todas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-[#131926] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas as Categorias ({livros.length})
          </button>

          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategoria === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-[#131926] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CATÁLOGO / GRADE DE LIVROS (ESTILO STEAM BIG PICTURE) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {livrosFiltrados.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 flex items-center justify-center mx-auto shadow-xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Nenhum livro encontrado</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Tente buscar com outros termos ou limpe os filtros para visualizar o acervo completo.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria('todas');
                  setApenasDisponiveis(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {livrosFiltrados.map(livro => {
                const { media, total } = StorageService.getMediaNotaLivro(livro.id);
                const disponivel = livro.disponiveis > 0;

                return (
                  <div
                    key={livro.id}
                    onClick={() => setSelectedLivro(livro)}
                    className="group relative flex flex-col bg-white dark:bg-[#131926] border-2 border-slate-200 dark:border-slate-800/80 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/60 transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {/* Capa */}
                    <div className="relative aspect-2/3 w-full bg-slate-100 dark:bg-[#0d121c] overflow-hidden">
                      <EditorialCover
                        titulo={livro.titulo}
                        autor={livro.autor}
                        capaUrl={livro.capa_url}
                        categoria={livro.categoria}
                        ano={livro.ano_publicacao}
                        size="md"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Código de Prateleira Dourado */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-black/85 text-amber-300 border border-amber-500/40 shadow-md">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{livro.codigo_interno}</span>
                        </span>
                      </div>

                      {/* Status de Disponibilidade */}
                      <div className="absolute bottom-2 inset-x-2 z-10">
                        <span
                          className={`w-full text-center block px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md shadow-md ${
                            disponivel
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                              : 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                          }`}
                        >
                          {disponivel ? `✓ ${livro.disponiveis} na estante` : '✕ Esgotado'}
                        </span>
                      </div>
                    </div>

                    {/* Metadados do Livro */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 block truncate uppercase tracking-wider">
                          {livro.categoria}
                        </span>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          {livro.titulo}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{sanitizarAutor(livro.autor)}</p>
                      </div>

                      {/* Avaliação */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                          <Star className={`w-3 h-3 ${total > 0 ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          <span>{total > 0 ? media.toFixed(1) : '0.0'}</span>
                        </div>
                        <span className="text-slate-400 dark:text-slate-500">{livro.ano_publicacao || 'Acervo'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL / DETALHE DO LIVRO PARA O TOTEM (COM GUIA DE LOCALIZAÇÃO NA PRATELEIRA) */}
      {selectedLivro && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setSelectedLivro(null);
          }}
        >
          <div className="w-full max-w-2xl bg-white dark:bg-[#131926] border-2 border-amber-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            {/* Topo do Modal */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f1420] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span className="font-serif font-bold text-base text-slate-900 dark:text-white">Localização & Ficha da Obra</span>
              </div>
              <button
                onClick={() => setSelectedLivro(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-200/70 dark:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Ficha */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-36 h-52 shrink-0 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                  <EditorialCover
                    titulo={selectedLivro.titulo}
                    autor={selectedLivro.autor}
                    capaUrl={selectedLivro.capa_url}
                    categoria={selectedLivro.categoria}
                    ano={selectedLivro.ano_publicacao}
                    size="md"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 inline-block">
                    {selectedLivro.categoria}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                    {selectedLivro.titulo}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">por {sanitizarAutor(selectedLivro.autor)}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedLivro.ano_publicacao && <span>Ano: {selectedLivro.ano_publicacao}</span>}
                    {selectedLivro.paginas && <span>• {selectedLivro.paginas} páginas</span>}
                    {selectedLivro.isbn && <span>• ISBN: {selectedLivro.isbn}</span>}
                  </div>
                </div>
              </div>

              {/* CARTÃO GIGANTE DE LOCALIZAÇÃO DO EXEMPLAR */}
              <div className="p-5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Código da Prateleira / Etiqueta</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedLivro.disponiveis > 0
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                        : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
                    }`}
                  >
                    {selectedLivro.disponiveis > 0
                      ? `${selectedLivro.disponiveis} exemplares disponíveis`
                      : 'Esgotado no momento'}
                  </span>
                </div>

                {/* Código Gigante para Leitura Fácil */}
                <div className="text-center py-3 bg-white dark:bg-black/40 rounded-xl border border-amber-500/30 shadow-inner">
                  <span className="text-3xl sm:text-4xl font-mono font-black text-amber-600 dark:text-amber-300 tracking-wider">
                    {selectedLivro.codigo_interno}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Como retirar:</strong> Anote este código ou mostre esta tela ao bibliotecário/professor no balcão de atendimento para registrar seu empréstimo em instantes!
                  </p>
                </div>
              </div>

              {/* Sinopse */}
              {selectedLivro.sinopse && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Sinopse da Obra:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedLivro.sinopse}</p>
                </div>
              )}
            </div>

            {/* Rodapé de Ações */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0f1420] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedLivro(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Voltar à Lista
              </button>

              {usuarioAtual?.role === 'professor' && onEmprestarLivro && (
                <button
                  onClick={() => {
                    const l = selectedLivro;
                    setSelectedLivro(null);
                    onClose();
                    onEmprestarLivro(l);
                  }}
                  disabled={selectedLivro.disponiveis <= 0}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Emprestar Agora (Professor)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
