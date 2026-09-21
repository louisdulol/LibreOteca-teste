import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { findRealBookCovers, RealCoverOption, probeImage } from '../lib/coverFinder';
import { Search, Loader2, Sparkles, Image as ImageIcon, Upload, Check, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface CoverSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (coverUrl: string) => void;
  titulo?: string;
  autor?: string;
  isbn?: string;
  capaAtual?: string;
}

export const CoverSelectorModal: React.FC<CoverSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCover,
  titulo = '',
  autor = '',
  isbn = '',
  capaAtual = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [covers, setCovers] = useState<RealCoverOption[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>(capaAtual);
  const [manualUrl, setManualUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'busca' | 'link' | 'upload'>('busca');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(capaAtual);
      setManualUrl('');
      setUploadError(null);
      const initialTerm = (titulo ? `${titulo} ${autor}` : isbn || '').trim();
      setSearchTerm(initialTerm);

      if (initialTerm || isbn) {
        performSearch(initialTerm, isbn);
      } else {
        setCovers([]);
      }
    }
  }, [isOpen, titulo, autor, isbn, capaAtual]);

  const performSearch = async (termToSearch: string, isbnToSearch?: string) => {
    setIsLoading(true);
    setSearchFeedback(null);
    try {
      const results = await findRealBookCovers({
        titulo: termToSearch || titulo,
        autor,
        isbn: isbnToSearch || isbn,
        termoLivre: termToSearch,
      });

      setCovers(results);
      if (results.length === 0) {
        setSearchFeedback('Nenhuma capa encontrada para esta busca. Tente buscar por outros termos, colar um link ou carregar um arquivo.');
      }
    } catch {
      setSearchFeedback('Falha na consulta às bases de capas. Você pode inserir um link direto ou carregar uma imagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    performSearch(searchTerm.trim());
  };

  const handleApplyManualUrl = async () => {
    if (!manualUrl.trim()) return;
    setIsLoading(true);
    const works = await probeImage(manualUrl.trim());
    setIsLoading(false);
    if (!works) {
      setUploadError('A imagem não pôde ser carregada a partir deste link. Verifique se o endereço está correto e é público.');
      return;
    }
    setSelectedUrl(manualUrl.trim());
    onSelectCover(manualUrl.trim());
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedUrl(reader.result);
        onSelectCover(reader.result);
        onClose();
      }
    };
    reader.onerror = () => {
      setUploadError('Erro ao ler o arquivo selecionado.');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSelection = (url: string) => {
    setSelectedUrl(url);
    onSelectCover(url);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Identificar e Selecionar Capa Real"
      subtitle="Busca nas bases do Google Books e Open Library com capas de edições brasileiras e mundiais"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Navegação de Métodos de Capa */}
        <div className="flex border-b border-stone-200 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('busca')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
              activeTab === 'busca'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Buscar Capas na Web
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
              activeTab === 'link'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Colar Link de Imagem (URL)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
              activeTab === 'upload'
                ? 'border-amber-800 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Enviar Imagem do Dispositivo
          </button>
        </div>

        {/* Aba 1: Busca Automática na Web */}
        {activeTab === 'busca' && (
          <div className="space-y-3">
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por título, autor ou ISBN..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Localizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Buscar Capas
                  </>
                )}
              </button>
            </form>

            {searchFeedback && (
              <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{searchFeedback}</span>
              </div>
            )}

            {/* Grid de Capas Encontradas */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
                <p className="text-xs font-semibold text-stone-700">
                  Pesquisando edições nos catálogos mundiais e verificando qualidade...
                </p>
                <p className="text-[11px] text-stone-400">
                  Descartando automaticamente links quebrados e páginas vazias
                </p>
              </div>
            ) : covers.length > 0 ? (
              <div>
                <p className="text-[11px] text-stone-500 font-medium mb-2.5">
                  Encontramos {covers.length} opções de capa real para este livro. Clique na edição desejada para aplicar:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                  {covers.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleConfirmSelection(c.url)}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:shadow-md ${
                        selectedUrl === c.url
                          ? 'border-amber-800 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-amber-400'
                      }`}
                    >
                      <div className="relative w-24 h-36 rounded-md overflow-hidden bg-stone-100 shadow-xs mb-2">
                        <img
                          src={c.url}
                          alt={c.tituloEdicao || 'Capa'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {selectedUrl === c.url && (
                          <div className="absolute inset-0 bg-amber-900/30 backdrop-blur-2xs flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-amber-800 text-white flex items-center justify-center shadow-md">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center">
                        <span className="block text-[11px] font-bold text-stone-900 truncate" title={c.editora || c.tituloEdicao}>
                          {c.editora || 'Edição Comercial'}
                        </span>
                        <span className="block text-[10px] text-stone-500 truncate">
                          {c.ano ? `${c.ano} • ` : ''}{c.fonte}
                        </span>
                        <button
                          type="button"
                          className={`mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            selectedUrl === c.url
                              ? 'bg-amber-800 text-white'
                              : 'bg-stone-100 group-hover:bg-amber-800 group-hover:text-white text-stone-700'
                          }`}
                        >
                          {selectedUrl === c.url ? 'Selecionada' : 'Usar Esta Capa'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Aba 2: Colar Link Direto */}
        {activeTab === 'link' && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-stone-600">
              Copie o endereço de imagem da capa em qualquer site (Amazon, Skoob, livrarias, Google Imagens) e cole abaixo:
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => {
                  setManualUrl(e.target.value);
                  setUploadError(null);
                }}
                placeholder="https://exemplo.com/capa-do-livro.jpg"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleApplyManualUrl}
                disabled={!manualUrl.trim() || isLoading}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Aplicar Imagem
              </button>
            </div>
            {uploadError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Aba 3: Upload do Arquivo Local */}
        {activeTab === 'upload' && (
          <div className="space-y-3 py-2">
            <label className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-2 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-stone-800">
                Clique para selecionar a imagem da capa do livro
              </span>
              <span className="text-[11px] text-stone-500 mt-0.5">
                PNG, JPG ou WebP até 5MB (será salva localmente na biblioteca)
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Botão de Fechar */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedUrl('');
              onSelectCover('');
              onClose();
            }}
            className="text-xs text-stone-500 hover:text-rose-600 font-medium"
          >
            Remover capa existente
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
