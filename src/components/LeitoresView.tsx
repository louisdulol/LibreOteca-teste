import React, { useState, useMemo } from 'react';
import { Leitor } from '../types';
import { StorageService } from '../lib/storage';
import {
  Users,
  Search,
  Plus,
  Download,
  User,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  ShieldCheck,
  Edit2,
} from 'lucide-react';

interface LeitoresViewProps {
  leitores: Leitor[];
  onRefresh: () => void;
  onNovoLeitor: () => void;
  onEditarLeitor: (leitor: Leitor) => void;
  onNovoEmprestimoParaLeitor: (leitor: Leitor) => void;
}

export const LeitoresView: React.FC<LeitoresViewProps> = ({
  leitores,
  onRefresh,
  onNovoLeitor,
  onEditarLeitor,
  onNovoEmprestimoParaLeitor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos' | 'com_pendencia'>('todos');

  const emprestimos = useMemo(() => StorageService.getEmprestimosComDetalhes(), []);

  // Mapeamento de pendências por leitor
  const pendenciasPorLeitor = useMemo(() => {
    const map = new Map<string, { totalAbertos: number; totalAtrasados: number }>();
    emprestimos.forEach(emp => {
      if (emp.devolvido_em === null) {
        const atual = map.get(emp.leitor_id) || { totalAbertos: 0, totalAtrasados: 0 };
        atual.totalAbertos++;
        if (emp.atrasado) atual.totalAtrasados++;
        map.set(emp.leitor_id, atual);
      }
    });
    return map;
  }, [emprestimos]);

  const leitoresFiltrados = useMemo(() => {
    return leitores.filter(leitor => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        leitor.nome.toLowerCase().includes(term) ||
        leitor.matricula.toLowerCase().includes(term) ||
        leitor.telefone.includes(term) ||
        (leitor.email && leitor.email.toLowerCase().includes(term));

      if (!matchSearch) return false;

      if (filtroTipo !== 'todos' && leitor.tipo !== filtroTipo) return false;

      const pend = pendenciasPorLeitor.get(leitor.id) || { totalAbertos: 0, totalAtrasados: 0 };
      if (filtroStatus === 'ativos' && !leitor.ativo) return false;
      if (filtroStatus === 'inativos' && leitor.ativo) return false;
      if (filtroStatus === 'com_pendencia' && pend.totalAbertos === 0) return false;

      return true;
    });
  }, [leitores, searchTerm, filtroTipo, filtroStatus, pendenciasPorLeitor]);

  const badgeTipo = (tipo: Leitor['tipo']) => {
    switch (tipo) {
      case 'aluno':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'professor':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'comunidade':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'funcionario':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Gestão de Leitores & LGPD
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {leitores.length} leitores cadastrados • Conforme com princípios de minimização e anonimização
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => StorageService.exportarLeitoresCsv()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <button
            onClick={onNovoLeitor}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Leitor
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, telefone ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-600"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="aluno">Alunos</option>
            <option value="professor">Professores</option>
            <option value="comunidade">Comunidade</option>
            <option value="funcionario">Funcionários</option>
          </select>

          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filtroStatus === 'todos' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('ativos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filtroStatus === 'ativos' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFiltroStatus('com_pendencia')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filtroStatus === 'com_pendencia' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Com Empréstimo
            </button>
            <button
              onClick={() => setFiltroStatus('inativos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                filtroStatus === 'inativos' ? 'bg-white text-stone-700 shadow-2xs' : 'text-stone-500'
              }`}
            >
              Inativos / LGPD
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Leitores */}
      {leitoresFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
          <Users className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-base font-serif font-bold text-stone-800">
            Nenhum leitor encontrado
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Não foram localizados leitores com os filtros aplicados.
          </p>
          <button
            onClick={onNovoLeitor}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Cadastrar Novo Leitor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leitoresFiltrados.map(leitor => {
            const pend = pendenciasPorLeitor.get(leitor.id) || { totalAbertos: 0, totalAtrasados: 0 };
            return (
              <div
                key={leitor.id}
                className={`p-4 bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  pend.totalAtrasados > 0
                    ? 'border-rose-300 bg-rose-50/15'
                    : 'border-stone-200/90 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => onEditarLeitor(leitor)}
                          className="text-sm font-bold text-stone-900 line-clamp-1 hover:text-amber-800 cursor-pointer"
                        >
                          {leitor.nome}
                        </h4>
                        {leitor.anonimizado && (
                          <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-stone-200 text-stone-600 font-mono">
                            LGPD
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-stone-500 mt-0.5">
                        Matrícula: {leitor.matricula}
                      </p>
                    </div>

                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeTipo(
                        leitor.tipo
                      )}`}
                    >
                      {leitor.tipo}
                    </span>
                  </div>

                  {/* Informações de contato */}
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{leitor.telefone || 'Sem telefone'}</span>
                    </div>
                    {leitor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{leitor.email}</span>
                      </div>
                    )}
                    {leitor.observacoes && (
                      <p className="text-[11px] text-stone-500 italic truncate pt-1">
                        {leitor.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status de Empréstimos e Ações */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    {pend.totalAtrasados > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        {pend.totalAtrasados} livro(s) em atraso!
                      </span>
                    ) : pend.totalAbertos > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {pend.totalAbertos} empréstimo(s) ativo(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Sem pendências
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {leitor.ativo && (
                      <button
                        onClick={() => onNovoEmprestimoParaLeitor(leitor)}
                        className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-semibold transition-colors"
                        title="Emprestar livro para este leitor"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onEditarLeitor(leitor)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                    >
                      Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
