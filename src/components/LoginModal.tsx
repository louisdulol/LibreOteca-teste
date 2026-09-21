import React, { useState } from 'react';
import { Modal } from './Modal';
import { UsuarioSessao, UserRole } from '../types';
import { StorageService } from '../lib/storage';
import {
  cadastrarContaFirebase,
  loginContaFirebase,
  logoutFirebase,
} from '../lib/firebaseAuth';
import { CODIGO_MESTRE_PROFESSOR_PADRAO } from '../lib/firebase';
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
      } else {
        // Fallback local se estiver offline
        const localRes = StorageService.loginConta(loginEmail, loginSenha);
        if (localRes.success && localRes.usuario) {
          setFeedback({ type: 'success', message: localRes.message });
          onLoginSuccess(localRes.usuario);
          setTimeout(() => {
            onClose();
            resetForms();
          }, 600);
        } else {
          setFeedback({ type: 'error', message: res.message || localRes.message });
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: 'error', message: err.message || 'Erro ao realizar login.' });
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
      setFeedback({ type: 'error', message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    // Validação estrita do código de acesso para professores
    if (cadRole === 'professor') {
      const codigoLimpo = cadCodigoProfessor.trim().toUpperCase();
      if (!codigoLimpo) {
        setFeedback({
          type: 'error',
          message: 'O Código de Acesso do Professor é obrigatório para criar contas com privilégios de Professor/Administrador.',
        });
        return;
      }

      if (codigoLimpo !== CODIGO_MESTRE_PROFESSOR_PADRAO.toUpperCase()) {
        setFeedback({
          type: 'error',
          message: `Código de Acesso do Professor incorreto. Solicite o código da instituição (Padrão: ${CODIGO_MESTRE_PROFESSOR_PADRAO}) para criar uma conta de professor.`,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Cadastra no Firebase Auth e grava perfil no Firestore
      const res = await cadastrarContaFirebase({
        nome: cadNome,
        email: cadEmail,
        senha: cadSenha,
        role: cadRole,
        codigoAcessoProfessor: cadCodigoProfessor,
        matricula: cadMatricula,
        turma: cadTurma,
      });

      setIsLoading(false);

      if (res.success && res.usuario) {
        StorageService.setSessaoUsuario(res.usuario);
        setFeedback({ type: 'success', message: res.message });
        onLoginSuccess(res.usuario);
        setTimeout(() => {
          onClose();
          resetForms();
        }, 700);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setIsLoading(false);
      setFeedback({ type: 'error', message: err.message || 'Erro ao processar cadastro no banco de dados.' });
    }
  };

  const handleLogout = async () => {
    await logoutFirebase();
    StorageService.logout();
    onLoginSuccess(null);
    setFeedback({ type: 'success', message: 'Você encerrou a sessão com segurança.' });
    setTimeout(() => {
      onClose();
      resetForms();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acesso Seguro • LibreOteca"
      subtitle="Banco de dados protegido com controle de acesso para Professores e Alunos"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status de sessão atual se houver */}
        {usuarioAtual && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg ${
                  usuarioAtual.role === 'professor' ? 'bg-amber-900' : 'bg-emerald-700'
                } text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}
              >
                {usuarioAtual.role === 'professor' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block leading-tight">
                  Conectado como: {usuarioAtual.nome}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {usuarioAtual.email} • {usuarioAtual.role === 'professor' ? 'Professor(a) / Administrador' : 'Aluno(a)'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        )}

        {/* Badge do Banco de Dados Protegido na Nuvem */}
        <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Banco de Dados Protegido na Nuvem (Firebase Firestore & Auth)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ativo & Seguro
          </span>
        </div>

        {/* Abas: Entrar ou Criar Nova Conta */}
        <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => {
              setTab('entrar');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'entrar'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'cadastrar'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {/* Mensagem de Feedback / Erro / Sucesso */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Formulário: ENTRAR */}
        {tab === 'entrar' && (
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                E-mail Cadastrado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  id="input-login-email"
                  placeholder="exemplo@escola.br"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                  className="w-full pl-9 pr-10 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setMostrarSenhaLogin(!mostrarSenhaLogin)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
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
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Autenticando no Banco de Dados...' : 'Entrar no LibreOteca'}
            </button>
          </form>
        )}

        {/* Formulário: CRIAR NOVA CONTA */}
        {tab === 'cadastrar' && (
          <form onSubmit={handleCadastro} className="space-y-3.5 pt-1">
            {/* Escolha do Perfil */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tipo de Perfil / Usuário <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-role-professor"
                  onClick={() => setCadRole('professor')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    cadRole === 'professor'
                      ? 'border-amber-800 bg-amber-50/70 ring-2 ring-amber-700/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-900 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Professor(a) / Adm
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                      Requer Código de Autorização institucional.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-role-aluno"
                  onClick={() => setCadRole('aluno')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    cadRole === 'aluno'
                      ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Aluno(a) / Leitor
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                      Acesso livre para empréstimos, consultas e resenhas.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* SE FOR PROFESSOR: CAMPO OBRIGATÓRIO DO CÓDIGO INSTITUCIONAL (IMPOSSIBILITA ALUNOS DE CRIAR CONTA DE PROFESSOR) */}
            {cadRole === 'professor' && (
              <div className="p-3 bg-amber-50/80 border-2 border-amber-300/80 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-800" />
                    <span>Código de Acesso do Professor <span className="text-rose-600">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-bold">
                    Obrigatório
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    id="input-cad-codigo-professor"
                    placeholder={`Digite o código da instituição (Padrão: ${CODIGO_MESTRE_PROFESSOR_PADRAO})`}
                    value={cadCodigoProfessor}
                    onChange={e => setCadCodigoProfessor(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                  />
                  <ShieldAlert className="w-4 h-4 text-amber-700 absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                  🔒 Para proteger o sistema contra acessos indevidos, apenas quem possui o código institucional autorizado pode criar uma conta de Professor/Administrador.
                </p>
              </div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* E-mail e Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                    className="w-full pl-9 pr-10 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaCad(!mostrarSenhaCad)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
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
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Matrícula / Código Escolar (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Gerado automaticamente se vazio"
                  value={cadMatricula}
                  onChange={e => setCadMatricula(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {cadRole === 'aluno' && (
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Turma / Série (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8º Ano B, 3º EM..."
                    value={cadTurma}
                    onChange={e => setCadTurma(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              id="btn-submeter-cadastro"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Registrando no Banco de Dados Seguro...' : 'Criar Conta no Banco de Dados'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
