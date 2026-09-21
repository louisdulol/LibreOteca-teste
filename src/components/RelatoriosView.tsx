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

  // Filtragem de atrasados por dias
  const atrasadosFiltrados = useMemo(() => {
    return emprestimosAtrasados.filter(e => e.dias_atraso >= filtroDiasAtraso);
  }, [emprestimosAtrasados, filtroDiasAtraso]);

  const handleCopySql = () => {
    const sql = StorageService.gerarSqlSupabase();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Relatórios e Estatísticas da Biblioteca
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Indicadores de circulação do acervo, conformidade e exportações de dados
          </p>
        </div>

        {/* Botões de Exportação CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => StorageService.exportarLivrosCsv()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Acervo CSV
          </button>
          <button
            onClick={() => StorageService.exportarEmprestimosCsv()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Empréstimos CSV
          </button>
          <button
            onClick={() => StorageService.exportarLeitoresCsv()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Leitores CSV
          </button>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Acervo */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Total de Exemplares</span>
            <BookOpen className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">{totalExemplares}</div>
          <div className="text-[11px] text-stone-500">
            {totalLivros} obras • {totalDisponiveis} disponíveis
          </div>
        </div>

        {/* Empréstimos Ativos */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Empréstimos em Aberto</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900">{emprestimosAbertos.length}</div>
          <div className="text-[11px] text-stone-500">
            Taxa de circulação: {taxaOcupacao}%
          </div>
        </div>

        {/* Atrasados */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Empréstimos em Atraso</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-700">{emprestimosAtrasados.length}</div>
          <div className="text-[11px] text-rose-600 font-medium">
            {emprestimosAtrasados.length > 0 ? 'Requer atenção imediata' : 'Zero atrasos ativos'}
          </div>
        </div>

        {/* Leitores Cadastrados */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Total de Leitores</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">{leitores.length}</div>
          <div className="text-[11px] text-stone-500">
            {leitores.filter(l => l.ativo).length} ativos • {emprestimosDevolvidos.length} devoluções concluídas
          </div>
        </div>
      </div>

      {/* Seção 2: Ranking de Livros Mais Emprestados & Relatório de Atrasos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livros Mais Emprestados */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              Livros Mais Emprestados
            </h3>
            <span className="text-xs text-stone-500">Histórico acumulado</span>
          </div>

          {rankingLivros.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">
              Nenhum dado de empréstimo registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {rankingLivros.map((item, index) => {
                const percent = Math.round((item.total / maxEmprestimosRanking) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800 truncate pr-2">
                        {index + 1}. {item.titulo}
                      </span>
                      <span className="font-bold text-stone-900 shrink-0">
                        {item.total} {item.total === 1 ? 'retirada' : 'retiradas'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-800 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>{item.autor}</span>
                      <span className="font-mono">{item.codigo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Relatório de Atrasos com Filtro de Gravidade */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Relatório de Atrasos
            </h3>

            {/* Filtro de dias */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500">Atraso mín:</span>
              <select
                value={filtroDiasAtraso}
                onChange={e => setFiltroDiasAtraso(Number(e.target.value))}
                className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-md text-xs font-medium text-stone-800"
              >
                <option value={0}>Todos ({emprestimosAtrasados.length})</option>
                <option value={3}>3+ dias</option>
                <option value={7}>7+ dias</option>
                <option value={15}>15+ dias</option>
              </select>
            </div>
          </div>

          {atrasadosFiltrados.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              Nenhum empréstimo com atraso no critério selecionado.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {atrasadosFiltrados.map(emp => (
                <div
                  key={emp.id}
                  className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{emp.livro?.titulo || 'Livro'}</p>
                    <p className="text-[11px] text-stone-600">
                      Leitor: <strong>{emp.leitor?.nome}</strong> ({emp.leitor?.matricula})
                    </p>
                    <p className="text-[10px] text-stone-400">
                      Venceu em: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {emp.dias_atraso}d em atraso
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção 3: Supabase & PostgreSQL Migration Schema Viewer */}
      <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Script SQL de Banco de Dados (Supabase / PostgreSQL)
              </h3>
              <p className="text-xs text-stone-500">
                Schema completo com Row Level Security (RLS), constraints e policies LGPD
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedSql ? 'Copiado para Área de Transferência!' : 'Copiar Script SQL'}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed select-all">
            {StorageService.gerarSqlSupabase()}
          </pre>
        </div>
      </div>
    </div>
  );
};
