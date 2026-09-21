import React, { useState, useMemo } from 'react';
import { EmprestimoComDetalhes } from '../types';
import { StorageService } from '../lib/storage';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  Download,
  Copy,
  Check,
  BookOpen,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface EmprestimosViewProps {
  onRefresh: () => void;
  onNovoEmprestimo: () => void;
}

export const EmprestimosView: React.FC<EmprestimosViewProps> = ({
  onRefresh,
  onNovoEmprestimo,
}) => {
  const [filtroStatus, setFiltroStatus] = useState<'abertos' | 'atrasados' | 'devolvidos' | 'todos'>('abertos');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedReminderId, setCopiedReminderId] = useState<string | null>(null);

  const emprestimos = useMemo(() => {
    return StorageService.getEmprestimosComDetalhes();
  }, []);

  const totalAbertos = useMemo(
    () => emprestimos.filter(e => e.devolvido_em === null).length,
    [emprestimos]
  );

  const totalAtrasados = useMemo(
    () => emprestimos.filter(e => e.atrasado).length,
    [emprestimos]
  );

  const totalDevolvidos = useMemo(
    () => emprestimos.filter(e => e.devolvido_em !== null).length,
    [emprestimos]
  );

  const emprestimosFiltrados = useMemo(() => {
    return emprestimos.filter(emp => {
      // Filtro de status
      if (filtroStatus === 'abertos' && emp.devolvido_em !== null) return false;
      if (filtroStatus === 'atrasados' && !emp.atrasado) return false;
      if (filtroStatus === 'devolvidos' && emp.devolvido_em === null) return false;

      // Busca por texto
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchLivro = emp.livro?.titulo.toLowerCase().includes(term);
        const matchCodigo = emp.livro?.codigo_interno.toLowerCase().includes(term);
        const matchLeitor = emp.leitor?.nome.toLowerCase().includes(term);
        const matchMatricula = emp.leitor?.matricula.toLowerCase().includes(term);

        if (!matchLivro && !matchCodigo && !matchLeitor && !matchMatricula) {
          return false;
        }
      }

      return true;
    });
  }, [emprestimos, filtroStatus, searchTerm]);

  const handleDevolucao = (emprestimoId: string) => {
    const success = StorageService.registrarDevolucao(emprestimoId);
    if (success) {
      setActionFeedback({
        type: 'success',
        text: 'Devolução registrada com sucesso! Exemplar retornado ao acervo.',
      });
      onRefresh();
      setTimeout(() => setActionFeedback(null), 3500);
    } else {
      setActionFeedback({
        type: 'error',
        text: 'Falha ao registrar devolução do livro.',
      });
    }
  };

  const handleRenovacao = (emprestimoId: string) => {
    const success = StorageService.renovarEmprestimo(emprestimoId);
    if (success) {
      setActionFeedback({
        type: 'success',
        text: 'Empréstimo renovado por mais 14 dias com sucesso!',
      });
      onRefresh();
      setTimeout(() => setActionFeedback(null), 3500);
    } else {
      setActionFeedback({
        type: 'error',
        text: 'Limite de renovações atingido para este empréstimo.',
      });
    }
  };

  const handleCopiarMensagemAtraso = (emp: EmprestimoComDetalhes) => {
    const msg = `Olá, ${emp.leitor?.nome}! Notamos que o livro "${emp.livro?.titulo}" retirado na LibreOteca está com o prazo de devolução vencido (${emp.dias_atraso} dias de atraso). Por gentileza, traga o exemplar para devolução ou renovação. Obrigado!`;
    navigator.clipboard.writeText(msg);
    setCopiedReminderId(emp.id);
    setTimeout(() => setCopiedReminderId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <ArrowRightLeft className="w-6 h-6 text-amber-400" />
            <span>Circulação & Empréstimos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle de retiradas, devoluções, prazos e renovações de exemplares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => StorageService.exportarEmprestimosCsv()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onNovoEmprestimo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Empréstimo</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950/50 text-rose-300 border border-rose-800'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Alerta de Atrasos se houver */}
      {totalAtrasados > 0 && filtroStatus !== 'atrasados' && (
        <div className="p-4 bg-rose-950/20 border border-rose-800/60 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-900/50 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-300">
                Atenção: Há {totalAtrasados} empréstimo(s) em atraso pendente(s) de devolução!
              </p>
              <p className="text-rose-400/80 text-[11px]">
                Clique para filtrar e gerar mensagens de aviso aos leitores.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFiltroStatus('atrasados')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            Ver Empréstimos Atrasados
          </button>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-[#131926] p-4 rounded-3xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por leitor, matrícula, título do livro ou código LO-XXXXXX..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Abas de status */}
          <div className="inline-flex rounded-2xl border border-slate-800 p-1 bg-slate-900 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFiltroStatus('abertos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'abertos'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Em Aberto</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-current font-bold">
                {totalAbertos}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('atrasados')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'atrasados'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <span>Atrasados</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-current font-bold">
                {totalAtrasados}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('devolvidos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'devolvidos'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Devolvidos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-current font-bold">
                {totalDevolvidos}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filtroStatus === 'todos'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({emprestimos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Empréstimos */}
      {emprestimosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-[#131926] rounded-3xl border border-dashed border-slate-800 shadow-sm space-y-3">
          <ArrowRightLeft className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-serif font-bold text-white">
            Nenhum empréstimo encontrado
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filtroStatus === 'atrasados'
              ? 'Excelente! Não há nenhum exemplar em atraso no momento.'
              : 'Não há registros que coincidam com o filtro ou busca selecionada.'}
          </p>
          <button
            onClick={onNovoEmprestimo}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm"
          >
            Registrar Primeiro Empréstimo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {emprestimosFiltrados.map(emp => {
            const emAberto = emp.devolvido_em === null;
            const isCopied = copiedReminderId === emp.id;

            return (
              <div
                key={emp.id}
                id={`loan-card-${emp.id}`}
                className={`p-4 bg-[#131926] rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  emp.atrasado
                    ? 'border-rose-800/80 bg-rose-950/15 shadow-sm'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Informações do Livro & Leitor */}
                <div className="flex items-start sm:items-center gap-3.5">
                  {emp.livro?.capa_url ? (
                    <img
                      src={emp.livro.capa_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-11 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-11 h-16 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-slate-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                        {emp.livro?.codigo_interno || 'LO-000000'}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-white line-clamp-1">
                        {emp.livro?.titulo || 'Livro Removido'}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1 font-medium text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{emp.leitor?.nome || 'Leitor Removido'}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({emp.leitor?.matricula || '-'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Retirado em: {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Previsto: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>

                      {emp.renovacoes > 0 && (
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                          {emp.renovacoes}x renovado
                        </span>
                      )}
                    </div>

                    {emp.observacao && (
                      <p className="text-[11px] text-slate-500 italic">
                        Obs: {emp.observacao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge & Ações */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Status Indicator */}
                  <div>
                    {emAberto ? (
                      emp.atrasado ? (
                        <div className="flex flex-col items-start md:items-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            Atrasado há {emp.dias_atraso} dia(s)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start md:items-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {emp.dias_restantes === 0 ? 'Vence hoje' : `Faltam ${emp.dias_restantes} dia(s)`}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Devolvido em {new Date(emp.devolvido_em + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {/* Botões de Ação para empréstimos em aberto */}
                  {emAberto && (
                    <div className="flex items-center gap-1.5">
                      {emp.atrasado && (
                        <button
                          onClick={() => handleCopiarMensagemAtraso(emp)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors border ${
                            isCopied
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                          title="Copiar texto de aviso para WhatsApp / E-mail"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5 text-rose-400" />}
                          <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Avisar'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRenovacao(emp.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Renovar prazo de devolução"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span className="hidden sm:inline">Renovar</span>
                      </button>

                      <button
                        id={`btn-devolver-${emp.id}`}
                        onClick={() => handleDevolucao(emp.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Devolver</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
