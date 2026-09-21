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
        return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'professor':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'comunidade':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'funcionario':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131926] p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Gestão de Leitores & LGPD</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {leitores.length} leitores cadastrados • Conforme com princípios de minimização e anonimização
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => StorageService.exportarLeitoresCsv()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onNovoLeitor}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Leitor</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-[#131926] p-4 rounded-3xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, telefone ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="todos" className="bg-slate-900">Todos os Tipos</option>
            <option value="aluno" className="bg-slate-900">Alunos</option>
            <option value="professor" className="bg-slate-900">Professores</option>
            <option value="comunidade" className="bg-slate-900">Comunidade</option>
            <option value="funcionario" className="bg-slate-900">Funcionários</option>
          </select>

          <div className="inline-flex rounded-2xl border border-slate-800 p-1 bg-slate-900 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filtroStatus === 'todos' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('ativos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filtroStatus === 'ativos' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFiltroStatus('com_pendencia')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filtroStatus === 'com_pendencia' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Com Empréstimo
            </button>
            <button
              onClick={() => setFiltroStatus('inativos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                filtroStatus === 'inativos' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inativos / LGPD
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Leitores */}
      {leitoresFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-[#131926] rounded-3xl border border-dashed border-slate-800 shadow-sm space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-serif font-bold text-white">
            Nenhum leitor encontrado
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não foram localizados leitores com os filtros aplicados.
          </p>
          <button
            onClick={onNovoLeitor}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm"
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
                className={`p-5 bg-[#131926] rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                  pend.totalAtrasados > 0
                    ? 'border-rose-800/80 bg-rose-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => onEditarLeitor(leitor)}
                          className="text-sm font-bold text-white line-clamp-1 hover:text-amber-400 cursor-pointer"
                        >
                          {leitor.nome}
                        </h4>
                        {leitor.anonimizado && (
                          <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-slate-800 text-slate-400 font-mono border border-slate-700">
                            LGPD
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Matrícula: {leitor.matricula}
                      </p>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeTipo(
                        leitor.tipo
                      )}`}
                    >
                      {leitor.tipo}
                    </span>
                  </div>

                  {/* Informações de contato */}
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{leitor.telefone || 'Sem telefone'}</span>
                    </div>
                    {leitor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{leitor.email}</span>
                      </div>
                    )}
                    {leitor.observacoes && (
                      <p className="text-[11px] text-slate-500 italic truncate pt-1">
                        {leitor.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status de Empréstimos e Ações */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    {pend.totalAtrasados > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {pend.totalAtrasados} livro(s) em atraso!
                      </span>
                    ) : pend.totalAbertos > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {pend.totalAbertos} ativo(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Sem pendências
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {leitor.ativo && (
                      <button
                        onClick={() => onNovoEmprestimoParaLeitor(leitor)}
                        className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
                        title="Emprestar livro para este leitor"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onEditarLeitor(leitor)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
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
