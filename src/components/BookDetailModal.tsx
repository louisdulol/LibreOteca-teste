import React, { useState, useEffect } from 'react';
import { Livro, UsuarioSessao, ComentarioLivro } from '../types';
import { StorageService } from '../lib/storage';
import { EditorialCover } from './EditorialCover';
import { Modal } from './Modal';
import { CoverSelectorModal } from './CoverSelectorModal';
import {
  Printer,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Star,
  MessageSquare,
  Send,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Info,
  LogIn,
  Sparkles,
} from 'lucide-react';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  livro: Livro | null;
  usuarioAtual: UsuarioSessao | null;
  onEmprestar: (livro: Livro) => void;
  onEditar: (livro: Livro) => void;
  onCommentChange?: () => void;
  onOpenLoginModal?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  livro,
  usuarioAtual,
  onEmprestar,
  onEditar,
  onCommentChange,
  onOpenLoginModal,
}) => {
  // Sincroniza livro local para refletir atualizações de capa em tempo real
  const [livroLocal, setLivroLocal] = useState<Livro | null>(livro);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Estados de comentários
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarioNota, setComentarioNota] = useState(5);
  const [feedbackComentario, setFeedbackComentario] = useState<{
    tipo: 'sucesso' | 'erro';
    mensagem: string;
    dica?: string;
  } | null>(null);

  useEffect(() => {
    setLivroLocal(livro);
  }, [livro]);

  // Se não estiver aberto ou livro não estiver carregado, não renderiza após todos os hooks terem sido chamados
  if (!isOpen || !livro || !livroLocal) return null;

  const isProfessor = usuarioAtual?.role === 'professor';

  const emprestimos = StorageService.getEmprestimosComDetalhes().filter(
    e => e.livro_id === livro.id
  );

  const comentarios = StorageService.getComentariosByLivro(livro.id);

  const handlePrintLabel = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        window.print();
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiqueta - ${livro.codigo_interno}</title>
            <style>
              body { font-family: monospace; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
              .etiqueta { border: 2px dashed #000; padding: 15px; width: 260px; text-align: center; border-radius: 6px; }
              .codigo { font-size: 20px; font-weight: bold; margin-bottom: 6px; letter-spacing: 2px; }
              .titulo { font-size: 13px; font-weight: bold; margin-bottom: 4px; }
              .autor { font-size: 11px; color: #444; margin-bottom: 8px; }
              .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 32px; letter-spacing: 4px; }
              .categoria { font-size: 10px; border-top: 1px solid #ccc; padding-top: 4px; margin-top: 6px; }
            </style>
          </head>
          <body>
            <div class="etiqueta">
              <div class="codigo">${livro.codigo_interno}</div>
              <div class="titulo">${livro.titulo}</div>
              <div class="autor">${livro.autor}</div>
              <div class="barcode">*${livro.codigo_interno}*</div>
              <div class="categoria">${livro.categoria} • LibreOteca</div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      window.print();
    }
  };

  const handleEnviarComentario = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioAtual) {
      setFeedbackComentario({
        tipo: 'erro',
        mensagem: 'Você precisa entrar na sua conta de Aluno ou Professor para publicar uma resenha.',
      });
      return;
    }

    if (!comentarioTexto.trim()) {
      setFeedbackComentario({
        tipo: 'erro',
        mensagem: 'Por favor, escreva sua opinião sobre o livro antes de enviar.',
      });
      return;
    }

    const resultado = StorageService.salvarComentario({
      livro_id: livro.id,
      leitor_id: usuarioAtual.leitor_id || usuarioAtual.id,
      autor_nome: usuarioAtual.nome,
      autor_tipo: isProfessor ? 'professor' : 'aluno',
      nota: comentarioNota,
      texto: comentarioTexto,
    });

    if (resultado.success) {
      setFeedbackComentario({
        tipo: 'sucesso',
        mensagem: resultado.message,
      });
      setComentarioTexto('');
      setComentarioNota(5);
      if (onCommentChange) onCommentChange();
      setTimeout(() => setFeedbackComentario(null), 4000);
    } else {
      setFeedbackComentario({
        tipo: 'erro',
        mensagem: resultado.message,
        dica: resultado.moderacao?.helpfulAdvice,
      });
    }
  };

  const handleCurtirComentario = (id: string) => {
    StorageService.curtirComentario(id);
    if (onCommentChange) onCommentChange();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={livro.titulo}
      subtitle={`Código de Prateleira: ${livro.codigo_interno}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Section: Capa Editorial e Metadados Principais */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="shrink-0 w-full sm:w-44 flex flex-col items-center">
            <EditorialCover
              titulo={livroLocal.titulo}
              autor={livroLocal.autor}
              capaUrl={livroLocal.capa_url}
              categoria={livroLocal.categoria}
              ano={livroLocal.ano_publicacao}
              size="lg"
              className="rounded-xl shadow-md w-40 sm:w-44 h-60"
            />
            {isProfessor && (
              <button
                type="button"
                id="btn-trocar-capa-detalhes"
                onClick={() => setIsCoverModalOpen(true)}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-2xs"
                title="Identificar e buscar capas de edições na web"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{livroLocal.capa_url ? 'Trocar Capa na Web' : 'Buscar Capa Real'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 mb-1.5">
                {livro.categoria}
              </span>
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
                {livro.titulo}
              </h4>
              <p className="text-sm text-stone-600 font-medium mt-0.5">Por {livro.autor}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
              <div>
                <span className="text-stone-400 block text-[11px]">Código Interno:</span>
                <span className="font-mono font-bold text-stone-800">{livro.codigo_interno}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">ISBN:</span>
                <span className="font-mono text-stone-800">{livro.isbn || 'Não cadastrado'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Ano de Publicação:</span>
                <span className="text-stone-800 font-medium">{livro.ano_publicacao || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Páginas / Editora:</span>
                <span className="text-stone-800 font-medium">
                  {livro.paginas ? `${livro.paginas} págs.` : ''}{' '}
                  {livro.editora ? `• ${livro.editora}` : ''}
                  {!livro.paginas && !livro.editora ? 'N/A' : ''}
                </span>
              </div>
            </div>

            {/* Disponibilidade Box */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 font-medium">Estoque do Acervo</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-lg font-bold ${
                      livro.disponiveis > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {livro.disponiveis} disponíveis
                  </span>
                  <span className="text-xs text-stone-500">de {livro.total_exemplares} total</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isProfessor ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrintLabel}
                      className="px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="Imprimir Etiqueta com Código de Barras"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Etiqueta
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEmprestar(livro);
                      }}
                      disabled={livro.disponiveis <= 0}
                      className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs active:scale-95"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Emprestar
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>
                      {livro.disponiveis > 0
                        ? 'Exemplar disponível: solicite ao professor no balcão'
                        : 'Exemplar esgotado no momento'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sinopse */}
        {livro.sinopse && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
            <span className="font-bold text-stone-800 block mb-1">Sinopse da Obra</span>
            <p className="text-stone-600 leading-relaxed">{livro.sinopse}</p>
          </div>
        )}

        {/* SEÇÃO DE COMENTÁRIOS E RESENHAS DOS ALUNOS COM FILTRO */}
        <div className="space-y-4 pt-3 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-800" />
              <span>Opiniões & Comentários ({comentarios.length})</span>
            </h5>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Filtro de Conteúdo Ativo</span>
            </div>
          </div>

          {/* Feedback de envio de comentário */}
          {feedbackComentario && (
            <div
              className={`p-3.5 rounded-xl text-xs space-y-1.5 animate-in fade-in ${
                feedbackComentario.tipo === 'sucesso'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-300 ring-2 ring-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {feedbackComentario.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span>{feedbackComentario.mensagem}</span>
              </div>
              {feedbackComentario.dica && (
                <p className="text-[11px] font-medium text-rose-800 pl-6 leading-relaxed">
                  💡 <strong>Orientações:</strong> {feedbackComentario.dica}
                </p>
              )}
            </div>
          )}

          {/* Formulário para Deixar Comentário */}
          {usuarioAtual ? (
            <form
              onSubmit={handleEnviarComentario}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-800">
                  Escreva sua avaliação sobre este livro:
                </span>

                {/* Seletor de Estrelas */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 mr-1">Sua nota:</span>
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setComentarioNota(st)}
                      className="p-1 hover:scale-115 transition-transform"
                      title={`${st} estrela(s)`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          st <= comentarioNota
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={comentarioTexto}
                onChange={e => setComentarioTexto(e.target.value)}
                placeholder={`Escreva sua resenha respeitosa como ${usuarioAtual.nome} (${usuarioAtual.role}). Compartilhe o que achou da história...`}
                className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400 text-stone-900"
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-stone-500">
                  Filtro pedagógico automático: termos ofensivos ou desrespeitosos são bloqueados.
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Resenha</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-xs text-stone-700">
                  Faça login para avaliar este livro e compartilhar sua resenha com os outros alunos!
                </span>
              </div>
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Entrar
                </button>
              )}
            </div>
          )}

          {/* Lista de Comentários Aprovados */}
          {comentarios.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500 bg-white rounded-xl border border-dashed border-stone-200">
              Nenhum comentário publicado para esta obra ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comentarios.map((c: ComentarioLivro) => (
                <div
                  key={c.id}
                  className="p-3 bg-white border border-stone-200 rounded-xl text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{c.autor_nome}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                        {c.autor_tipo.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          className={`w-3 h-3 ${
                            st <= c.nota ? 'text-amber-500 fill-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-stone-700 italic">"{c.texto}"</p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                    <span>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => handleCurtirComentario(c.id)}
                      className="flex items-center gap-1 text-rose-700 hover:text-rose-800 font-semibold"
                    >
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>{c.curtidas || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Empréstimos desta Obra (Apenas para Professor) */}
        {isProfessor && (
          <div className="pt-3 border-t border-stone-200">
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Histórico de Empréstimos deste Livro ({emprestimos.length})
            </h5>

            {emprestimos.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                Nenhum empréstimo registrado para este exemplar ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {emprestimos.map(emp => {
                  const emAberto = emp.devolvido_em === null;
                  return (
                    <div
                      key={emp.id}
                      className="p-2.5 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-900">
                            {emp.leitor?.nome || 'Leitor Removido'}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            ({emp.leitor?.matricula || '-'})
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Emprestado em: {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')} •
                          Devolução: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div>
                        {emAberto ? (
                          emp.atrasado ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Atrasado ({emp.dias_atraso}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Em Aberto
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Devolvido
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          {isProfessor ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditar(livro);
              }}
              className="text-xs text-stone-600 hover:text-stone-900 underline font-medium"
            >
              Editar cadastro desta obra
            </button>
          ) : (
            <span className="text-xs text-stone-400">LibreOteca • Acesso do Aluno</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      <CoverSelectorModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        onSelectCover={(newCoverUrl) => {
          const updated = StorageService.saveLivro({
            ...livroLocal,
            capa_url: newCoverUrl,
          });
          setLivroLocal(updated);
          if (onCommentChange) onCommentChange();
        }}
        titulo={livroLocal.titulo}
        autor={livroLocal.autor}
        isbn={livroLocal.isbn}
        capaAtual={livroLocal.capa_url}
      />
    </Modal>
  );
};
