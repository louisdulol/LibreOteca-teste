import React, { useState, useEffect, useCallback } from 'react';
import { Livro, Leitor, ConfiguracoesBiblioteca, UsuarioSessao, ActiveTab } from './types';
import { StorageService } from './lib/storage';
import { observarAutenticacao } from './lib/firebaseAuth';
import { Navbar } from './components/Navbar';
import { AcervoView } from './components/AcervoView';
import { EmprestimosView } from './components/EmprestimosView';
import { LeitoresView } from './components/LeitoresView';
import { RelatoriosView } from './components/RelatoriosView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { MinhasEstatisticasAlunoView } from './components/MinhasEstatisticasAlunoView';
import { MuralComentariosView } from './components/MuralComentariosView';
import { BookFormModal } from './components/BookFormModal';
import { OpenLibraryExplorerModal } from './components/OpenLibraryExplorerModal';
import { BookDetailModal } from './components/BookDetailModal';
import { LoanModal } from './components/LoanModal';
import { ReaderModal } from './components/ReaderModal';
import { LoginModal } from './components/LoginModal';
import { TutorialProfessoresModal } from './components/TutorialProfessoresModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import {
  ShieldCheck,
  HelpCircle,
  LogIn,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Sessão do Usuário (Professor vs Aluno ou null para visitante)
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSessao | null>(() => {
    return StorageService.getSessaoUsuario();
  });

  // Aba Ativa com seleção inteligente por papel
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const user = StorageService.getSessaoUsuario();
    if (!user) return 'acervo';
    return user.role === 'aluno' ? 'minhas-estatisticas' : 'acervo';
  });

  // Dados centrais da biblioteca
  const [livros, setLivros] = useState<Livro[]>([]);
  const [leitores, setLeitores] = useState<Leitor[]>([]);
  const [config, setConfig] = useState<ConfiguracoesBiblioteca>(() => StorageService.getConfiguracoes());
  const [totalEmprestimosAtivos, setTotalEmprestimosAtivos] = useState<number>(0);
  const [totalAtrasados, setTotalAtrasados] = useState<number>(0);
  const [totalComentarios, setTotalComentarios] = useState<number>(0);

  // Estados de Modais
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isDbStatusOpen, setIsDbStatusOpen] = useState(false);

  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Livro | null>(null);

  const [isOpenLibraryExplorerOpen, setIsOpenLibraryExplorerOpen] = useState(false);

  const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState<Livro | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanPreSelectedLivro, setLoanPreSelectedLivro] = useState<Livro | null>(null);
  const [loanPreSelectedLeitor, setLoanPreSelectedLeitor] = useState<Leitor | null>(null);

  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readerToEdit, setReaderToEdit] = useState<Leitor | null>(null);

  // Recarregamento e sincronização com StorageService
  const carregarDados = useCallback(() => {
    const todosLivros = StorageService.getLivros();
    const todosLeitores = StorageService.getLeitores();
    const todosEmprestimos = StorageService.getEmprestimosComDetalhes();
    const configs = StorageService.getConfiguracoes();
    const comentarios = StorageService.getComentarios();

    setLivros(todosLivros);
    setLeitores(todosLeitores);
    setConfig(configs);
    setTotalComentarios(comentarios.length);

    const ativos = todosEmprestimos.filter(e => e.devolvido_em === null);
    const atrasados = todosEmprestimos.filter(e => e.atrasado);

    setTotalEmprestimosAtivos(ativos.length);
    setTotalAtrasados(atrasados.length);
  }, []);

  useEffect(() => {
    carregarDados();
    StorageService.inicializarFirebaseSync().then(() => {
      carregarDados();
    });

    const unsubscribe = observarAutenticacao(usuario => {
      if (usuario) {
        setUsuarioAtual(usuario);
        StorageService.setSessaoUsuario(usuario);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [carregarDados]);

  // Handler para troca de usuário / login / logout
  const handleLoginSuccess = (novoUsuario: UsuarioSessao | null) => {
    setUsuarioAtual(novoUsuario);
    if (!novoUsuario) {
      setActiveTab('acervo');
    } else if (novoUsuario.role === 'aluno') {
      setActiveTab('minhas-estatisticas');
    } else if (activeTab === 'minhas-estatisticas') {
      setActiveTab('acervo');
    }
    carregarDados();
  };

  // Handlers para ações entre componentes
  const handleOpenNovoLivro = () => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setBookToEdit(null);
    setIsBookFormOpen(true);
  };

  const handleEditarLivro = (livro: Livro) => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setBookToEdit(livro);
    setIsBookFormOpen(true);
  };

  const handleVerDetalhesLivro = (livro: Livro) => {
    setSelectedBookDetail(livro);
    setIsBookDetailOpen(true);
  };

  const handleEmprestarLivro = (livro: Livro) => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setLoanPreSelectedLivro(livro);
    setLoanPreSelectedLeitor(null);
    setIsLoanModalOpen(true);
  };

  const handleNovoEmprestimoGeral = () => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setLoanPreSelectedLivro(null);
    setLoanPreSelectedLeitor(null);
    setIsLoanModalOpen(true);
  };

  const handleNovoEmprestimoParaLeitor = (leitor: Leitor) => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setLoanPreSelectedLivro(null);
    setLoanPreSelectedLeitor(leitor);
    setIsLoanModalOpen(true);
  };

  const handleNovoLeitor = () => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setReaderToEdit(null);
    setIsReaderModalOpen(true);
  };

  const handleEditarLeitor = (leitor: Leitor) => {
    if (!usuarioAtual || usuarioAtual.role !== 'professor') {
      setIsLoginModalOpen(true);
      return;
    }
    setReaderToEdit(leitor);
    setIsReaderModalOpen(true);
  };

  const handleImportedFromOpenLibrary = (novoLivro: Livro) => {
    carregarDados();
    setSelectedBookDetail(novoLivro);
    setIsBookDetailOpen(true);
  };

  const isProfessor = usuarioAtual?.role === 'professor';

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-stone-900 flex flex-col font-sans selection:bg-amber-800 selection:text-white">
      {/* Header com Navegação, Perfil e Ações Rápidas */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usuarioAtual={usuarioAtual}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        config={config}
        totalLivros={livros.length}
        totalEmprestimosAtivos={totalEmprestimosAtivos}
        totalAtrasados={totalAtrasados}
        totalComentarios={totalComentarios}
        onNovoEmprestimo={handleNovoEmprestimoGeral}
        onNovoLivro={handleOpenNovoLivro}
        onExplorarOpenLibrary={() => setIsOpenLibraryExplorerOpen(true)}
      />

      {/* Banner de Boas-Vindas e Convite de Login caso não autenticado */}
      {!usuarioAtual && (
        <div className="bg-amber-900 text-amber-50 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="font-semibold">Modo de Leitura / Consulta Livre:</span>
              <span className="text-amber-200">
                Você pode explorar o acervo e ler resenhas. Para emprestar livros ou gerenciar o sistema, entre como Professor ou Aluno.
              </span>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar / Criar Conta</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal de cada Aba */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Aba Exclusiva do Aluno: Minhas Estatísticas & Leituras */}
        {usuarioAtual?.role === 'aluno' && activeTab === 'minhas-estatisticas' && (
          <MinhasEstatisticasAlunoView
            usuario={usuarioAtual}
            onExplorarAcervo={() => setActiveTab('acervo')}
            onVerDetalhesLivro={handleVerDetalhesLivro}
          />
        )}

        {/* Acervo Bibliográfico (Acessível por Todos) */}
        {activeTab === 'acervo' && (
          <AcervoView
            livros={livros}
            usuarioAtual={usuarioAtual}
            onRefresh={carregarDados}
            onOpenNovoLivro={handleOpenNovoLivro}
            onOpenExplorarOpenLibrary={() => setIsOpenLibraryExplorerOpen(true)}
            onEmprestarLivro={handleEmprestarLivro}
            onEditarLivro={handleEditarLivro}
            onVerDetalhes={handleVerDetalhesLivro}
          />
        )}

        {/* Mural de Comentários & Resenhas dos Alunos (Acessível por Todos com Moderação) */}
        {activeTab === 'comentarios' && (
          <MuralComentariosView
            usuario={usuarioAtual}
            onVerDetalhesLivro={handleVerDetalhesLivro}
            onRefresh={carregarDados}
          />
        )}

        {/* Abas Administrativas Exclusivas do Professor */}
        {isProfessor && activeTab === 'emprestimos' && (
          <EmprestimosView
            onRefresh={carregarDados}
            onNovoEmprestimo={handleNovoEmprestimoGeral}
          />
        )}

        {isProfessor && activeTab === 'leitores' && (
          <LeitoresView
            leitores={leitores}
            onRefresh={carregarDados}
            onNovoLeitor={handleNovoLeitor}
            onEditarLeitor={handleEditarLeitor}
            onNovoEmprestimoParaLeitor={handleNovoEmprestimoParaLeitor}
          />
        )}

        {isProfessor && activeTab === 'relatorios' && <RelatoriosView />}

        {isProfessor && activeTab === 'configuracoes' && (
          <ConfiguracoesView onRefresh={carregarDados} />
        )}
      </main>

      {/* Rodapé Informativo */}
      <footer className="bg-white/90 backdrop-blur-xs border-t border-stone-200/90 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-stone-600">
            <span className="font-serif font-bold text-stone-900 text-sm">LibreOteca</span>
            <span>•</span>
            <span>Sistema Livre de Gestão para Bibliotecas Escolares e Comunitárias</span>
            <span>•</span>
            <a
              href="https://wole-br.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-stone-700 hover:text-amber-900 transition-colors"
            >
              Powered by <span className="font-extrabold text-amber-900 underline decoration-amber-400 underline-offset-2">Wole</span> ↗
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-stone-600">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
              LGPD & Filtro Anti-Bullying Ativo
            </span>
            {isProfessor && (
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="flex items-center gap-1 text-amber-800 hover:text-amber-900 font-semibold transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Guia para Professores
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* MODAIS GLOBAIS */}

      {/* Modal de Login / Cadastro Real por E-mail e Senha */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        usuarioAtual={usuarioAtual}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Tutorial Passo a Passo para Professores e Bibliotecários de mais idade */}
      <TutorialProfessoresModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateToTab={tab => setActiveTab(tab)}
      />

      {/* Modal de Status e Diagnóstico do Banco de Dados (opcional para manutenção) */}
      <DatabaseStatusModal
        isOpen={isDbStatusOpen}
        onClose={() => setIsDbStatusOpen(false)}
        onDataReset={carregarDados}
      />

      {/* Modal de Cadastro/Edição de Livro com Identificação Online */}
      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => setIsBookFormOpen(false)}
        onSaved={livroSalvo => {
          carregarDados();
        }}
        livroParaEditar={bookToEdit}
      />

      {/* Modal Explorador Open Library */}
      <OpenLibraryExplorerModal
        isOpen={isOpenLibraryExplorerOpen}
        onClose={() => setIsOpenLibraryExplorerOpen(false)}
        onBookImported={handleImportedFromOpenLibrary}
      />

      {/* Modal de Detalhes do Livro com Ficha, Resenhas e Avaliação */}
      {isBookDetailOpen && selectedBookDetail && (
        <BookDetailModal
          isOpen={isBookDetailOpen}
          onClose={() => {
            setIsBookDetailOpen(false);
            setSelectedBookDetail(null);
          }}
          livro={selectedBookDetail}
          usuarioAtual={usuarioAtual}
          onEmprestar={livro => {
            handleEmprestarLivro(livro);
          }}
          onEditar={livro => {
            handleEditarLivro(livro);
          }}
          onCommentChange={carregarDados}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Modal de Registro de Empréstimo */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSuccess={() => {
          carregarDados();
        }}
        preSelectedLivro={loanPreSelectedLivro}
        preSelectedLeitor={loanPreSelectedLeitor}
      />

      {/* Modal de Cadastro/Edição/LGPD de Leitor */}
      <ReaderModal
        isOpen={isReaderModalOpen}
        onClose={() => setIsReaderModalOpen(false)}
        onSaved={leitorSalvo => {
          carregarDados();
        }}
        leitorParaEditar={readerToEdit}
      />
    </div>
  );
}
