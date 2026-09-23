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
          <title>Etiqueta - ${livro.titulo}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; text-align: center; }
            .label { border: 2px solid #000; padding: 15px; max-width: 300px; margin: 0 auto; border-radius: 8px; }
            .code { font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px; }
            .title { font-size: 14px; font-weight: bold; margin: 8px 0 4px; }
            .author { font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="code">${livro.codigo_interno}</div>
            <div class="title">${livro.titulo}</div>
            <div class="author">${livro.autor}</div>
            <div style="font-size: 10px; margin-top: 8px; color: #777;">LibreOteca • Acervo</div>
          </div>
          <script>window.print(); window.close();</script>
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
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }

    if (!comentarioTexto.trim()) {
      setFeedbackComentario({
        tipo: 'erro',
        mensagem: 'Por favor, escreva uma resenha ou comentário sobre a obra.',
      });
      return;
    }

    const resultado = StorageService.adicionarComentario({
      livro_id: livro.id,
      leitor_id: usuarioAtual.leitor_id || usuarioAtual.id,
      autor_nome: usuarioAtual.nome,
      autor_tipo: usuarioAtual.role === 'professor' ? 'professor' : 'aluno',
      nota: comentarioNota,
      texto: comentarioTexto.trim(),
    });

    if (resultado.success) {
      setComentarioTexto('');
      setFeedbackComentario({
        tipo: 'sucesso',
        mensagem: resultado.message,
      });
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
      <div className="space-y-6 text-slate-800 dark:text-slate-200">
        {/* Top Section: Capa Editorial e Metadados Principais */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0 w-full sm:w-44 flex flex-col items-center">
            <EditorialCover
              titulo={livroLocal.titulo}
              autor={livroLocal.autor}
              capaUrl={livroLocal.capa_url}
              categoria={livroLocal.categoria}
              ano={livroLocal.ano_publicacao}
              size="lg"
              className="rounded-2xl shadow-xl w-40 sm:w-44 h-60 border border-slate-200 dark:border-slate-700/60"
            />
            {isProfessor && (
              <button
                type="button"
                id="btn-trocar-capa-detalhes"
                onClick={() => setIsCoverModalOpen(true)}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 transition-colors shadow-xs cursor-pointer"
                title="Identificar e buscar capas de edições na web"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{livroLocal.capa_url ? 'Trocar Capa na Web' : 'Buscar Capa Real'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-2">
                {livro.categoria}
              </span>
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                {livro.titulo}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Por {livro.autor}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">Código Interno:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{livro.codigo_interno}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">ISBN:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{livro.isbn || 'Não cadastrado'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">Ano de Publicação:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{livro.ano_publicacao || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium">Páginas / Editora:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {livro.paginas ? `${livro.paginas} págs.` : ''}{' '}
                  {livro.editora ? `• ${livro.editora}` : ''}
                  {!livro.paginas && !livro.editora ? 'N/A' : ''}
                </span>
              </div>
            </div>

            {/* Disponibilidade Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estoque do Acervo</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-lg font-bold ${
                      livro.disponiveis > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {livro.disponiveis} disponíveis
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">de {livro.total_exemplares} total</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isProfessor ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePrintLabel}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Imprimir Etiqueta com Código de Barras"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Etiqueta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEmprestar(livro);
                      }}
                      disabled={livro.disponiveis <= 0}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Emprestar</span>
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Sinopse da Obra</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{livro.sinopse}</p>
          </div>
        )}

        {/* SEÇÃO DE COMENTÁRIOS E RESENHAS */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Opiniões & Comentários ({comentarios.length})</span>
            </h5>
          </div>

          {/* Feedback de envio de comentário */}
          {feedbackComentario && (
            <div
              className={`p-3.5 rounded-xl text-xs space-y-1.5 animate-in fade-in ${
                feedbackComentario.tipo === 'sucesso'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {feedbackComentario.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>{feedbackComentario.mensagem}</span>
              </div>
              {feedbackComentario.dica && (
                <p className="text-[11px] font-medium pl-6 leading-relaxed">
                  💡 <strong>Orientações:</strong> {feedbackComentario.dica}
                </p>
              )}
            </div>
          )}

          {/* Formulário para Deixar Comentário */}
          {usuarioAtual ? (
            <form
              onSubmit={handleEnviarComentario}
              className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  Escreva sua avaliação sobre este livro:
                </span>

                {/* Seletor de Estrelas */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Sua nota:</span>
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setComentarioNota(st)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                      title={`${st} estrela(s)`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          st <= comentarioNota
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
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
                className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Filtro pedagógico automático: termos ofensivos são bloqueados.
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Resenha</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                  Faça login para avaliar este livro e compartilhar sua resenha com os outros alunos!
                </span>
              </div>
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          )}

          {/* Lista de Comentários */}
          {comentarios.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Nenhum comentário publicado para esta obra ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comentarios.map((c: ComentarioLivro) => (
                <div
                  key={c.id}
                  className="p-3 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{c.autor_nome}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                        {c.autor_tipo.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          className={`w-3 h-3 ${
                            st <= c.nota ? 'text-amber-500 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 italic">"{c.texto}"</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</span>
                    <button
                      type="button"
                      onClick={() => handleCurtirComentario(c.id)}
                      className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
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
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Histórico de Empréstimos deste Livro ({emprestimos.length})</span>
            </h5>

            {emprestimos.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Nenhum empréstimo registrado para este exemplar ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {emprestimos.map(emp => {
                  const emAberto = emp.devolvido_em === null;
                  return (
                    <div
                      key={emp.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {emp.leitor?.nome || 'Leitor Removido'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            ({emp.leitor?.matricula || '-'})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Emprestado em: {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')} •
                          Devolução: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div>
                        {emAberto ? (
                          emp.atrasado ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              Atrasado ({emp.dias_atraso}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Em Aberto
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          {isProfessor ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditar(livro);
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
            >
              Editar cadastro desta obra
            </button>
          ) : (
            <span className="text-xs text-slate-400">LibreOteca • Acesso do Aluno</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
