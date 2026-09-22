import React from 'react';
import {
  BookOpen,
  Library,
  Plus,
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
  ExternalLink,
  Tablet,
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
    <header className="sticky top-0 z-40 bg-[#0f141e]/95 backdrop-blur-md border-b border-slate-800/80 shadow-xl">
      {/* Barra superior de identificação e perfil */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo e Nome da Biblioteca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md border border-slate-700/60 shrink-0 p-1">
              <Logo className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl text-white tracking-tight">
                  LibreOteca
                </span>
                {usuarioAtual && (
                  <span
                    className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isProfessor
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isProfessor ? 'Professor / Admin' : 'Espaço do Aluno'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                {config.nome_biblioteca}
              </p>
            </div>
          </div>

          {/* Botões Centrais e Direita */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Botão de Ajuda & Tutorial para Professores */}
            {isProfessor && (
              <button
                onClick={onOpenTutorial}
                id="btn-tutorial-guia"
                className="p-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
                title="Guia Passo a Passo para professores e bibliotecários"
                aria-label="Guia Passo a Passo"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Controles exclusivos para Professor */}
            {isProfessor && (
              <>
                {/* Badge de Atrasos com Alerta se houver */}
                {totalAtrasados > 0 && (
                  <button
                    onClick={() => setActiveTab('emprestimos')}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors animate-pulse"
                    title="Clique para ver empréstimos atrasados"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{totalAtrasados} atrasados</span>
                  </button>
                )}

                {/* Botão Explorar Open Library */}
                <button
                  id="btn-explorar-open-library"
                  onClick={onExplorarOpenLibrary}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Library</span>
                </button>

                {/* Botão Novo Livro */}
                <button
                  id="btn-novo-livro-topo"
                  onClick={onNovoLivro}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Novo Livro</span>
                </button>

                {/* Botão Novo Empréstimo */}
                <button
                  id="btn-novo-emprestimo-topo"
                  onClick={onNovoEmprestimo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Empréstimo</span>
                </button>
              </>
            )}

            {/* Botão Modo Totem / Tablet (Estilo Big Picture / Quiosque) */}
            {onOpenTabletKiosk && (
              <button
                id="btn-modo-totem-tablet"
                onClick={onOpenTabletKiosk}
                className="p-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Modo Totem (Autoatendimento e Consulta)"
                aria-label="Modo Totem"
              >
                <Tablet className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Seletor Rápido de Paleta de Cores */}
            <ThemeSelector />

            {/* Seletor / Botão de Usuário Ativo & Login */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-800">
              {!usuarioAtual ? (
                <button
                  id="btn-login-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar / Conta</span>
                </button>
              ) : (
                <button
                  id="btn-usuario-ativo-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/80 hover:border-amber-500/50 bg-slate-800/80 hover:bg-slate-800 transition-colors"
                  title="Clique para gerenciar a conta, trocar de perfil ou sair"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${
                      isProfessor ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                    } flex items-center justify-center text-xs font-bold shrink-0`}
                  >
                    {isProfessor ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {usuarioAtual.nome.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isProfessor ? 'Professor' : 'Aluno'} • Conta
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegação por Abas */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 overflow-x-auto py-1.5 scrollbar-none">
          {/* Se for Aluno: Exibe primeiro "Minhas Estatísticas & Livros" */}
          {usuarioAtual?.role === 'aluno' && (
            <button
              id="tab-minhas-estatisticas"
              onClick={() => setActiveTab('minhas-estatisticas')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'minhas-estatisticas'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Minhas Estatísticas & Leituras</span>
            </button>
          )}

          {/* Acervo de Livros (Acessível por Todos) */}
          <button
            id="tab-acervo"
            onClick={() => setActiveTab('acervo')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'acervo'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Acervo de Livros</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'acervo' ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {totalLivros}
            </span>
          </button>

          {/* Mural de Comentários & Moderação */}
          <button
            id="tab-comentarios"
            onClick={() => setActiveTab('comentarios')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'comentarios'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isProfessor ? 'Comentários & Moderação' : 'Mural de Resenhas'}</span>
          </button>

          {/* Abas exclusivas de Administração para Professor */}
          {isProfessor && (
            <>
              <button
                id="tab-emprestimos"
                onClick={() => setActiveTab('emprestimos')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'emprestimos'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Empréstimos & Devoluções</span>
                {totalAtrasados > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                    {totalAtrasados}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'emprestimos'
                        ? 'bg-slate-950/30 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {totalEmprestimosAtivos}
                  </span>
                )}
              </button>

              <button
                id="tab-leitores"
                onClick={() => setActiveTab('leitores')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'leitores'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Leitores & Alunos</span>
              </button>

              <button
                id="tab-relatorios"
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'relatorios'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios & Dados</span>
              </button>

              <button
                id="tab-configuracoes"
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'configuracoes'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações & Auditoria</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
