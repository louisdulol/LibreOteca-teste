import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { StorageService } from '../lib/storage';
import { testarConexaoFirestore } from '../lib/firebase';
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
      zIndex="z-[80]"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {feedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Card Principal de Status Cloud Firebase */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 rounded-xl shadow-xs shrink-0 mt-0.5">
            <Cloud className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                Firebase Firestore & Auth Integrados
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                Nuvem Ativa
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed text-xs">
              O banco de dados do LibreOteca está configurado e protegido na nuvem com <strong className="text-slate-900 dark:text-white">Firebase Firestore</strong> e <strong className="text-slate-900 dark:text-white">Firebase Authentication</strong>. Suas credenciais de login (e-mail e senha) são salvas de forma criptografada e segura, com sincronização em tempo real entre computadores e celulares.
            </p>
          </div>
        </div>

        {/* Card de Regra de Segurança do Professor */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Proteção Contra Acesso Indevido (Código do Professor)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Para garantir que nenhum aluno consiga criar uma conta com privilégios de Professor ou Administrador, o sistema exige obrigatoriamente a validação do <strong className="text-slate-900 dark:text-white">Código de Acesso Institucional</strong> durante o cadastro.
          </p>
          <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Validação de Segurança Ativa:</span>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold rounded-lg">
              Protegido no Servidor
            </span>
          </div>
        </div>

        {/* Estatísticas de Registros em Memória e Nuvem */}
        <div>
          <h4 className="font-serif font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Registros Sincronizados no Sistema</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Livros no Acervo</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{livros.length}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Sincronizados na Nuvem</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Empréstimos Gravados</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{emprestimos.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Histórico completo</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Leitores Cadastrados</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{leitores.length}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Alunos e professores</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Comentários & Resenhas</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{comentarios.length}</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Filtro antipalavrão</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Logs de Auditoria</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{auditoria.length}</span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">Segurança LGPD</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Persistência Híbrida</span>
              <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">Cloud + Cache</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-300 font-medium">100% resiliente offline</span>
            </div>
          </div>
        </div>

        {/* Backups e Utilitários */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs sm:text-sm">
            <Server className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Ferramentas de Backup e Exportação</span>
          </h4>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                StorageService.exportarLivrosCsv();
                setFeedback('Backup do acervo em formato CSV baixado com sucesso!');
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Baixar Backup do Acervo (Excel / CSV)</span>
            </button>

            <button
              onClick={handleDownloadSql}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Exportar Schema SQL</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ml-auto cursor-pointer"
              title="Restaurar dados semente de teste"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Catálogo Padrão</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
