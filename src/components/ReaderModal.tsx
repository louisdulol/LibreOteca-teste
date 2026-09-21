import React, { useState, useEffect } from 'react';
import { Leitor, EmprestimoComDetalhes } from '../types';
import { StorageService } from '../lib/storage';
import { leitorSchema } from '../lib/validations';
import { Modal } from './Modal';
import { User, Phone, Mail, ShieldAlert, Check, AlertCircle, Clock, BookOpen, UserX } from 'lucide-react';

interface ReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (leitor: Leitor) => void;
  leitorParaEditar?: Leitor | null;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  leitorParaEditar,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    telefone: '',
    email: '',
    tipo: 'aluno' as Leitor['tipo'],
    ativo: true,
    observacoes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [historico, setHistorico] = useState<EmprestimoComDetalhes[]>([]);
  const [activeTab, setActiveTab] = useState<'dados' | 'historico' | 'lgpd'>('dados');
  const [showAnonymizeConfirm, setShowAnonymizeConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
      setFeedbackMsg(null);
      setShowAnonymizeConfirm(false);
      setActiveTab('dados');

      if (leitorParaEditar) {
        setFormData({
          nome: leitorParaEditar.nome,
          matricula: leitorParaEditar.matricula,
          telefone: leitorParaEditar.telefone,
          email: leitorParaEditar.email || '',
          tipo: leitorParaEditar.tipo,
          ativo: leitorParaEditar.ativo,
          observacoes: leitorParaEditar.observacoes || '',
        });

        // Carrega histórico
        const emps = StorageService.getEmprestimosComDetalhes().filter(
          e => e.leitor_id === leitorParaEditar.id
        );
        setHistorico(emps);
      } else {
        // Gerador de matrícula sugerida
        const anoAtual = new Date().getFullYear();
        const rand = Math.floor(100 + Math.random() * 900);
        setFormData({
          nome: '',
          matricula: `${anoAtual}-L${rand}`,
          telefone: '',
          email: '',
          tipo: 'aluno',
          ativo: true,
          observacoes: '',
        });
        setHistorico([]);
      }
    }
  }, [isOpen, leitorParaEditar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setFeedbackMsg(null);

    const parseResult = leitorSchema.safeParse(formData);
    if (!parseResult.success) {
      const errs: Record<string, string> = {};
      parseResult.error.issues.forEach(err => {
        if (err.path[0]) {
          errs[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errs);
      return;
    }

    try {
      const saved = StorageService.saveLeitor({
        ...formData,
        id: leitorParaEditar?.id,
      });
      onSaved(saved);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar leitor';
      setValidationErrors({ form: errorMsg });
    }
  };

  const handleAnonymize = () => {
    if (!leitorParaEditar) return;
    const res = StorageService.anonymizeLeitor(leitorParaEditar.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        const atualizado = StorageService.getLeitorById(leitorParaEditar.id);
        if (atualizado) onSaved(atualizado);
        onClose();
      }, 1500);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setShowAnonymizeConfirm(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={leitorParaEditar ? `Ficha do Leitor: ${leitorParaEditar.nome}` : 'Cadastrar Novo Leitor'}
      subtitle={leitorParaEditar ? `Matrícula: ${leitorParaEditar.matricula}` : 'Controle em conformidade com a LGPD'}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Abas se for leitor já cadastrado */}
        {leitorParaEditar && (
          <div className="flex border-b border-stone-200 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('dados')}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'dados'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Dados Cadastrais
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'historico'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Histórico ({historico.length})
            </button>
            <button
              onClick={() => setActiveTab('lgpd')}
              className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'lgpd'
                  ? 'border-amber-800 text-amber-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Privacidade & LGPD
            </button>
          </div>
        )}

        {feedbackMsg && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* ABA: DADOS CADASTRAIS */}
        {activeTab === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationErrors.form && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {validationErrors.form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva Santos"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {validationErrors.nome && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Matrícula / Identificador <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2026-A104"
                  value={formData.matricula}
                  onChange={e => setFormData({ ...formData, matricula: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {validationErrors.matricula && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.matricula}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tipo de Usuário <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value as Leitor['tipo'] })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="aluno">Aluno(a)</option>
                  <option value="professor">Professor(a)</option>
                  <option value="comunidade">Comunidade em Geral</option>
                  <option value="funcionario">Funcionário(a) / Servidor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Telefone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {validationErrors.telefone && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.telefone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="Ex: leitor@escola.sp.gov.br"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-0.5">{validationErrors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Turma / Departamento / Observações
                </label>
                <input
                  type="text"
                  placeholder="Ex: 8º Ano A, Turno Manhã, Professor de História..."
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-stone-800 block">Status do Cadastro</span>
                  <span className="text-[11px] text-stone-500">
                    Leitores inativos não podem realizar novos empréstimos
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-all"
              >
                {leitorParaEditar ? 'Salvar Alterações' : 'Cadastrar Leitor'}
              </button>
            </div>
          </form>
        )}

        {/* ABA: HISTÓRICO DE EMPRÉSTIMOS */}
        {activeTab === 'historico' && leitorParaEditar && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Total de empréstimos registrados: {historico.length}</span>
              <span className="font-semibold text-stone-800">
                {historico.filter(h => h.devolvido_em === null).length} pendente(s)
              </span>
            </div>

            {historico.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs">
                Nenhum empréstimo registrado para este leitor ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {historico.map(emp => {
                  const emAberto = emp.devolvido_em === null;
                  return (
                    <div
                      key={emp.id}
                      className="p-3 bg-white border border-stone-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-serif font-bold text-stone-900">
                            {emp.livro?.titulo || 'Livro Removido'}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            ({emp.livro?.codigo_interno || '-'})
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 flex gap-3">
                          <span>Retirada: {new Date(emp.emprestado_em + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          <span>Prazo: {new Date(emp.devolucao_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div>
                        {emAberto ? (
                          emp.atrasado ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Atrasado ({emp.dias_atraso}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Em Aberto
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Devolvido
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA: PRIVACIDADE E LGPD */}
        {activeTab === 'lgpd' && leitorParaEditar && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Direito de Anonimização / Exclusão (LGPD Artigo 18)
              </div>
              <p className="text-amber-800 leading-relaxed">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), o titular tem o direito de solicitar a eliminação dos seus dados pessoais. O LibreOteca atende a esse requisito substituindo o nome, contatos e observações por registros anônimos, mantendo as contagens estatísticas dos empréstimos realizados para relatórios de prestação de contas.
              </p>
            </div>

            {leitorParaEditar.anonimizado ? (
              <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-600">
                <p className="font-semibold text-stone-800">Este leitor já foi anonimizado.</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Os dados identificáveis foram removidos permanentemente e a ação foi registrada na tabela de auditoria.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h6 className="text-xs font-bold text-stone-900">Anonimizar Dados Pessoais do Titular</h6>
                  <p className="text-[11px] text-stone-500">
                    Remove permanentemente nome, telefone e e-mail. Irreversível.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnonymizeConfirm(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  <UserX className="w-4 h-4" />
                  Anonimizar (LGPD)
                </button>
              </div>
            )}

            {/* Modal de confirmação de anonimização */}
            {showAnonymizeConfirm && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3 animate-in zoom-in-95">
                <p className="text-xs text-rose-950 font-bold">
                  Confirmar anonimização dos dados de "{leitorParaEditar.nome}"?
                </p>
                <p className="text-[11px] text-rose-800 leading-normal">
                  Esta ação não pode ser desfeita. Todos os contatos e nome serão excluídos, e o status será marcado como inativo. Certifique-se de que não há empréstimos pendentes.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAnonymizeConfirm(false)}
                    className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 rounded-lg text-xs font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAnonymize}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Sim, anonimizar definitivamente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
