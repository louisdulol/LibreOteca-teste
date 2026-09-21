import React, { useState, useEffect } from 'react';
import { Livro } from '../types';
import { StorageService } from '../lib/storage';
import { identifyBookOnline, IdentifiedBook } from '../lib/bookIdentifier';
import { livroSchema } from '../lib/validations';
import { Modal } from './Modal';
import { CoverSelectorModal } from './CoverSelectorModal';
import { Search, Loader2, Sparkles, BookOpen, AlertCircle, Check, Globe, Layers, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (livro: Livro) => void;
  livroParaEditar?: Livro | null;
}

const CATEGORIAS_PADRAO = [
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Ficção e Romance',
  'Poesia e Contos',
  'Infanto-Juvenil',
  'História e Sociedade',
  'Ciências e Tecnologia',
  'Biografia e Memórias',
  'Didático e Educação',
  'Quadrinhos e HQ',
  'Filosofia e Psicologia',
  'Artes e Cultura',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  livroParaEditar,
}) => {
  const [formData, setFormData] = useState({
    isbn: '',
    codigo_interno: '',
    titulo: '',
    autor: '',
    categoria: 'Literatura Brasileira',
    capa_url: '',
    total_exemplares: 1,
    disponiveis: 1,
    ano_publicacao: '' as string | number,
    paginas: '' as string | number,
    editora: '',
    sinopse: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [candidateBooks, setCandidateBooks] = useState<IdentifiedBook[]>([]);
  const [availableCovers, setAvailableCovers] = useState<string[]>([]);
  const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
      setFeedback(null);
      setCandidateBooks([]);
      setAvailableCovers([]);
      setSearchQuery('');

      if (livroParaEditar) {
        setFormData({
          isbn: livroParaEditar.isbn || '',
          codigo_interno: livroParaEditar.codigo_interno,
          titulo: livroParaEditar.titulo,
          autor: livroParaEditar.autor,
          categoria: livroParaEditar.categoria,
          capa_url: livroParaEditar.capa_url || '',
          total_exemplares: livroParaEditar.total_exemplares,
          disponiveis: livroParaEditar.disponiveis,
          ano_publicacao: livroParaEditar.ano_publicacao || '',
          paginas: livroParaEditar.paginas || '',
          editora: livroParaEditar.editora || '',
          sinopse: livroParaEditar.sinopse || '',
        });
        if (livroParaEditar.capa_url) {
          setAvailableCovers([livroParaEditar.capa_url]);
        }
      } else {
        const proximoCodigo = StorageService.gerarProximoCodigoInterno();
        setFormData({
          isbn: '',
          codigo_interno: proximoCodigo,
          titulo: '',
          autor: '',
          categoria: 'Literatura Brasileira',
          capa_url: '',
          total_exemplares: 1,
          disponiveis: 1,
          ano_publicacao: '',
          paginas: '',
          editora: '',
          sinopse: '',
        });
      }
    }
  }, [isOpen, livroParaEditar]);

  const handleApplyIdentifiedBook = (book: IdentifiedBook) => {
    setFormData(prev => ({
      ...prev,
      titulo: book.titulo || prev.titulo,
      autor: book.autor || prev.autor,
      isbn: book.isbn || prev.isbn,
      categoria: book.categoria || prev.categoria,
      sinopse: book.sinopse || prev.sinopse,
      ano_publicacao: book.ano_publicacao || prev.ano_publicacao,
      paginas: book.paginas || prev.paginas,
      editora: book.editora || prev.editora,
      capa_url: book.capa_url || prev.capa_url,
    }));

    if (book.capas_disponiveis && book.capas_disponiveis.length > 0) {
      setAvailableCovers(book.capas_disponiveis);
    } else if (book.capa_url) {
      setAvailableCovers([book.capa_url]);
    }

    setCandidateBooks([]);
    setFeedback({
      type: 'success',
      message: `Livro "${book.titulo}" identificado via ${book.fonte}! Dados e sinopse preenchidos automaticamente.`,
    });
  };

  const handleIdentifyBook = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = (searchQuery || formData.isbn || formData.titulo).trim();

    if (!query) {
      setFeedback({
        type: 'error',
        message: 'Digite o título, autor ou código ISBN para buscar na internet.',
      });
      return;
    }

    setIsIdentifying(true);
    setFeedback(null);
    setCandidateBooks([]);

    try {
      const results = await identifyBookOnline(query);
      if (results.length === 0) {
        setFeedback({
          type: 'error',
          message: `Nenhum livro localizado para "${query}". Tente buscar por outro termo ou preencha manualmente.`,
        });
      } else if (results.length === 1) {
        handleApplyIdentifiedBook(results[0]);
      } else {
        setCandidateBooks(results);
        setFeedback({
          type: 'info',
          message: `Encontramos ${results.length} edições na internet. Selecione a obra desejada abaixo:`,
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Falha momentânea ao conectar com o serviço de livros. Você pode preencher os dados manualmente.',
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const rawData = {
      ...formData,
      total_exemplares: Number(formData.total_exemplares),
      disponiveis: Number(formData.disponiveis),
      ano_publicacao: formData.ano_publicacao ? Number(formData.ano_publicacao) : undefined,
      paginas: formData.paginas ? Number(formData.paginas) : undefined,
    };

    const parseResult = livroSchema.safeParse(rawData);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    try {
      const saved = StorageService.saveLivro({
        ...rawData,
        id: livroParaEditar?.id,
      });
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar livro';
      setValidationErrors({ form: errorMsg });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={livroParaEditar ? 'Editar Livro do Acervo' : 'Cadastrar Livro no Acervo'}
      subtitle="Identificação automática na web: busca sinopse, capa, páginas, ano e autor"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Identificador Inteligente de Livros */}
        <div className="p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-stone-200 uppercase tracking-wider">
                Identificador Automático na Internet
              </span>
            </div>
            <span className="text-[11px] text-stone-400">Google Books & Open Library</span>
          </div>

          <p className="text-xs text-stone-300 mb-3 leading-relaxed">
            Digite o <strong>título</strong>, <strong>autor</strong> ou o código <strong>ISBN</strong> do livro. O sistema consultará as bases mundiais e preencherá a sinopse, capa, páginas e ano em 1 clique.
          </p>

          <form onSubmit={handleIdentifyBook} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="input-identificar-livro"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ex: O Menino Maluquinho, 9788535914849, Grande Sertão Veredas..."
                className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              id="btn-identificar-web"
              disabled={isIdentifying}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs disabled:opacity-50"
            >
              {isIdentifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Buscando dados...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Identificar Livro
                </>
              )}
            </button>
          </form>

          {/* Feedback de busca */}
          {feedback && (
            <div
              className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : feedback.type === 'error'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'bg-amber-950/80 text-amber-200 border border-amber-800'
              }`}
            >
              {feedback.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {feedback.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Seleção de livros candidatos encontrados */}
          {candidateBooks.length > 0 && (
            <div className="mt-3.5 space-y-2 max-h-56 overflow-y-auto pr-1">
              {candidateBooks.map((cand, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 rounded-lg flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cand.capa_url ? (
                      <img
                        src={cand.capa_url}
                        alt={cand.titulo}
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 object-cover rounded-xs border border-stone-600 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-stone-700 rounded-xs flex items-center justify-center text-stone-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{cand.titulo}</h4>
                      <p className="text-[11px] text-stone-300 truncate">
                        {cand.autor} {cand.ano_publicacao ? `• ${cand.ano_publicacao}` : ''} {cand.paginas ? `• ${cand.paginas} págs` : ''}
                      </p>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        {cand.sinopse || 'Sem sinopse disponível'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyIdentifiedBook(cand)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-md text-xs shrink-0 flex items-center gap-1 transition-colors"
                  >
                    Usar Este
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationErrors.form}</span>
            </div>
          )}

          {/* Código interno e ISBN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Código de Tombo / Patrimônio <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  id="input-codigo-interno"
                  value={formData.codigo_interno}
                  onChange={e => setFormData({ ...formData, codigo_interno: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {!livroParaEditar && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, codigo_interno: StorageService.gerarProximoCodigoInterno() })
                    }
                    className="px-2.5 py-1.5 bg-stone-150 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-medium shrink-0 transition-colors border border-stone-200"
                    title="Gerar código sequencial automático"
                  >
                    Gerar
                  </button>
                )}
              </div>
              {validationErrors.codigo_interno && (
                <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.codigo_interno}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ISBN (Identificador Internacional)
              </label>
              <input
                type="text"
                id="input-isbn"
                placeholder="Ex: 9788535914849"
                value={formData.isbn}
                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Título e Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Título do Livro <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                id="input-titulo-livro"
                placeholder="Ex: Dom Casmurro"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-serif font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {validationErrors.titulo && (
                <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.titulo}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Autor(es) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                id="input-autor-livro"
                placeholder="Ex: Machado de Assis"
                value={formData.autor}
                onChange={e => setFormData({ ...formData, autor: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {validationErrors.autor && (
                <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.autor}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Categoria / Gênero <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-categoria-livro"
                value={formData.categoria}
                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIAS_PADRAO.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!CATEGORIAS_PADRAO.includes(formData.categoria) && formData.categoria && (
                  <option value={formData.categoria}>{formData.categoria}</option>
                )}
              </select>
            </div>
          </div>

          {/* Exemplares e Estoque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Total de Exemplares Físicos <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                id="input-total-exemplares"
                value={formData.total_exemplares}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setFormData(prev => ({
                    ...prev,
                    total_exemplares: val,
                    disponiveis: livroParaEditar ? Math.min(prev.disponiveis, val) : val,
                  }));
                }}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {validationErrors.total_exemplares && (
                <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.total_exemplares}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Exemplares Disponíveis para Empréstimo
              </label>
              <input
                type="number"
                min="0"
                max={formData.total_exemplares}
                required
                id="input-disponiveis"
                value={formData.disponiveis}
                onChange={e =>
                  setFormData({ ...formData, disponiveis: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {validationErrors.disponiveis && (
                <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.disponiveis}</p>
              )}
            </div>
          </div>

          {/* Metadados adicionais: Ano, Páginas, Editora */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Ano de Lançamento</label>
              <input
                type="number"
                placeholder="Ex: 1899"
                id="input-ano"
                value={formData.ano_publicacao}
                onChange={e => setFormData({ ...formData, ano_publicacao: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Nº de Páginas</label>
              <input
                type="number"
                placeholder="Ex: 256"
                id="input-paginas"
                value={formData.paginas}
                onChange={e => setFormData({ ...formData, paginas: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Editora</label>
              <input
                type="text"
                placeholder="Ex: Record, Companhia das Letras..."
                id="input-editora"
                value={formData.editora}
                onChange={e => setFormData({ ...formData, editora: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Capa com Identificador Real */}
          <div className="p-3.5 bg-stone-50 border border-stone-200/90 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                Capa do Livro
              </label>
              <button
                type="button"
                id="btn-abrir-seletor-capa"
                onClick={() => setIsCoverSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Buscar Capas Reais na Web
              </button>
            </div>

            <div className="flex gap-3 items-center">
              {formData.capa_url ? (
                <div className="relative w-14 h-20 rounded-md overflow-hidden bg-stone-200 border border-stone-300 shrink-0 shadow-xs group">
                  <img
                    src={formData.capa_url}
                    alt="Capa selecionada"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => setIsCoverSelectorOpen(true)}
                      className="text-[10px] text-white font-bold bg-amber-800 px-1.5 py-0.5 rounded"
                    >
                      Trocar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsCoverSelectorOpen(true)}
                  className="w-14 h-20 rounded-md border-2 border-dashed border-stone-300 hover:border-amber-600 bg-white flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 cursor-pointer shrink-0 transition-colors"
                  title="Clique para buscar a capa oficial"
                >
                  <ImageIcon className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Sem capa</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    id="input-capa-url"
                    placeholder="URL da capa ou clique no botão para buscar automaticamente"
                    value={formData.capa_url}
                    onChange={e => setFormData({ ...formData, capa_url: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  {formData.capa_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, capa_url: '' })}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 border border-stone-200"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  O sistema busca automaticamente capas reais de edições brasileiras no Google Books e Open Library.
                </p>
              </div>
            </div>

            {/* Alternativas de capa identificadas */}
            {availableCovers.length > 1 && (
              <div className="pt-2 border-t border-stone-200/60">
                <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                  Capas adicionais desta obra identificadas na web:
                </span>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {availableCovers.map((capa, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, capa_url: capa })}
                      className={`relative rounded-md overflow-hidden shrink-0 border-2 transition-transform hover:scale-105 ${
                        formData.capa_url === capa ? 'border-amber-800 shadow-sm ring-1 ring-amber-800' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={capa}
                        alt="Capa alternativa"
                        referrerPolicy="no-referrer"
                        className="w-11 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sinopse */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinopse Completa / Descrição da Obra
            </label>
            <textarea
              rows={3}
              id="textarea-sinopse"
              placeholder="A sinopse é preenchida automaticamente ao identificar na internet, ou você pode escrever uma apresentação personalizada para os leitores..."
              value={formData.sinopse}
              onChange={e => setFormData({ ...formData, sinopse: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Rodapé com botões de ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              id="btn-cancelar-livro"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-salvar-livro"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-all active:scale-98"
            >
              {livroParaEditar ? 'Salvar Alterações' : 'Confirmar e Cadastrar Livro'}
            </button>
          </div>
        </form>
      </div>

      <CoverSelectorModal
        isOpen={isCoverSelectorOpen}
        onClose={() => setIsCoverSelectorOpen(false)}
        onSelectCover={url => setFormData(prev => ({ ...prev, capa_url: url }))}
        titulo={formData.titulo}
        autor={formData.autor}
        isbn={formData.isbn}
        capaAtual={formData.capa_url}
      />
    </Modal>
  );
};
