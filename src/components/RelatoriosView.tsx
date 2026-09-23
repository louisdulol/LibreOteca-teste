import React, { useState, useMemo } from 'react';
import { StorageService } from '../lib/storage';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Users,
  Download,
  Database,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [filtroDiasAtraso, setFiltroDiasAtraso] = useState<number>(0);

  const livros = useMemo(() => StorageService.getLivros(), []);
  const leitores = useMemo(() => StorageService.getLeitores(), []);
  const emprestimos = useMemo(() => StorageService.getEmprestimosComDetalhes(), []);

  // Métricas principais
  const totalLivros = livros.length;
  const totalExemplares = livros.reduce((acc, l) => acc + l.total_exemplares, 0);
  const totalDisponiveis = livros.reduce((acc, l) => acc + l.disponiveis, 0);
  const totalEmprestadosAgora = totalExemplares - totalDisponiveis;
  const taxaOcupacao = totalExemplares > 0 ? Math.round((totalEmprestadosAgora / totalExemplares) * 100) : 0;

  const emprestimosAbertos = emprestimos.filter(e => e.devolvido_em === null);
  const emprestimosAtrasados = emprestimos.filter(e => e.atrasado);
  const emprestimosDevolvidos = emprestimos.filter(e => e.devolvido_em !== null);

  // Ranking de Livros Mais Emprestados
  const rankingLivros = useMemo(() => {
    const contagemPorLivro = new Map<string, { titulo: string; autor: string; codigo: string; total: number }>();

    emprestimos.forEach(emp => {
      const livroId = emp.livro_id;
      const livro = livros.find(l => l.id === livroId);
      const atual = contagemPorLivro.get(livroId) || {
        titulo: livro?.titulo || 'Livro Desconhecido',
        autor: livro?.autor || 'Desconhecido',
        codigo: livro?.codigo_interno || '-',
        total: 0,
      };
      atual.total++;
      contagemPorLivro.set(livroId, atual);
    });

    return Array.from(contagemPorLivro.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [emprestimos, livros]);

  const maxEmprestimosRanking = rankingLivros.length > 0 ? rankingLivros[0].total : 1;

  // Atrasados filtrados pelo slider/seletor
  const atrasadosFiltrados = useMemo(() => {
    if (filtroDiasAtraso === 0) return emprestimosAtrasados;
    return emprestimosAtrasados.filter(e => e.dias_atraso >= filtroDiasAtraso);
  }, [emprestimosAtrasados, filtroDiasAtraso]);

  const handleCopySql = () => {
    const sql = StorageService.gerarSqlSupabase();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131926] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm w-full max-w-full overflow-hidden">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-400 shrink-0" />
            <span>Relatórios & Estatísticas</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indicadores de circulação do acervo, conformidade e exportações de dados
          </p>
        </div>

        {/* Botões de Exportação CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => StorageService.exportarLivrosCsv()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Acervo CSV</span>
          </button>
          <button
            onClick={() => StorageService.exportarEmprestimosCsv()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Empréstimos CSV</span>
          </button>
          <button
            onClick={() => StorageService.exportarLeitoresCsv()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Leitores CSV</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Acervo */}
        <div className="p-5 bg-[#131926] rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total de Exemplares</span>
            <BookOpen className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{totalExemplares}</div>
          <div className="text-[11px] text-slate-400">
            {totalLivros} obras • {totalDisponiveis} disponíveis
          </div>
        </div>

        {/* Empréstimos Ativos */}
        <div className="p-5 bg-[#131926] rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Empréstimos em Aberto</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-400">{emprestimosAbertos.length}</div>
          <div className="text-[11px] text-slate-400">
            Taxa de circulação: {taxaOcupacao}%
          </div>
        </div>

        {/* Atrasados */}
        <div className="p-5 bg-[#131926] rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Empréstimos em Atraso</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-400">{emprestimosAtrasados.length}</div>
          <div className="text-[11px] text-rose-400 font-medium">
            {emprestimosAtrasados.length > 0 ? 'Requer atenção imediata' : 'Zero atrasos ativos'}
          </div>
        </div>

        {/* Leitores Cadastrados */}
        <div className="p-5 bg-[#131926] rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total de Leitores</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-white">{leitores.length}</div>
          <div className="text-[11px] text-slate-400">
            {leitores.filter(l => l.ativo).length} ativos • {emprestimosDevolvidos.length} devoluções
          </div>
        </div>
      </div>

      {/* Seção 2: Ranking de Livros Mais Emprestados & Relatório de Atrasos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livros Mais Emprestados */}
        <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Livros Mais Emprestados</span>
            </h3>
            <span className="text-xs text-slate-500">Histórico acumulado</span>
          </div>

          {rankingLivros.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Nenhum dado de empréstimo registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {rankingLivros.map((item, index) => {
                const percent = Math.round((item.total / maxEmprestimosRanking) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate pr-2">
                        {index + 1}. {item.titulo}
                      </span>
                      <span className="font-bold text-white shrink-0">
                        {item.total} {item.total === 1 ? 'retirada' : 'retiradas'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.autor}</span>
                      <span className="font-mono text-slate-400">{item.codigo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Relatório de Atrasos com Filtro de Gravidade */}
        <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Relatório de Atrasos</span>
            </h3>

            {/* Filtro de dias */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Atraso mín:</span>
              <select
                value={filtroDiasAtraso}
                onChange={e => setFiltroDiasAtraso(Number(e.target.value))}
                className="px-2 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-medium text-white"
              >
                <option value={0}>Todos ({emprestimosAtrasados.length})</option>
                <option value={3}>3+ dias</option>
                <option value={7}>7+ dias</option>
                <option value={15}>15+ dias</option>
              </select>
            </div>
          </div>

          {atrasadosFiltrados.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              Nenhum empréstimo com atraso no critério selecionado.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {atrasadosFiltrados.map(emp => (
                <div
                  key={emp.id}
                  className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{emp.livro?.titulo || 'Livro'}</p>
                    <p className="text-[11px] text-slate-400">
                      Leitor: <strong className="text-slate-200">{emp.leitor?.nome}</strong> ({emp.leitor?.matricula})
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Venceu em: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    {emp.dias_atraso}d em atraso
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção 3: Supabase & PostgreSQL Migration Schema Viewer */}
      <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/50 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white">
                Script SQL de Banco de Dados (Supabase / PostgreSQL)
              </h3>
              <p className="text-xs text-slate-400">
                Schema completo com Row Level Security (RLS), constraints e policies LGPD
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs border border-slate-700 transition-colors shrink-0"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-200 border border-slate-800/80 rounded-2xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed select-all">
            {StorageService.gerarSqlSupabase()}
          </pre>
        </div>
      </div>
    </div>
  );
};
