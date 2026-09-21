import React, { useState } from 'react';
import { ConfiguracoesBiblioteca, AuditoriaRegistro } from '../types';
import { StorageService } from '../lib/storage';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface ConfiguracoesViewProps {
  onRefresh: () => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onRefresh }) => {
  const [config, setConfig] = useState<ConfiguracoesBiblioteca>(StorageService.getConfiguracoes());
  const [auditoria, setAuditoria] = useState<AuditoriaRegistro[]>(StorageService.getAuditoria());
  const [filtroTabela, setFiltroTabela] = useState<string>('todas');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Configurações e Auditoria LGPD
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Parâmetros de empréstimo da unidade e rastreabilidade de ações sensíveis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBackupJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Backup JSON
          </button>
          <button
            onClick={handleResetDemonstracao}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Demonstração
          </button>
        </div>
      </div>

      {salvoFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Formulário de Configurações */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs">
        <h3 className="text-base font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-stone-600" />
          Políticas Operacionais da Biblioteca
        </h3>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nome da Unidade / Biblioteca <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.nome_biblioteca}
                onChange={e => setConfig({ ...config, nome_biblioteca: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="publica">Biblioteca Pública Municipal / Estadual</option>
                <option value="escola">Biblioteca Escolar (Ensino Básico)</option>
                <option value="comunitaria">Biblioteca Comunitária / ONG</option>
                <option value="universitaria">Biblioteca Universitária / Técnica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-stone-500">
                Padrão usual escolar: 7 dias • Público: 14 dias
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Políticas de Atraso e Bloqueio */}
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Bloquear novo empréstimo para leitor com devolução em atraso
                </span>
                <span className="text-[11px] text-stone-500">
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
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <div>
                <span className="text-xs font-semibold text-stone-900 block">
                  Permitir renovação mesmo se o livro já estiver em atraso
                </span>
                <span className="text-[11px] text-stone-500">
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
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Parâmetros
            </button>
          </div>
        </form>
      </div>

      {/* Trilha de Auditoria (LGPD Compliance) */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Log de Auditoria e Conformidade LGPD
              </h3>
              <p className="text-xs text-stone-500">
                Registro imutável de ações sensíveis (criação, exclusão e anonimização de dados)
              </p>
            </div>
          </div>

          <select
            value={filtroTabela}
            onChange={e => setFiltroTabela(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800"
          >
            <option value="todas">Todas as Tabelas ({auditoria.length})</option>
            <option value="livros">Livros</option>
            <option value="leitores">Leitores (LGPD)</option>
            <option value="emprestimos">Empréstimos</option>
            <option value="configuracoes">Configurações</option>
          </select>
        </div>

        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Ação</th>
                  <th className="py-2.5 px-3">Tabela</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditoriaFiltrada.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/70">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.criado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-stone-800 px-1.5 py-0.5 rounded-sm bg-stone-100 text-[10px] font-mono">
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-600 text-[11px]">
                      {log.tabela_afetada}
                    </td>
                    <td className="py-2.5 px-3 text-stone-700 font-medium">
                      {log.usuario_nome}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate" title={log.detalhes}>
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
