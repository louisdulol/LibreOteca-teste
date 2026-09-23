import React from 'react';
import {
  BookOpen,
  ArrowRightLeft,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  User,
  LogIn,
  Tablet,
  Plus,
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeSelector } from './ThemeSelector';
import { ConfiguracoesBiblioteca, UsuarioSessao, ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  usuarioAtual: UsuarioSessao | null;
  onOpenLoginModal: () => void;
  onOpenTutorial: () => void;
  onOpenTabletKiosk?: () => void;
  config: ConfiguracoesBiblioteca;
  totalLivros: number;
  totalEmprestimosAtivos: number;
  totalAtrasados: number;
  totalComentarios: number;
  onNovoEmprestimo: () => void;
  onNovoLivro: () => void;
  onExplorarOpenLibrary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  usuarioAtual,
  onOpenLoginModal,
  onOpenTutorial,
  onOpenTabletKiosk,
  config,
  totalLivros,
  totalEmprestimosAtivos,
  totalAtrasados,
  totalComentarios,
  onNovoEmprestimo,
  onNovoLivro,
  onExplorarOpenLibrary,
}) => {
  const isProfessor = usuarioAtual?.role === 'professor';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f141e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs dark:shadow-xl transition-colors">
      {/* Barra superior compacta de identificação e perfil */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 gap-2 sm:gap-3">
          {/* Logo e Nome da Biblioteca */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700/60 shrink-0 p-0.5">
              <Logo className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  LibreOteca
                </span>
                {usuarioAtual && (
                  <span
                    className={`hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isProfessor
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    }`}
                  >
                    {isProfessor ? 'Professor' : 'Aluno'}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
                {config.nome_biblioteca}
              </p>
            </div>
          </div>

          {/* Botões Centrais e Direita */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botão de Ajuda & Tutorial para Professores */}
            {isProfessor && (
              <button
                onClick={onOpenTutorial}
                id="btn-tutorial-guia"
                className="p-1.5 sm:p-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500/40 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                title="Guia Passo a Passo para professores e bibliotecários"
                aria-label="Guia Passo a Passo"
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              </button>
            )}

            {/* Controles exclusivos para Professor */}
            {isProfessor && (
              <>
                {/* Badge de Atrasos com Alerta se houver */}
                {totalAtrasados > 0 && (
                  <button
                    onClick={() => setActiveTab('emprestimos')}
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors animate-pulse"
                    title="Clique para ver empréstimos atrasados"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{totalAtrasados} atrasados</span>
                  </button>
                )}

                {/* Botão Explorar Open Library */}
                <button
                  id="btn-explorar-open-library"
                  onClick={onExplorarOpenLibrary}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Open Library</span>
                </button>

                {/* Botão Novo Livro */}
                <button
                  id="btn-novo-livro-topo"
                  onClick={onNovoLivro}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Novo Livro</span>
                </button>

                {/* Botão Novo Empréstimo */}
                <button
                  id="btn-novo-emprestimo-topo"
                  onClick={onNovoEmprestimo}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Empréstimo</span>
                </button>
              </>
            )}

            {/* Botão Modo Totem / Tablet */}
            {onOpenTabletKiosk && (
              <button
                id="btn-modo-totem-tablet"
                onClick={onOpenTabletKiosk}
                className="p-1.5 sm:p-2 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Modo Totem (Autoatendimento e Consulta)"
                aria-label="Modo Totem"
              >
                <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              </button>
            )}

            {/* Seletor Rápido de Paleta de Cores (Tema Claro/Escuro) */}
            <ThemeSelector />

            {/* Seletor / Botão de Usuário Ativo & Login */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              {!usuarioAtual ? (
                <button
                  id="btn-login-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              ) : (
                <button
                  id="btn-usuario-ativo-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Clique para gerenciar a conta, trocar de perfil ou sair"
                >
                  <div
                    className={`w-6 h-6 rounded-md ${
                      isProfessor ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                    } flex items-center justify-center text-xs font-bold shrink-0`}
                  >
                    {isProfessor ? (
                      <GraduationCap className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px]">
                      {usuarioAtual.nome.split(' ')[0]}
                    </span>
                    <span className="block text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {isProfessor ? 'Professor' : 'Aluno'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegação por Abas para Computador (Desktop) */}
        <nav className="hidden md:flex space-x-1 sm:space-x-1.5 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto py-1 scrollbar-none">
          {/* Se for Aluno: Exibe primeiro "Minhas Estatísticas & Livros" */}
          {usuarioAtual?.role === 'aluno' && (
            <button
              id="tab-minhas-estatisticas"
              onClick={() => setActiveTab('minhas-estatisticas')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'minhas-estatisticas'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Minhas Estatísticas</span>
            </button>
          )}

          {/* Acervo de Livros (Acessível por Todos) */}
          <button
            id="tab-acervo"
            onClick={() => setActiveTab('acervo')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'acervo'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Acervo</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'acervo'
                  ? 'bg-slate-950/20 text-slate-950 font-bold'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {totalLivros}
            </span>
          </button>

          {/* Mural de Comentários & Moderação */}
          <button
            id="tab-comentarios"
            onClick={() => setActiveTab('comentarios')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'comentarios'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isProfessor ? 'Comentários' : 'Resenhas'}</span>
            {totalComentarios > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'comentarios'
                    ? 'bg-slate-950/20 text-slate-950 font-bold'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}
              >
                {totalComentarios}
              </span>
            )}
          </button>

          {/* Abas de Professor */}
          {isProfessor && (
            <>
              <button
                id="tab-emprestimos"
                onClick={() => setActiveTab('emprestimos')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'emprestimos'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Empréstimos</span>
                {totalAtrasados > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                    {totalAtrasados}
                  </span>
                ) : (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      activeTab === 'emprestimos'
                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {totalEmprestimosAtivos}
                  </span>
                )}
              </button>

              <button
                id="tab-leitores"
                onClick={() => setActiveTab('leitores')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'leitores'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Leitores</span>
              </button>

              <button
                id="tab-relatorios"
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'relatorios'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Relatórios</span>
              </button>

              <button
                id="tab-configuracoes"
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'configuracoes'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurações</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
