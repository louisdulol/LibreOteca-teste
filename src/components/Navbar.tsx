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
} from 'lucide-react';
import { Logo } from './Logo';
import { ConfiguracoesBiblioteca, UsuarioSessao, ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  usuarioAtual: UsuarioSessao | null;
  onOpenLoginModal: () => void;
  onOpenTutorial: () => void;
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      {/* Barra superior de identificação e perfil */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo e Nome da Biblioteca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs border border-stone-200/90 shrink-0 p-1">
              <Logo className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl text-stone-900 tracking-tight">
                  LibreOteca
                </span>
                <a
                  href="https://wole-br.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 text-stone-700 hover:text-amber-950 border border-amber-200/90 transition-all shadow-2xs group"
                  title="Conheça a Wole"
                >
                  <span className="text-[9px] text-stone-400 uppercase tracking-wider">powered by</span>
                  <span className="font-bold text-amber-900 group-hover:underline">Wole</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-700" />
                </a>
                {usuarioAtual && (
                  <span
                    className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isProfessor
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {isProfessor ? 'Professor / Admin' : 'Espaço do Aluno'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                {config.nome_biblioteca}
              </p>
            </div>
          </div>

          {/* Botões Centrais e Direita */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Botão de Ajuda & Tutorial para Professores (APENAS PROFESSOR / ADMIN) */}
            {isProfessor && (
              <button
                onClick={onOpenTutorial}
                id="btn-tutorial-guia"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-colors shadow-2xs"
                title="Abrir o tutorial passo a passo para bibliotecários e professores"
              >
                <HelpCircle className="w-4 h-4 text-amber-800" />
                <span className="hidden sm:inline">Guia Passo a Passo</span>
                <span className="sm:hidden">Guia</span>
              </button>
            )}

            {/* Controles exclusivos para Professor */}
            {isProfessor && (
              <>
                {/* Badge de Atrasos com Alerta se houver */}
                {totalAtrasados > 0 && (
                  <button
                    onClick={() => setActiveTab('emprestimos')}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors animate-pulse"
                    title="Clique para ver empréstimos atrasados"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{totalAtrasados} atrasados</span>
                  </button>
                )}

                {/* Botão Explorar Open Library */}
                <button
                  id="btn-explorar-open-library"
                  onClick={onExplorarOpenLibrary}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Open Library</span>
                </button>

                {/* Botão Novo Livro */}
                <button
                  id="btn-novo-livro-topo"
                  onClick={onNovoLivro}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Livro</span>
                </button>

                {/* Botão Novo Empréstimo */}
                <button
                  id="btn-novo-emprestimo-topo"
                  onClick={onNovoEmprestimo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white shadow-xs transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Empréstimo</span>
                </button>
              </>
            )}

            {/* Seletor / Botão de Usuário Ativo & Login */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-stone-200">
              {!usuarioAtual ? (
                <button
                  id="btn-login-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar / Criar Conta</span>
                </button>
              ) : (
                <button
                  id="btn-usuario-ativo-header"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 transition-colors"
                  title="Clique para gerenciar a conta, trocar de perfil ou sair"
                >
                  <div
                    className={`w-6 h-6 rounded-lg ${
                      isProfessor ? 'bg-amber-900' : 'bg-emerald-700'
                    } text-white flex items-center justify-center text-xs font-bold shrink-0`}
                  >
                    {isProfessor ? (
                      <GraduationCap className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {usuarioAtual.nome.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                      {isProfessor ? 'Professor' : 'Aluno'} • Conta
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegação por Abas (Personalizada por Perfil) */}
        <nav className="flex space-x-1 sm:space-x-3 border-t border-stone-100 overflow-x-auto py-1 scrollbar-none">
          {/* Se for Aluno: Exibe primeiro "Minhas Estatísticas & Livros" */}
          {usuarioAtual?.role === 'aluno' && (
            <button
              id="tab-minhas-estatisticas"
              onClick={() => setActiveTab('minhas-estatisticas')}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'minhas-estatisticas'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'acervo'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Acervo de Livros</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'acervo' ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {totalLivros}
            </span>
          </button>

          {/* Mural de Comentários & Moderação (Acessível por Todos) */}
          <button
            id="tab-comentarios"
            onClick={() => setActiveTab('comentarios')}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'comentarios'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isProfessor ? 'Comentários & Moderação' : 'Mural de Resenhas'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'comentarios'
                  ? 'bg-stone-800 text-stone-200'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {totalComentarios}
            </span>
          </button>

          {/* Abas exclusivas de Administração para Professor */}
          {isProfessor && (
            <>
              <button
                id="tab-emprestimos"
                onClick={() => setActiveTab('emprestimos')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'emprestimos'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Empréstimos & Devoluções</span>
                {totalAtrasados > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                    {totalAtrasados}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'emprestimos'
                        ? 'bg-stone-800 text-stone-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {totalEmprestimosAtivos}
                  </span>
                )}
              </button>

              <button
                id="tab-leitores"
                onClick={() => setActiveTab('leitores')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'leitores'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Leitores & Alunos</span>
              </button>

              <button
                id="tab-relatorios"
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'relatorios'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios & Dados</span>
              </button>

              <button
                id="tab-configuracoes"
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'configuracoes'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
