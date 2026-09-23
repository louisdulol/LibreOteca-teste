import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRightLeft,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  MoreHorizontal,
  TrendingUp,
  User,
  LogIn,
  Tablet,
  Sparkles,
  Plus,
  HelpCircle,
  X,
  GraduationCap,
} from 'lucide-react';
import { ActiveTab, UsuarioSessao } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  usuarioAtual: UsuarioSessao | null;
  onOpenLoginModal: () => void;
  onOpenTutorial: () => void;
  onOpenTabletKiosk?: () => void;
  totalLivros: number;
  totalEmprestimosAtivos: number;
  totalAtrasados: number;
  totalComentarios: number;
  onNovoEmprestimo: () => void;
  onNovoLivro: () => void;
  onExplorarOpenLibrary: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  usuarioAtual,
  onOpenLoginModal,
  onOpenTutorial,
  onOpenTabletKiosk,
  totalLivros,
  totalEmprestimosAtivos,
  totalAtrasados,
  totalComentarios,
  onNovoEmprestimo,
  onNovoLivro,
  onExplorarOpenLibrary,
}) => {
  const [isMenuMaisOpen, setIsMenuMaisOpen] = useState(false);
  const isProfessor = usuarioAtual?.role === 'professor';
  const isAluno = usuarioAtual?.role === 'aluno';

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMenuMaisOpen(false);
  };

  return (
    <>
      {/* MENU INFERIOR / DRAWER "MAIS" PARA PROFESSORES */}
      {isMenuMaisOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop com desfoque */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMenuMaisOpen(false)}
            aria-hidden="true"
          />

          {/* Painel Inferior Deslizante (Claro no Tema Claro / Escuro no Tema Escuro) */}
          <div className="relative bg-white dark:bg-[#131926] border-t border-slate-200 dark:border-slate-700/80 rounded-t-3xl p-4 sm:p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-3.5 animate-in slide-in-from-bottom duration-200 text-slate-800 dark:text-white transition-colors">
            {/* Barra de arraste visual */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            {/* Cabeçalho do Menu */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm">
                  Menu Administrativo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuMaisOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ações Rápidas em Destaque */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                Ações Imediatas
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuMaisOpen(false);
                    onNovoEmprestimo();
                  }}
                  className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Novo Empréstimo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuMaisOpen(false);
                    onNovoLivro();
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="truncate">Cadastrar Livro</span>
                </button>
              </div>
            </div>

            {/* Abas e Ferramentas Secundárias */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                Páginas & Ferramentas
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleTabClick('relatorios')}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === 'relatorios'
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Relatórios & Estatísticas</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Abrir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('configuracoes')}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTab === 'configuracoes'
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Configurações & LGPD</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Abrir</span>
                </button>

                {onOpenTabletKiosk && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuMaisOpen(false);
                      onOpenTabletKiosk();
                    }}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Tablet className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span>Modo Totem / Consulta Rápida</span>
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Kiosk</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuMaisOpen(false);
                    onExplorarOpenLibrary();
                  }}
                  className="w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Importar da Open Library</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuMaisOpen(false);
                    onOpenTutorial();
                  }}
                  className="w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-amber-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Guia & Tutorial de Uso</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Ajuda</span>
                </button>
              </div>
            </div>

            {/* Informações da Sessão */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white block">{usuarioAtual?.nome}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">Professor / Gestor</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMenuMaisOpen(false);
                  onOpenLoginModal();
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Gerenciar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR FIXA ULTRA-COMPACTA NO CELULAR E TABLET (md:hidden) */}
      <nav
        aria-label="Navegação móvel"
        className="mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0c1018]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.6)] pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-0.5 px-1 transition-colors"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-0.5">
          {/* CASO ALUNO: 4 BOTÕES SLIM */}
          {isAluno && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('minhas-estatisticas')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'minhas-estatisticas'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'minhas-estatisticas' ? 'page' : undefined}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Leituras</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('acervo')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'acervo'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'acervo' ? 'page' : undefined}
              >
                <div className="relative">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="absolute -top-1 -right-2 text-[8px] font-bold px-1 py-0 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {totalLivros}
                  </span>
                </div>
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Acervo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comentarios')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'comentarios'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'comentarios' ? 'page' : undefined}
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {totalComentarios > 0 && (
                    <span className="absolute -top-1 -right-1.5 text-[8px] font-bold px-1 py-0 rounded-full bg-amber-500 text-slate-950">
                      {totalComentarios}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Resenhas</span>
              </button>

              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all active:scale-95"
              >
                <User className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Perfil</span>
              </button>
            </>
          )}

          {/* CASO PROFESSOR: 5 BOTÕES SLIM */}
          {isProfessor && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('acervo')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'acervo'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'acervo' ? 'page' : undefined}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Acervo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('emprestimos')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'emprestimos'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'emprestimos' ? 'page' : undefined}
              >
                <div className="relative">
                  <ArrowRightLeft className="w-4 h-4 shrink-0" />
                  {totalAtrasados > 0 ? (
                    <span className="absolute -top-1 -right-2 text-[8px] font-bold px-1 py-0 rounded-full bg-rose-600 text-white animate-pulse">
                      {totalAtrasados}
                    </span>
                  ) : totalEmprestimosAtivos > 0 ? (
                    <span className="absolute -top-1 -right-1.5 text-[8px] font-bold px-1 py-0 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-amber-300">
                      {totalEmprestimosAtivos}
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Empréstimos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leitores')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'leitores'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'leitores' ? 'page' : undefined}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Leitores</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comentarios')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'comentarios'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'comentarios' ? 'page' : undefined}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Resenhas</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMenuMaisOpen(true)}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  isMenuMaisOpen || ['relatorios', 'configuracoes'].includes(activeTab)
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-label="Abrir mais opções"
              >
                <MoreHorizontal className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Mais</span>
              </button>
            </>
          )}

          {/* CASO VISITANTE: ACERVO, RESENHAS, TOTEM, ENTRAR */}
          {!usuarioAtual && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('acervo')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'acervo'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'acervo' ? 'page' : undefined}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Acervo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comentarios')}
                className={`flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  activeTab === 'comentarios'
                    ? 'text-amber-700 dark:text-amber-400 font-bold bg-amber-500/15'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                aria-current={activeTab === 'comentarios' ? 'page' : undefined}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Resenhas</span>
              </button>

              {onOpenTabletKiosk && (
                <button
                  type="button"
                  onClick={onOpenTabletKiosk}
                  className="flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all active:scale-95"
                >
                  <Tablet className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Totem</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex-1 py-1 px-0.5 min-h-[38px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span className="text-[9px] font-medium tracking-tight truncate leading-tight">Entrar</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
