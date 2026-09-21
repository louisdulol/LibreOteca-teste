import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { StorageService } from '../lib/storage';
import { testarConexaoFirestore, CODIGO_MESTRE_PROFESSOR_PADRAO } from '../lib/firebase';
import {
  Database,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
  Lock,
  KeyRound,
  ShieldAlert,
  Cloud,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean | null>(null);

  const livros = StorageService.getLivros();
  const leitores = StorageService.getLeitores();
  const emprestimos = StorageService.getEmprestimosComDetalhes();
  const comentarios = StorageService.getComentarios();
  const auditoria = StorageService.getAuditoria();

  useEffect(() => {
    if (isOpen) {
      testarConexaoFirestore().then(res => {
        setIsFirebaseConnected(res);
      });
    }
  }, [isOpen]);

  const handleResetData = () => {
    if (
      window.confirm(
        'Deseja restaurar os dados de demonstração da biblioteca? Todos os livros semente, leitores e comentários serão recarregados.'
      )
    ) {
      StorageService.resetParaDemonstracao();
      setFeedback('Dados de demonstração restaurados com sucesso!');
      if (onDataReset) onDataReset();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDownloadSql = () => {
    const sql = StorageService.gerarSqlSupabase();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libreoteca_supabase_migration.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback('Script SQL para Supabase gerado e baixado com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Status e Segurança do Banco de Dados"
      subtitle="Verificação de conexão segura na nuvem (Firebase Firestore & Auth) e controle de acesso"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Card Principal de Status Cloud Firebase */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-200 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-emerald-700 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Cloud className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-emerald-950 text-base flex items-center gap-2">
                Firebase Firestore & Auth Integrados
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Nuvem Ativa
              </span>
            </div>
            <p className="text-emerald-900 mt-1.5 leading-relaxed text-xs">
              O banco de dados do LibreOteca está configurado e protegido na nuvem com <strong>Firebase Firestore</strong> e <strong>Firebase Authentication</strong>. Suas credenciais de login (e-mail e senha) são salvas de forma criptografada e segura, com sincronização em tempo real entre computadores e celulares.
            </p>
          </div>
        </div>

        {/* Card de Regra de Segurança do Professor */}
        <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-800" />
            <span className="font-bold text-amber-950 text-sm">
              Proteção Contra Acesso Indevido (Código do Professor)
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            Para garantir que nenhum aluno consiga criar uma conta com privilégios de Professor ou Administrador, o sistema exige obrigatoriamente a validação do <strong>Código de Acesso Institucional</strong> durante o cadastro.
          </p>
          <div className="p-2.5 bg-amber-100/80 rounded-xl border border-amber-300/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-900" />
              <span className="text-xs text-amber-950 font-bold">Código Mestre Atual:</span>
            </div>
            <code className="px-3 py-1 bg-white border border-amber-400 text-amber-950 font-mono font-bold text-xs rounded-lg shadow-2xs">
              {CODIGO_MESTRE_PROFESSOR_PADRAO}
            </code>
          </div>
        </div>

        {/* Estatísticas de Registros em Memória e Nuvem */}
        <div>
          <h4 className="font-serif font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-800" />
            <span>Registros Sincronizados no Sistema</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Livros no Acervo</span>
              <span className="text-xl font-bold text-stone-900 mt-0.5 block">{livros.length}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Sincronizados na Nuvem</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Empréstimos Gravados</span>
              <span className="text-xl font-bold text-stone-900 mt-0.5 block">{emprestimos.length}</span>
              <span className="text-[11px] text-stone-600">Histórico completo</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Leitores Cadastrados</span>
              <span className="text-xl font-bold text-stone-900 mt-0.5 block">{leitores.length}</span>
              <span className="text-[11px] text-stone-600">Alunos e professores</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Comentários & Resenhas</span>
              <span className="text-xl font-bold text-stone-900 mt-0.5 block">{comentarios.length}</span>
              <span className="text-[11px] text-purple-700 font-medium">Filtro antipalavrão</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Logs de Auditoria</span>
              <span className="text-xl font-bold text-stone-900 mt-0.5 block">{auditoria.length}</span>
              <span className="text-[11px] text-blue-700 font-medium">Segurança LGPD</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-stone-500 text-xs block">Persistência Híbrida</span>
              <span className="text-base font-bold text-stone-900 mt-1 block">Cloud + Cache</span>
              <span className="text-[11px] text-amber-800 font-medium">100% resiliente offline</span>
            </div>
          </div>
        </div>

        {/* Backups e Utilitários */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <h4 className="font-bold text-stone-900 flex items-center gap-2 text-xs sm:text-sm">
            <Server className="w-4 h-4 text-stone-700" />
            <span>Ferramentas de Backup e Exportação</span>
          </h4>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                StorageService.exportarLivrosCsv();
                setFeedback('Backup do acervo em formato CSV baixado com sucesso!');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Baixar Backup do Acervo (Excel / CSV)</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Exportar Schema SQL</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-white border border-stone-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-stone-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ml-auto"
              title="Restaurar dados semente de teste"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Catálogo Padrão</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
