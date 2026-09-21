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
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
            {usuario.nome.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Olá, {usuario.nome}!
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Aluno Leitor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Matrícula: <strong className="font-mono text-stone-800">{usuario.matricula}</strong>{' '}
              {leitorDados?.observacoes ? `• ${leitorDados.observacoes}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={onExplorarAcervo}
          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explorar Acervo & Comentar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Caixa de Aviso Regulamentar */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0" />
        <p className="leading-relaxed">
          <strong>Aviso da Biblioteca:</strong> Para retirar ou devolver um livro físico, dirija-se à mesa do professor
          ou bibliotecário. O professor é o responsável oficial por registrar a saída e entrada dos exemplares no
          sistema.
        </p>
      </div>

      {/* Indicadores Principais de Leitura (Cards de Métricas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium">Empréstimos Ativos</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-2xl font-serif font-black text-stone-900">
            {estatisticas.ativos.length}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Com você no momento</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium">Livros Concluídos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-serif font-black text-stone-900">
            {estatisticas.devolvidos.length}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">Lidos e devolvidos</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium">Pontualidade</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-serif font-black text-stone-900">
            {estatisticas.taxaPontualidade}%
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Entregas no prazo</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-medium">Resenhas Feitas</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-serif font-black text-stone-900">
            {estatisticas.comentariosAluno.length}
          </span>
          <span className="text-[11px] text-purple-700 block mt-0.5">Comentários no acervo</span>
        </div>
      </div>

      {/* Livros que o aluno está com eles agora */}
      <div className="space-y-3">
        <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-800" />
          <span>Livros Atualmente com Você ({estatisticas.ativos.length})</span>
        </h3>

        {estatisticas.ativos.length === 0 ? (
          <div className="p-8 text-center bg-white border border-dashed border-stone-300 rounded-2xl space-y-2">
            <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="font-serif font-bold text-stone-800 text-sm">
              Você não possui nenhum livro emprestado no momento!
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Que tal navegar pelo acervo da biblioteca e escolher uma nova história para ler esta semana?
            </p>
            <button
              onClick={onExplorarAcervo}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
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
                  className={`p-4 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                    emAtraso
                      ? 'border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-stone-200 shadow-2xs hover:border-stone-300'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {livro?.capa_url ? (
                        <img
                          src={livro.capa_url}
                          alt={livro.titulo}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {livro?.categoria || 'Geral'}
                        </span>
                        {emAtraso ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Atrasado ({emp.dias_atraso}d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Em dia ({emp.dias_restantes}d restantes)
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-stone-900 text-base mt-1 line-clamp-1">
                        {livro?.titulo || 'Livro da Biblioteca'}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">Por {livro?.autor}</p>

                      <div className="text-xs text-stone-600 mt-2 space-y-0.5 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <div>
                          Emprestado em:{' '}
                          <strong>
                            {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </strong>
                        </div>
                        <div>
                          Devolução até:{' '}
                          <strong className={emAtraso ? 'text-rose-700' : 'text-stone-900'}>
                            {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 font-mono">
                      Exemplar: {livro?.codigo_interno}
                    </span>
                    {livro && (
                      <button
                        onClick={() => onVerDetalhesLivro(livro)}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
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
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Histórico de Leituras Concluídas ({estatisticas.devolvidos.length})</span>
          </h3>

          {estatisticas.devolvidos.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              Nenhum livro finalizado no histórico ainda. Quando você devolver seu primeiro livro, ele aparecerá aqui!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {estatisticas.devolvidos.map(dev => (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-semibold text-stone-900">{dev.livro?.titulo || 'Livro'}</h5>
                    <span className="text-stone-500 text-[11px]">
                      Devolvido em:{' '}
                      {dev.devolvido_em
                        ? new Date(dev.devolvido_em + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>
                  {dev.livro && (
                    <button
                      onClick={() => onVerDetalhesLivro(dev.livro!)}
                      className="px-2.5 py-1 bg-white border border-stone-200 hover:border-amber-800 text-stone-700 rounded-lg text-xs font-medium"
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
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>Seus Comentários e Resenhas ({estatisticas.comentariosAluno.length})</span>
          </h3>

          {estatisticas.comentariosAluno.length === 0 ? (
            <div className="text-center py-4 space-y-1">
              <p className="text-xs text-stone-500">
                Você ainda não escreveu nenhuma resenha para os livros da biblioteca.
              </p>
              <p className="text-[11px] text-stone-400">
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
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        {livro?.titulo || 'Livro da Biblioteca'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            className={`w-3 h-3 ${
                              st <= com.nota
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-700 italic">"{com.texto}"</p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-amber-200/40">
                      <span>
                        Publicado em {new Date(com.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="font-semibold text-amber-900">
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
