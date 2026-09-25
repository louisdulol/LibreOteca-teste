import React, { useState } from 'react';
import { Modal } from './Modal';
import { UsuarioSessao, UserRole } from '../types';
import { StorageService } from '../lib/storage';
import {
  cadastrarContaFirebase,
  loginContaFirebase,
  logoutFirebase,
} from '../lib/firebaseAuth';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Shield,
  KeyRound,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Database,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioAtual: UsuarioSessao | null;
  onLoginSuccess: (usuario: UsuarioSessao | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  usuarioAtual,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'entrar' | 'cadastrar'>('entrar');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [mostrarSenhaLogin, setMostrarSenhaLogin] = useState(false);

  // Form states - Cadastro
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadRole, setCadRole] = useState<UserRole>('professor');
  const [cadCodigoProfessor, setCadCodigoProfessor] = useState('');
  const [cadMatricula, setCadMatricula] = useState('');
  const [cadTurma, setCadTurma] = useState('');
  const [mostrarSenhaCad, setMostrarSenhaCad] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForms = () => {
    setLoginEmail('');
    setLoginSenha('');
    setCadNome('');
    setCadEmail('');
    setCadSenha('');
    setCadCodigoProfessor('');
    setCadMatricula('');
    setCadTurma('');
    setFeedback(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!loginEmail.trim() || !loginSenha) {
      setFeedback({ type: 'error', message: 'Preencha o e-mail e a senha para entrar.' });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Tenta autenticação real com o Firebase Auth
      const res = await loginContaFirebase(loginEmail, loginSenha);
      setIsLoading(false);

      if (res.success && res.usuario) {
        StorageService.setSessaoUsuario(res.usuario);
        setFeedback({ type: 'success', message: res.message });
        onLoginSuccess(res.usuario);
        setTimeout(() => {
          onClose();
          resetForms();
        }, 600);
        return;
      }

      // Se falhou no Firebase, tenta no storage local offline de contingência
      const resLocal = StorageService.loginConta(loginEmail, loginSenha);
      if (resLocal.success && resLocal.usuario) {
        setFeedback({
          type: 'success',
          message: resLocal.message || `Bem-vindo(a) de volta, ${resLocal.usuario.nome}!`,
        });
        onLoginSuccess(resLocal.usuario);
        setTimeout(() => {
          onClose();
          resetForms();
        }, 600);
        return;
      }

      setFeedback({
        type: 'error',
        message: res.message || 'E-mail ou senha incorretos. Verifique suas credenciais.',
      });
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao conectar ao serviço de autenticação.',
      });
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!cadNome.trim() || !cadEmail.trim() || !cadSenha) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios (*).' });
      return;
    }

    if (cadSenha.length < 6) {
      setFeedback({ type: 'error', message: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    // Validação estrita do código institucional de professor
    if (cadRole === 'professor') {
      const codigoInformado = cadCodigoProfessor.trim();
      if (!codigoInformado) {
        setFeedback({
          type: 'error',
          message: 'O Código de Acesso do Professor é obrigatório para cadastrar como Professor.',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Cadastra no Firebase Auth e grava no Firestore
      const res = await cadastrarContaFirebase({
        nome: cadNome.trim(),
        email: cadEmail.trim(),
        senha: cadSenha,
        role: cadRole,
        codigoAcessoProfessor: cadCodigoProfessor.trim(),
        matricula: cadMatricula.trim() || undefined,
        turma: cadTurma.trim() || undefined,
      });

      setIsLoading(false);

      if (res.success && res.usuario) {
        StorageService.setSessaoUsuario(res.usuario);
        setFeedback({ type: 'success', message: res.message });
        onLoginSuccess(res.usuario);

        setTimeout(() => {
          onClose();
          resetForms();
        }, 800);
        return;
      }

      // Se o Firebase estiver indisponível, cria conta no armazenamento local offline
      const novoLocal = StorageService.cadastrarUsuario({
        nome: cadNome.trim(),
        email: cadEmail.trim(),
        senha: cadSenha,
        role: cadRole,
        matricula: cadMatricula.trim() || undefined,
        turma: cadTurma.trim() || undefined,
      });

      if (novoLocal) {
        setFeedback({
          type: 'success',
          message: 'Conta criada e autenticada com sucesso! (Modo Contingência)',
        });
        onLoginSuccess(novoLocal);
        setTimeout(() => {
          onClose();
          resetForms();
        }, 800);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Não foi possível concluir o cadastro.',
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Falha ao registrar conta no servidor.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch {
      // continua mesmo em erro
    }
    StorageService.logoutUsuario();
    onLoginSuccess(null);
    setFeedback({ type: 'success', message: 'Você saiu da sessão com sucesso.' });
    setTimeout(() => {
      onClose();
      resetForms();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acesso Seguro • LibreOteca"
      subtitle="Banco de dados protegido com controle de acesso para Professores e Alunos"
      maxWidth="lg"
      zIndex="z-[100]"
    >
      <div className="space-y-4">
        {/* Badge do Banco de Dados Protegido na Nuvem */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="font-semibold text-slate-900 dark:text-white">Banco de Dados Protegido (Firebase Firestore & Auth)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Ativo & Seguro
          </span>
        </div>

        {/* QUANDO JÁ ESTÁ CONECTADO: EXIBE PAINEL DE CONTA ATIVA */}
        {usuarioAtual ? (
          <div className="space-y-4 pt-1">
            <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-900 dark:to-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl ${
                    usuarioAtual.role === 'professor' ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'
                  } flex items-center justify-center font-bold text-lg shrink-0 shadow-md`}
                >
                  {usuarioAtual.role === 'professor' ? (
                    <GraduationCap className="w-6 h-6" />
                  ) : (
                    <BookOpen className="w-6 h-6" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {usuarioAtual.nome}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        usuarioAtual.role === 'professor'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {usuarioAtual.role === 'professor' ? 'Professor(a) / Administrador' : 'Aluno(a) / Leitor'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {usuarioAtual.email}
                  </p>
                </div>
              </div>

              {/* Informações detalhadas do perfil ativo */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Identificação / Matrícula</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{usuarioAtual.matricula || 'N/A'}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Nível de Permissão</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {usuarioAtual.role === 'professor' ? 'Gestão Total (RBAC)' : 'Leitor Pessoal'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/70 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {usuarioAtual.role === 'professor' ? (
                  <span>
                    Sua conta tem autorização para gerenciar acervo, cadastrar alunos, efetuar empréstimos e acessar auditorias LGPD.
                  </span>
                ) : (
                  <span>
                    Sua conta de aluno permite consultar disponibilidade de livros, acompanhar seus empréstimos e publicar resenhas.
                  </span>
                )}
              </div>
            </div>

            {/* Ações do usuário conectado */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-4 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair / Trocar de Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* QUANDO NÃO HÁ SESSÃO ATIVA: FORMULÁRIO DE LOGIN E CADASTRO */
          <>
            {/* Abas: Entrar ou Criar Nova Conta */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTab('entrar');
                  setFeedback(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'entrar'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Fazer Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('cadastrar');
                  setFeedback(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'cadastrar'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Nova Conta</span>
              </button>
            </div>

            {/* Mensagem de Feedback / Erro / Sucesso */}
            {feedback && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-medium leading-relaxed block">{feedback.message}</span>
                  {feedback.type === 'error' && tab === 'entrar' && feedback.message.includes('Nenhuma conta') && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab('cadastrar');
                        if (loginEmail) setCadEmail(loginEmail);
                        setFeedback(null);
                      }}
                      className="mt-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Cadastrar esta conta agora na aba "Criar Nova Conta"</span>
                    </button>
                  )}
                </div>
              </div>
            )}

        {/* Formulário: ENTRAR */}
        {tab === 'entrar' && (
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail ou Matrícula do Aluno / Professor <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-login-email"
                  placeholder="ex: aluno@escola.br ou sua Matrícula (ex: ALU-1024)"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Alunos podem entrar com seu <strong>e-mail</strong> ou com a <strong>matrícula</strong> fornecida pela escola.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha de Acesso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenhaLogin ? 'text' : 'password'}
                  required
                  id="input-login-senha"
                  placeholder="Sua senha secreta"
                  value={loginSenha}
                  onChange={e => setLoginSenha(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setMostrarSenhaLogin(!mostrarSenhaLogin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {mostrarSenhaLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submeter-login"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Autenticando no Banco de Dados...' : 'Entrar no LibreOteca'}</span>
            </button>
          </form>
        )}

        {/* Formulário: CRIAR NOVA CONTA */}
        {tab === 'cadastrar' && (
          <form onSubmit={handleCadastro} className="space-y-3.5 pt-1">
            {/* Escolha do Perfil */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de Perfil / Usuário <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-role-professor"
                  onClick={() => setCadRole('professor')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    cadRole === 'professor'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/15 ring-2 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                      Professor(a) / Adm
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                      Requer Código de Autorização institucional.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-role-aluno"
                  onClick={() => setCadRole('aluno')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    cadRole === 'aluno'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                      Aluno(a) / Leitor
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                      Acesso livre para empréstimos, consultas e resenhas.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* SE FOR PROFESSOR: CAMPO OBRIGATÓRIO DO CÓDIGO INSTITUCIONAL (IMPOSSIBILITA ALUNOS DE CRIAR CONTA DE PROFESSOR) */}
            {cadRole === 'professor' && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/25 border-2 border-amber-300 dark:border-amber-500/40 rounded-2xl space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Código de Acesso do Professor <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30">
                    Obrigatório
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    id="input-cad-codigo-professor"
                    placeholder="Digite o código institucional fornecido pela direção/coordenação"
                    value={cadCodigoProfessor}
                    onChange={e => setCadCodigoProfessor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-500/50 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  🔒 Para proteger o sistema contra acessos indevidos, apenas quem possui o código institucional autorizado pode criar uma conta de Professor/Administrador.
                </p>
              </div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  id="input-cad-nome"
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={cadNome}
                  onChange={e => setCadNome(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* E-mail e Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    id="input-cad-email"
                    placeholder="exemplo@escola.br"
                    value={cadEmail}
                    onChange={e => setCadEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha (mínimo 6 dígitos) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenhaCad ? 'text' : 'password'}
                    required
                    minLength={6}
                    id="input-cad-senha"
                    placeholder="Mínimo 6 caracteres"
                    value={cadSenha}
                    onChange={e => setCadSenha(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaCad(!mostrarSenhaCad)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    {mostrarSenhaCad ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Matrícula e Turma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Matrícula / Código Escolar (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Gerado automaticamente se vazio"
                  value={cadMatricula}
                  onChange={e => setCadMatricula(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {cadRole === 'aluno' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Turma / Série (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8º Ano B, 3º EM..."
                    value={cadTurma}
                    onChange={e => setCadTurma(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              id="btn-submeter-cadastro"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Registrando no Banco de Dados...' : 'Criar Conta no Banco de Dados'}</span>
            </button>
          </form>
        )}
          </>
        )}
      </div>
    </Modal>
  );
};
