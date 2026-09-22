import React, { useState } from 'react';
import { Livro } from '../types';
import { searchOpenLibrary, OpenLibraryBookDetails } from '../lib/openlibrary';
import { StorageService } from '../lib/storage';
import { Modal } from './Modal';
import { Search, Loader2, BookOpen, Plus, Check, Globe } from 'lucide-react';

interface OpenLibraryExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookImported: (livro: Livro) => void;
}

export const OpenLibraryExplorerModal: React.FC<OpenLibraryExplorerModalProps> = ({
  isOpen,
  onClose,
  onBookImported,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibraryBookDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importedIndices, setImportedIndices] = useState<Record<number, boolean>>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchOpenLibrary(query);
      setResults(data);
      setImportedIndices({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (book: OpenLibraryBookDetails, index: number) => {
    const proximoCodigo = StorageService.gerarProximoCodigoInterno();
    const novoLivro = StorageService.saveLivro({
      codigo_interno: proximoCodigo,
      isbn: book.isbn,
      titulo: book.titulo,
      autor: book.autor,
      categoria: book.categoria || 'Geral',
      capa_url: book.capa_url,
      total_exemplares: 2,
      disponiveis: 2,
      ano_publicacao: book.ano_publicacao,
      paginas: book.paginas,
      editora: book.editora,
      sinopse: book.sinopse,
    });

    setImportedIndices(prev => ({ ...prev, [index]: true }));
    onBookImported(novoLivro);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explorador Global Open Library"
      subtitle="Pesquise no catálogo mundial aberto e adicione livros ao acervo local com 1 clique"
      maxWidth="3xl"
      zIndex="z-[80]"
    >
      <div className="space-y-4">
        {/* Formulário de Busca */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Digite título, autor ou tema (ex: Clarice Lispector, Grande Sertão, Dom Casmurro...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>Pesquisar</span>
          </button>
        </form>

        {/* Sugestões rápidas */}
        {!hasSearched && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <BookOpen className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2 opacity-90" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Pesquise por qualquer livro indexado pela Internet Archive e Open Library.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {['Machado de Assis', 'Guimarães Rosa', 'Conceição Evaristo', 'Harry Potter', 'Pequeno Príncipe', 'Ciência'].map(termo => (
                <button
                  key={termo}
                  onClick={() => {
                    setQuery(termo);
                    // Dispara a busca
                    setTimeout(() => {
                      setIsLoading(true);
                      setHasSearched(true);
                      searchOpenLibrary(termo).then(res => {
                        setResults(res);
                        setIsLoading(false);
                      });
                    }, 50);
                  }}
                  className="px-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-lg text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  {termo}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500 dark:text-amber-400" />
            <p className="text-xs">Consultando Open Library API em tempo real...</p>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Nenhum livro encontrado para "{query}".</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente pesquisar usando outros termos ou cadastre manualmente pelo formulário do acervo.
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
              <span>{results.length} resultados encontrados</span>
              <span>Clique em importar para adicionar 2 exemplares ao acervo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((book, idx) => {
                const isImported = importedIndices[idx];
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 flex gap-3 items-center justify-between transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {book.capa_url ? (
                        <img
                          src={book.capa_url}
                          alt={book.titulo}
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 object-cover rounded-lg bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://placehold.co/80x120?text=Livro';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-lg bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <h5
                          className="text-xs font-serif font-bold text-slate-900 dark:text-white truncate"
                          title={book.titulo}
                        >
                          {book.titulo}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{book.autor}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {book.ano_publicacao && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {book.ano_publicacao}
                            </span>
                          )}
                          {book.isbn && (
                            <span className="text-[10px] text-slate-500 font-mono truncate">
                              ISBN: {book.isbn}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleImport(book, idx)}
                      disabled={isImported}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isImported
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm active:scale-95'
                      }`}
                    >
                      {isImported ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Adicionado</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Importar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
