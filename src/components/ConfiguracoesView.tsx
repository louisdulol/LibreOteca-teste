import React, { useState, useEffect } from 'react';
import { ConfiguracoesBiblioteca, AuditoriaRegistro } from '../types';
import { StorageService } from '../lib/storage';
import {
  ThemeService,
  PALETAS_ESCURAS,
  PALETAS_CLARAS,
  ThemePaletteId,
  ThemePalette,
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
} from 'lucide-react';

interface ConfiguracoesViewProps {
  onRefresh: () => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onRefresh }) => {
  const [config, setConfig] = useState<ConfiguracoesBiblioteca>(StorageService.getConfiguracoes());
  const [auditoria, setAuditoria] = useState<AuditoriaRegistro[]>(StorageService.getAuditoria());
  const [filtroTabela, setFiltroTabela] = useState<string>('todas');
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemePaletteId>('obsidian');

  useEffect(() => {
    setActiveTheme(ThemeService.getTheme());
    const handleThemeChange = (e: any) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener('libreoteca-theme-changed', handleThemeChange);
    return () => window.removeEventListener('libreoteca-theme-changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (id: ThemePaletteId) => {
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

        <div className="flex items-center gap-2">
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

      {salvoFeedback && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-800 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Seção de Temas (Escuro e Claro) */}
      <div className="p-6 bg-[#131926] rounded-3xl border border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Tema de Cores</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Escolha entre as opções de tema escuro ou tema claro para a interface
            </p>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 self-start sm:self-auto">
            Troca instantânea
          </span>
        </div>

        {/* Temas Escuros */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Temas Escuros
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {PALETAS_ESCURAS.map(paleta => {
              const isSelected = paleta.id === activeTheme;
              return (
                <button
                  key={paleta.id}
                  type="button"
                  onClick={() => handleSelectTheme(paleta.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/90 shadow-md ring-1 ring-amber-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    {/* Amostra Visual Dupla */}
                    <div className="w-8 h-8 rounded-lg border border-slate-700 shadow-inner relative overflow-hidden shrink-0">
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: paleta.corBase }}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-md"
                        style={{ backgroundColor: paleta.corAcento }}
                      />
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white block">
                      {paleta.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {isSelected ? 'Ativo no momento' : 'Clique para usar'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temas Claros */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Temas Claros
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PALETAS_CLARAS.map(paleta => {
              const isSelected = paleta.id === activeTheme;
              return (
                <button
                  key={paleta.id}
                  type="button"
                  onClick={() => handleSelectTheme(paleta.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-slate-800/90 shadow-md ring-1 ring-amber-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    {/* Amostra Visual Dupla */}
                    <div className="w-8 h-8 rounded-lg border border-slate-700 shadow-inner relative overflow-hidden shrink-0">
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: paleta.corBase }}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-md"
                        style={{ backgroundColor: paleta.corAcento }}
                      />
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-white block">
                      {paleta.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {isSelected ? 'Ativo no momento' : 'Clique para usar'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
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
