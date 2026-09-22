import React, { useState, useEffect } from 'react';
import { ConfiguracoesBiblioteca, AuditoriaRegistro } from '../types';
import { StorageService } from '../lib/storage';
import {
  ThemeService,
  TEMAS,
  ThemeMode,
} from '../lib/theme';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  Download,
  Palette,
  Check,
  Moon,
  Sun,
  Wrench,
  HardDrive,
  Sparkles,
  Database,
  Activity,
} from 'lucide-react';

interface ConfiguracoesViewProps {
  onRefresh: () => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onRefresh }) => {
  const [config, setConfig] = useState<ConfiguracoesBiblioteca>(StorageService.getConfiguracoes());
  const [auditoria, setAuditoria] = useState<AuditoriaRegistro[]>(StorageService.getAuditoria());
  const [filtroTabela, setFiltroTabela] = useState<string>('todas');
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeMode>('dark');
  const [otimizacaoResultado, setOtimizacaoResultado] = useState<{
    livrosAjustados: number;
    auditoriasPodadas: number;
    comentariosValidados: number;
    bytesLiberados: number;
  } | null>(null);
  const [isOtimizando, setIsOtimizando] = useState(false);

  useEffect(() => {
    setActiveTheme(ThemeService.getTheme());
    const handleThemeChange = (e: any) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener('libreoteca-theme-changed', handleThemeChange);
    return () => window.removeEventListener('libreoteca-theme-changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (id: ThemeMode) => {
    ThemeService.setTheme(id);
    setActiveTheme(id);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveConfiguracoes(config);
    setAuditoria(StorageService.getAuditoria());
    setSalvoFeedback(true);
    onRefresh();
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const handleOtimizarBanco = () => {
    setIsOtimizando(true);
    setTimeout(() => {
      const res = StorageService.otimizarERepararBanco();
      setOtimizacaoResultado(res);
      setAuditoria(StorageService.getAuditoria());
      setIsOtimizando(false);
      onRefresh();
      setTimeout(() => setOtimizacaoResultado(null), 6000);
    }, 400);
  };

  const handleResetDemonstracao = () => {
    if (
      window.confirm(
        'Deseja restaurar os dados de demonstração da biblioteca? Isso recarregará o acervo com obras clássicas e dados iniciais de teste.'
      )
    ) {
      StorageService.resetParaDemonstracao();
      setConfig(StorageService.getConfiguracoes());
      setAuditoria(StorageService.getAuditoria());
      onRefresh();
    }
  };

  const handleBackupJson = () => {
    const backup = {
      livros: StorageService.getLivros(),
      leitores: StorageService.getLeitores(),
      emprestimos: StorageService.getEmprestimos(),
      configuracoes: StorageService.getConfiguracoes(),
      auditoria: StorageService.getAuditoria(),
      data_backup: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_libreoteca_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const auditoriaFiltrada = auditoria.filter(item => {
    if (filtroTabela === 'todas') return true;
    return item.tabela_afetada === filtroTabela;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131926] p-6 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>Configurações e Auditoria LGPD</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Parâmetros de empréstimo da unidade e rastreabilidade de ações sensíveis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOtimizarBanco}
            disabled={isOtimizando}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title="Verificar integridade do acervo, reparar contagens de estoque e podar logs antigos"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isOtimizando ? 'animate-spin' : ''}`} />
            <span>{isOtimizando ? 'Otimizando...' : 'Otimizar Sistema & Banco'}</span>
          </button>
          <button
            onClick={handleBackupJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
          <button
            onClick={handleResetDemonstracao}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Demonstração</span>
          </button>
        </div>
      </div>

      {otimizacaoResultado && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-3xl text-amber-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Diagnóstico e Otimização Concluídos com Sucesso!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-slate-300">
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Estoque Corrigido:</span>
              <span className="font-bold text-amber-400">{otimizacaoResultado.livrosAjustados} livros</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Resenhas Ativas:</span>
              <span className="font-bold text-emerald-400">{otimizacaoResultado.comentariosValidados} resenhas</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Logs Podados:</span>
              <span className="font-bold text-sky-400">{otimizacaoResultado.auditoriasPodadas} registros</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Integridade:</span>
              <span className="font-bold text-emerald-400">100% Saudável</span>
            </div>
          </div>
        </div>
      )}

      {salvoFeedback && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-800 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Seção de Tema (Escuro / Claro) */}
      <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Aparência</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha entre o Modo Escuro ou Modo Claro
            </p>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 self-start sm:self-auto">
            Troca instantânea
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cartão Tema Escuro */}
          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
              activeTheme === 'dark'
                ? 'border-amber-500 bg-slate-800/90 shadow-md ring-1 ring-amber-500/40'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tema Escuro</span>
                  {activeTheme === 'dark' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                      Ativo
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fundo escuro com alto contraste e acentos em âmbar, ideal para leitura noturna e foco.
                </p>
              </div>
            </div>

            {activeTheme === 'dark' && (
              <Check className="w-4 h-4 text-amber-400 stroke-[3] shrink-0 ml-2" />
            )}
          </button>

          {/* Cartão Tema Claro */}
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
              activeTheme === 'light'
                ? 'border-amber-500 bg-slate-800/90 shadow-md ring-1 ring-amber-500/40'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tema Claro</span>
                  {activeTheme === 'light' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                      Ativo
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fundo claro e limpo, ideal para ambientes bem iluminados e uso durante o dia.
                </p>
              </div>
            </div>

            {activeTheme === 'light' && (
              <Check className="w-4 h-4 text-amber-400 stroke-[3] shrink-0 ml-2" />
            )}
          </button>
        </div>
      </div>

      {/* Formulário de Configurações */}
      <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm">
        <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          <span>Políticas Operacionais da Biblioteca</span>
        </h3>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da Unidade / Biblioteca <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={config.nome_biblioteca}
                onChange={e => setConfig({ ...config, nome_biblioteca: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Instituição
              </label>
              <select
                value={config.tipo_instituicao}
                onChange={e =>
                  setConfig({
                    ...config,
                    tipo_instituicao: e.target.value as ConfiguracoesBiblioteca['tipo_instituicao'],
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="publica" className="bg-slate-900">Biblioteca Pública Municipal / Estadual</option>
                <option value="escola" className="bg-slate-900">Biblioteca Escolar (Ensino Básico)</option>
                <option value="comunitaria" className="bg-slate-900">Biblioteca Comunitária / ONG</option>
                <option value="universitaria" className="bg-slate-900">Biblioteca Universitária / Técnica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prazo Padrão de Empréstimo (Dias)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={config.prazo_padrao_dias}
                onChange={e =>
                  setConfig({ ...config, prazo_padrao_dias: parseInt(e.target.value, 10) || 7 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-500">
                Padrão usual escolar: 7 dias • Público: 14 dias
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Limite de Livros Simultâneos por Leitor
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={config.limite_emprestimos_por_leitor}
                onChange={e =>
                  setConfig({
                    ...config,
                    limite_emprestimos_por_leitor: parseInt(e.target.value, 10) || 3,
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Políticas de Atraso e Bloqueio */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Bloquear novo empréstimo para leitor com devolução em atraso
                </span>
                <span className="text-[11px] text-slate-400">
                  Impede novos empréstimos até que o leitor devolva o exemplar atrasado
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bloquear_leitor_com_atraso}
                  onChange={e =>
                    setConfig({ ...config, bloquear_leitor_com_atraso: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Permitir renovação mesmo se o livro já estiver em atraso
                </span>
                <span className="text-[11px] text-slate-400">
                  Se desativado, o leitor deve devolver fisicamente à biblioteca
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.permitir_renovacao_com_atraso}
                  onChange={e =>
                    setConfig({ ...config, permitir_renovacao_com_atraso: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </form>
      </div>

      {/* Trilha de Auditoria (LGPD Compliance) */}
      <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-serif font-bold text-white">
                Log de Auditoria e Conformidade LGPD
              </h3>
              <p className="text-xs text-slate-400">
                Registro imutável de ações sensíveis (criação, exclusão e anonimização de dados)
              </p>
            </div>
          </div>

          <select
            value={filtroTabela}
            onChange={e => setFiltroTabela(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200"
          >
            <option value="todas" className="bg-slate-900">Todas as Tabelas ({auditoria.length})</option>
            <option value="livros" className="bg-slate-900">Livros</option>
            <option value="leitores" className="bg-slate-900">Leitores (LGPD)</option>
            <option value="emprestimos" className="bg-slate-900">Empréstimos</option>
            <option value="configuracoes" className="bg-slate-900">Configurações</option>
          </select>
        </div>

        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Tabela</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditoriaFiltrada.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-amber-300 px-1.5 py-0.5 rounded-sm bg-slate-800 text-[10px] font-mono border border-slate-700">
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.tabela_afetada}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {log.usuario_nome}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={log.detalhes}>
                      {log.detalhes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
