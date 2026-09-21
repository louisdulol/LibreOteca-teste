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

      // Filtro de busca
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchLivro =
        emp.livro?.titulo.toLowerCase().includes(term) ||
        emp.livro?.codigo_interno.toLowerCase().includes(term);
      const matchLeitor =
        emp.leitor?.nome.toLowerCase().includes(term) ||
        emp.leitor?.matricula.toLowerCase().includes(term);

      return matchLivro || matchLeitor;
    });
  }, [emprestimos, filtroStatus, searchTerm]);

  const handleDevolucao = (empId: string) => {
    const res = StorageService.devolverEmprestimo(empId);
    if (res.success) {
      setActionFeedback({ type: 'success', text: res.message });
      onRefresh();
    } else {
      setActionFeedback({ type: 'error', text: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleRenovacao = (empId: string) => {
    const res = StorageService.renovarEmprestimo(empId);
    if (res.success) {
      setActionFeedback({ type: 'success', text: res.message });
      onRefresh();
    } else {
      setActionFeedback({ type: 'error', text: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCopiarMensagemAtraso = (emp: EmprestimoComDetalhes) => {
    const config = StorageService.getConfiguracoes();
    const mensagem = `Olá ${emp.leitor?.nome}! Notamos que o empréstimo do livro "${emp.livro?.titulo}" (${emp.livro?.codigo_interno}) na ${config.nome_biblioteca} venceu em ${new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')} (atraso de ${emp.dias_atraso} dia(s)). Por favor, compareça à biblioteca para registrar a devolução ou renovar o exemplar. Obrigado!`;

    navigator.clipboard.writeText(mensagem);
    setCopiedReminderId(emp.id);
    setTimeout(() => setCopiedReminderId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Controle de Empréstimos & Devoluções
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Status dinâmico: atraso calculado em tempo real para evitar inconsistências no acervo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => StorageService.exportarEmprestimosCsv()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <button
            onClick={onNovoEmprestimo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Empréstimo
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Alerta de Atrasos se houver */}
      {totalAtrasados > 0 && filtroStatus !== 'atrasados' && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-900">
                Atenção: Há {totalAtrasados} empréstimo(s) em atraso pendente(s) de devolução!
              </p>
              <p className="text-rose-700 text-[11px]">
                Clique para filtrar e gerar mensagens de aviso aos leitores.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFiltroStatus('atrasados')}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 shadow-2xs"
          >
            Ver Empréstimos Atrasados
          </button>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por leitor, matrícula, título do livro ou código LO-XXXXXX..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all"
            />
          </div>

          {/* Abas de status */}
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFiltroStatus('abertos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'abertos'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Em Aberto</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-bold">
                {totalAbertos}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('atrasados')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'atrasados'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>Atrasados</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-bold">
                {totalAtrasados}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('devolvidos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'devolvidos'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Devolvidos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                {totalDevolvidos}
              </span>
            </button>

            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filtroStatus === 'todos'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Todos ({emprestimos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Empréstimos */}
      {emprestimosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
          <ArrowRightLeft className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-base font-serif font-bold text-stone-800">
            Nenhum empréstimo encontrado
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {filtroStatus === 'atrasados'
              ? 'Excelente! Não há nenhum exemplar em atraso no momento.'
              : 'Não há registros que coincidam com o filtro ou busca selecionada.'}
          </p>
          <button
            onClick={onNovoEmprestimo}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs"
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
                className={`p-4 bg-white rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  emp.atrasado
                    ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                    : 'border-stone-200/90 hover:border-stone-300'
                }`}
              >
                {/* Informações do Livro & Leitor */}
                <div className="flex items-start sm:items-center gap-3.5">
                  {emp.livro?.capa_url ? (
                    <img
                      src={emp.livro.capa_url}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-11 h-16 object-cover rounded-md bg-stone-100 border border-stone-200 shrink-0"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-11 h-16 rounded-md bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200 text-stone-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-sm bg-stone-100 text-stone-800">
                        {emp.livro?.codigo_interno || 'LO-000000'}
                      </span>
                      <h4 className="text-sm font-serif font-bold text-stone-900 line-clamp-1">
                        {emp.livro?.titulo || 'Livro Removido'}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
                      <div className="flex items-center gap-1 font-medium text-stone-900">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{emp.leitor?.nome || 'Leitor Removido'}</span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          ({emp.leitor?.matricula || '-'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-stone-500">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Retirado em: {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>

                      <div className="flex items-center gap-1 text-stone-500">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Previsto: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>

                      {emp.renovacoes > 0 && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                          {emp.renovacoes}x renovado
                        </span>
                      )}
                    </div>

                    {emp.observacao && (
                      <p className="text-[11px] text-stone-500 italic">
                        Obs: {emp.observacao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge & Ações */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* Status Indicator */}
                  <div>
                    {emAberto ? (
                      emp.atrasado ? (
                        <div className="flex flex-col items-start md:items-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Atrasado há {emp.dias_atraso} dia(s)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start md:items-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            {emp.dias_restantes === 0 ? 'Vence hoje' : `Faltam ${emp.dias_restantes} dia(s)`}
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                          title="Copiar texto de aviso para WhatsApp / E-mail"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-rose-600" />}
                          <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Avisar'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRenovacao(emp.id)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Renovar prazo de devolução"
                      >
                        <RefreshCw className="w-3 h-3 text-stone-600" />
                        <span className="hidden sm:inline">Renovar</span>
                      </button>

                      <button
                        id={`btn-devolver-${emp.id}`}
                        onClick={() => handleDevolucao(emp.id)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Devolver
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
