import React, { useState, useMemo } from 'react';
import { UsuarioSessao, Livro } from '../types';
import { StorageService } from '../lib/storage';
import { Modal } from './Modal';
import {
  MessageSquare,
  Star,
  Heart,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

interface MuralComentariosViewProps {
  usuario: UsuarioSessao | null;
  onVerDetalhesLivro: (livro: Livro) => void;
  onRefresh: () => void;
}

export const MuralComentariosView: React.FC<MuralComentariosViewProps> = ({
  usuario,
  onVerDetalhesLivro,
  onRefresh,
}) => {
  const isProfessor = usuario?.role === 'professor';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState('todos');
  const [modoAbaProfessor, setModoAbaProfessor] = useState<'aprovados' | 'bloqueados_filtro'>('aprovados');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [comentarioParaRemover, setComentarioParaRemover] = useState<string | null>(null);

  const livros = StorageService.getLivros();
  const todosComentarios = StorageService.getComentarios();
  const auditoria = StorageService.getAuditoria();

  // Tentativas barradas pelo filtro capturadas na auditoria
  const tentativasBarradas = useMemo(() => {
    return auditoria.filter(a => a.acao === 'COMENTARIO_BLOQUEADO_FILTRO');
  }, [auditoria]);

  const comentariosFiltrados = useMemo(() => {
    return todosComentarios.filter(c => {
      if (c.status !== 'aprovado' && !isProfessor) return false;
      if (modoAbaProfessor === 'aprovados' && c.status !== 'aprovado') return false;

      if (selectedBookFilter !== 'todos' && c.livro_id !== selectedBookFilter) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const livro = livros.find(l => l.id === c.livro_id);
        const matchAutor = c.autor_nome.toLowerCase().includes(term);
        const matchTexto = c.texto.toLowerCase().includes(term);
        const matchLivro = livro?.titulo.toLowerCase().includes(term);
        if (!matchAutor && !matchTexto && !matchLivro) return false;
      }

      return true;
    });
  }, [todosComentarios, selectedBookFilter, searchTerm, modoAbaProfessor, isProfessor, livros]);

  const handleCurtir = (comentarioId: string) => {
    StorageService.curtirComentario(comentarioId);
    onRefresh();
  };

  const confirmarRemocao = () => {
    if (!comentarioParaRemover) return;
    StorageService.moderarComentario(comentarioParaRemover, 'removido_professor');
    setFeedback('Comentário removido do mural da biblioteca.');
    setComentarioParaRemover(null);
    onRefresh();
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Informativo */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Mural de Leitores & Resenhas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">
              Comentários de Alunos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Veja o que outros alunos e leitores acharam das obras do acervo. Todos os comentários passam por filtro
            automático de respeito pedagógico.
          </p>
        </div>

        {/* Badge do Filtro Anti-Maldades */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Filtro de Respeito Escolar Ativo</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Controles do Professor (Abas de Moderação) */}
      {isProfessor && (
        <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold text-stone-900">Painel de Moderação do Professor:</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModoAbaProfessor('aprovados')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                modoAbaProfessor === 'aprovados'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Comentários Aprovados ({todosComentarios.filter(c => c.status === 'aprovado').length})
            </button>

            <button
              onClick={() => setModoAbaProfessor('bloqueados_filtro')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                modoAbaProfessor === 'bloqueados_filtro'
                  ? 'bg-rose-800 text-white shadow-2xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Tentativas Bloqueadas ({tentativasBarradas.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Seção quando o professor escolhe ver tentativas bloqueadas pelo filtro */}
      {isProfessor && modoAbaProfessor === 'bloqueados_filtro' ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Tentativas de Comentários Bloqueadas pelo Filtro Escolar ({tentativasBarradas.length})
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Estes comentários foram barrados automaticamente antes de chegarem ao ar para proteger a comunidade
            escolar contra ofensas ou bullying.
          </p>

          {tentativasBarradas.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              Nenhuma tentativa de comentário inadequado registrada até o momento. Comunidade exemplar!
            </div>
          ) : (
            <div className="space-y-3">
              {tentativasBarradas.map(tentativa => {
                const livro = livros.find(l => l.id === tentativa.registro_id);

                return (
                  <div
                    key={tentativa.id}
                    className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                        Obra: {livro?.titulo || 'Livro do Acervo'}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {new Date(tentativa.criado_em).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-stone-700">{tentativa.detalhes}</p>
                    <div className="pt-1 text-[11px] text-rose-700 font-medium">
                      Status: Bloqueado pelo Filtro Pedagógico do LibreOteca
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Lista Normal de Comentários Aprovados */
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por livro, aluno ou palavra..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-500 shrink-0" />
              <select
                value={selectedBookFilter}
                onChange={e => setSelectedBookFilter(e.target.value)}
                className="w-full sm:w-60 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="todos">Todos os livros comentados</option>
                {livros.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards de Comentários */}
          {comentariosFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-stone-200 rounded-2xl space-y-2">
              <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
              <h4 className="font-serif font-bold text-stone-800 text-sm">
                Nenhum comentário encontrado para estes filtros.
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Seja o primeiro a opinar! Abra qualquer livro do acervo e registre sua avaliação.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comentariosFiltrados.map(com => {
                const livro = livros.find(l => l.id === com.livro_id);

                return (
                  <div
                    key={com.id}
                    className="p-5 bg-white border border-stone-200 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Topo do Comentário */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-serif font-bold text-sm flex items-center justify-center shrink-0">
                            {com.autor_nome.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-900 text-xs sm:text-sm">
                                {com.autor_nome}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                {com.autor_tipo.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400">
                              {new Date(com.criado_em).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Estrelas */}
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              className={`w-3.5 h-3.5 ${
                                st <= com.nota
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Obra Relacionada */}
                      {livro && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => onVerDetalhesLivro(livro)}
                            className="text-xs font-serif font-bold text-stone-800 hover:text-amber-900 hover:underline flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                            <span className="line-clamp-1">{livro.titulo}</span>
                          </button>
                          <span className="text-[10px] text-stone-400">{livro.categoria}</span>
                        </div>
                      )}

                      {/* Texto da Opinião */}
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2.5 italic">
                        "{com.texto}"
                      </p>
                    </div>

                    {/* Rodapé com Interação */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCurtir(com.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Curtir esta resenha"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span className="font-semibold">{com.curtidas || 0}</span>
                        <span className="text-[11px] text-stone-500">curtidas</span>
                      </button>

                      {isProfessor && (
                        <button
                          type="button"
                          onClick={() => setComentarioParaRemover(com.id)}
                          className="flex items-center gap-1 text-stone-400 hover:text-rose-700 transition-colors text-[11px]"
                          title="Remover comentário impróprio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Moderar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Moderação / Remoção */}
      {comentarioParaRemover && (
        <Modal
          isOpen={true}
          onClose={() => setComentarioParaRemover(null)}
          title="Remover Comentário do Mural"
          subtitle="Moderação realizada pelo Professor / Bibliotecário"
          maxWidth="sm"
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-stone-600 leading-relaxed">
              Tem certeza de que deseja remover este comentário do mural público de alunos? O comentário não ficará mais visível aos leitores.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setComentarioParaRemover(null)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRemocao}
                className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-xs text-white font-bold"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
