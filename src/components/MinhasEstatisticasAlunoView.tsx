import React, { useMemo } from 'react';
import { UsuarioSessao, Livro } from '../types';
import { StorageService } from '../lib/storage';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  TrendingUp,
  Star,
  MessageSquare,
  Bookmark,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface MinhasEstatisticasAlunoViewProps {
  usuario: UsuarioSessao;
  onExplorarAcervo: () => void;
  onVerDetalhesLivro: (livro: Livro) => void;
}

export const MinhasEstatisticasAlunoView: React.FC<MinhasEstatisticasAlunoViewProps> = ({
  usuario,
  onExplorarAcervo,
  onVerDetalhesLivro,
}) => {
  const leitorId = usuario.leitor_id || '';
  const estatisticas = useMemo(() => {
    return StorageService.getEstatisticasAluno(leitorId);
  }, [leitorId]);

  const leitorDados = useMemo(() => {
    return StorageService.getLeitorById(leitorId);
  }, [leitorId]);

  const todosLivros = StorageService.getLivros();

  return (
    <div className="space-y-6">
      {/* Header do Perfil do Aluno */}
      <div className="bg-[#131926] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-bold shadow-lg shadow-emerald-950/50 shrink-0">
            {usuario.nome.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Olá, {usuario.nome}!
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aluno Leitor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Matrícula: <strong className="font-mono text-amber-300">{usuario.matricula}</strong>{' '}
              {leitorDados?.observacoes ? `• ${leitorDados.observacoes}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={onExplorarAcervo}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explorar Acervo & Comentar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Caixa de Aviso Regulamentar */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-200 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Aviso da Biblioteca:</strong> Para retirar ou devolver um livro físico, dirija-se à mesa do professor
          ou bibliotecário. O professor é o responsável oficial por registrar a saída e entrada dos exemplares no
          sistema.
        </p>
      </div>

      {/* Indicadores Principais de Leitura (Cards de Métricas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-[#131926] border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Empréstimos Ativos</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-serif font-black text-white">
            {estatisticas.ativos.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Com você no momento</span>
        </div>

        <div className="p-4 bg-[#131926] border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Livros Concluídos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-serif font-black text-white">
            {estatisticas.devolvidos.length}
          </span>
          <span className="text-[11px] text-emerald-400 block mt-0.5">Lidos e devolvidos</span>
        </div>

        <div className="p-4 bg-[#131926] border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pontualidade</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-serif font-black text-white">
            {estatisticas.taxaPontualidade}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Entregas no prazo</span>
        </div>

        <div className="p-4 bg-[#131926] border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Resenhas Feitas</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-serif font-black text-white">
            {estatisticas.comentariosAluno.length}
          </span>
          <span className="text-[11px] text-purple-400 block mt-0.5">Comentários no acervo</span>
        </div>
      </div>

      {/* Livros que o aluno está com eles agora */}
      <div className="space-y-3">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Livros Atualmente com Você ({estatisticas.ativos.length})</span>
        </h3>

        {estatisticas.ativos.length === 0 ? (
          <div className="p-8 text-center bg-[#131926] border border-dashed border-slate-800 rounded-3xl space-y-2">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="font-serif font-bold text-white text-sm">
              Você não possui nenhum livro emprestado no momento!
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Que tal navegar pelo acervo da biblioteca e escolher uma nova história para ler esta semana?
            </p>
            <button
              onClick={onExplorarAcervo}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Livros Disponíveis</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estatisticas.ativos.map(emp => {
              const livro = emp.livro;
              const emAtraso = emp.atrasado;

              return (
                <div
                  key={emp.id}
                  className={`p-4 rounded-2xl border transition-all bg-[#131926] flex flex-col justify-between ${
                    emAtraso
                      ? 'border-rose-500/50 ring-2 ring-rose-500/20 shadow-md'
                      : 'border-slate-800 shadow-sm hover:border-slate-700'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-24 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                      {livro?.capa_url ? (
                        <img
                          src={livro.capa_url}
                          alt={livro.titulo}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {livro?.categoria || 'Geral'}
                        </span>
                        {emAtraso ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Atrasado ({emp.dias_atraso}d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Em dia ({emp.dias_restantes}d restantes)
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-white text-base mt-1 line-clamp-1">
                        {livro?.titulo || 'Livro da Biblioteca'}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">Por {livro?.autor}</p>

                      <div className="text-xs text-slate-300 mt-2 space-y-0.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <div>
                          Emprestado em:{' '}
                          <strong className="text-white">
                            {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </strong>
                        </div>
                        <div>
                          Devolução até:{' '}
                          <strong className={emAtraso ? 'text-rose-400' : 'text-amber-300'}>
                            {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Exemplar: {livro?.codigo_interno}
                    </span>
                    {livro && (
                      <button
                        onClick={() => onVerDetalhesLivro(livro)}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <span>Ver Ficha & Comentários</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico e Comentários do Aluno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico de Livros Lidos */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Histórico de Leituras Concluídas ({estatisticas.devolvidos.length})</span>
          </h3>

          {estatisticas.devolvidos.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Nenhum livro finalizado no histórico ainda. Quando você devolver seu primeiro livro, ele aparecerá aqui!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {estatisticas.devolvidos.map(dev => (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-semibold text-white">{dev.livro?.titulo || 'Livro'}</h5>
                    <span className="text-slate-400 text-[11px]">
                      Devolvido em:{' '}
                      {dev.devolvido_em
                        ? new Date(dev.devolvido_em + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>
                  {dev.livro && (
                    <button
                      onClick={() => onVerDetalhesLivro(dev.livro!)}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 hover:border-amber-400 text-slate-200 rounded-lg text-xs font-medium"
                    >
                      Avaliar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suas Avaliações e Opiniões */}
        <div className="bg-[#131926] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Seus Comentários e Resenhas ({estatisticas.comentariosAluno.length})</span>
          </h3>

          {estatisticas.comentariosAluno.length === 0 ? (
            <div className="text-center py-4 space-y-1">
              <p className="text-xs text-slate-400">
                Você ainda não escreveu nenhuma resenha para os livros da biblioteca.
              </p>
              <p className="text-[11px] text-slate-500">
                Abra qualquer livro no acervo e compartilhe sua opinião respeitosa com seus colegas!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {estatisticas.comentariosAluno.map(com => {
                const livro = todosLivros.find(l => l.id === com.livro_id);

                return (
                  <div
                    key={com.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {livro?.titulo || 'Livro da Biblioteca'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            className={`w-3 h-3 ${
                              st <= com.nota
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 italic">"{com.texto}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>
                        Publicado em {new Date(com.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="font-semibold text-rose-400">
                        ❤️ {com.curtidas || 0} curtidas de colegas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
