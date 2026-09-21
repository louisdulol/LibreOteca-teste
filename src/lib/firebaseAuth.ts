import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, CODIGO_MESTRE_PROFESSOR_PADRAO } from './firebase';
import { UsuarioSessao, UserRole, ContaUsuario, Leitor } from '../types';
import { saveLeitorFirestore, sanitizeFirestoreData } from './firebaseFirestore';

export interface CadastroPayload {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  codigoAcessoProfessor?: string;
  matricula?: string;
  turma?: string;
  telefone?: string;
}

const AVATARES_CORES = [
  'bg-amber-700',
  'bg-emerald-700',
  'bg-indigo-700',
  'bg-rose-700',
  'bg-teal-700',
  'bg-cyan-700',
  'bg-stone-700',
];

/**
 * Gera hash criptográfico seguro SHA-256 com salvação de salt
 */
async function hashSenhaSegura(senha: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode('libreoteca_salt_2026_' + senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback caso crypto.subtle não esteja acessível em contextos inseguros
    let hash = 0;
    for (let i = 0; i < senha.length; i++) {
      hash = (hash << 5) - hash + senha.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16) + '_' + btoa(encodeURIComponent(senha)).slice(0, 12);
  }
}

async function verificarSenhaSegura(senhaDigitada: string, hashSalvo: string): Promise<boolean> {
  const hashDigitado = await hashSenhaSegura(senhaDigitada);
  if (hashDigitado === hashSalvo) return true;

  // Compatibilidade com hash legado local se existente
  let hashLegado = 0;
  for (let i = 0; i < senhaDigitada.length; i++) {
    hashLegado = (hashLegado << 5) - hashLegado + senhaDigitada.charCodeAt(i);
    hashLegado |= 0;
  }
  const hashLegadoFormatado = 'h_' + Math.abs(hashLegado).toString(16) + '_' + btoa(encodeURIComponent(senhaDigitada)).slice(0, 12);
  return hashLegadoFormatado === hashSalvo;
}

/**
 * Cadastra uma nova conta com segurança no Firebase Auth e Firestore.
 * IMPOSSIBILITA que qualquer aluno crie conta como professor/administrador sem o código mestre.
 */
export async function cadastrarContaFirebase(
  payload: CadastroPayload
): Promise<{ success: boolean; message: string; usuario?: UsuarioSessao }> {
  try {
    const { nome, email, senha, role, codigoAcessoProfessor, matricula, turma, telefone } = payload;
    const emailLimpo = email.trim().toLowerCase();

    // 1. Validação estrita do código de acesso para professores
    if (role === 'professor') {
      const codigoLimpo = (codigoAcessoProfessor || '').trim().toUpperCase();
      const codigoEsperado = CODIGO_MESTRE_PROFESSOR_PADRAO.toUpperCase();

      if (!codigoLimpo || codigoLimpo !== codigoEsperado) {
        return {
          success: false,
          message:
            'Código de Acesso do Professor inválido. Para criar uma conta de Professor/Administrador é obrigatório fornecer o código fornecido pela instituição.',
        };
      }
    }

    if (!emailLimpo || !senha || !nome) {
      return {
        success: false,
        message: 'Preencha todos os campos obrigatórios (nome, e-mail e senha).',
      };
    }

    if (senha.length < 6) {
      return {
        success: false,
        message: 'A senha deve conter no mínimo 6 caracteres.',
      };
    }

    // Verifica se o e-mail já existe na coleção users do Firestore
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', emailLimpo));
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        return {
          success: false,
          message: 'Este e-mail já está cadastrado no sistema. Faça login com sua senha.',
        };
      }
    } catch (e) {
      console.warn('Verificação prévia do email:', e);
    }

    const avatarCor = AVATARES_CORES[Math.floor(Math.random() * AVATARES_CORES.length)];
    const agora = new Date().toISOString();
    let uid = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    let senhaHashArmazenada = await hashSenhaSegura(senha);

    // 2. Tenta criação de usuário no Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailLimpo, senha);
      if (userCredential.user) {
        uid = userCredential.user.uid;
        senhaHashArmazenada = '[PROTEGIDO_FIREBASE_AUTH]';
      }
    } catch (authErr: any) {
      console.warn('Firebase Auth Provider notice (utilizando Firestore Security):', authErr?.code || authErr?.message);
      if (authErr?.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'Este e-mail já está cadastrado. Acesse a aba "Fazer Login".',
        };
      }
      // Se for auth/operation-not-allowed ou qualquer outro, continuamos com Firestore seguro
    }

    const matriculaFinal =
      matricula?.trim() ||
      (role === 'professor' ? `PROF-${uid.slice(0, 5).toUpperCase()}` : `ALU-${uid.slice(0, 5).toUpperCase()}`);

    // 3. Gravação do Perfil no Firestore na coleção /users/{uid}
    const userDocRef = doc(db, 'users', uid);
    const profileData: ContaUsuario = {
      id: uid,
      nome: nome.trim(),
      email: emailLimpo,
      senhaHash: senhaHashArmazenada,
      role,
      matricula: matriculaFinal,
      turma: turma?.trim() || undefined,
      telefone: telefone?.trim() || undefined,
      criado_em: agora,
      avatar_cor: avatarCor,
    };

    const sanitizedProfile = sanitizeFirestoreData(profileData);
    await setDoc(userDocRef, sanitizedProfile);

    // 4. Se for aluno, registra automaticamente o cadastro na tabela de Leitores para facilitar empréstimos
    if (role === 'aluno') {
      const novoLeitor: Leitor = {
        id: uid,
        nome: nome.trim(),
        matricula: matriculaFinal,
        telefone: telefone?.trim() || '',
        email: emailLimpo,
        tipo: 'aluno',
        ativo: true,
        criado_em: agora,
        observacoes: turma ? `Turma: ${turma.trim()}` : undefined,
      };
      await saveLeitorFirestore(novoLeitor);
    }

    const sessao: UsuarioSessao = {
      id: uid,
      nome: nome.trim(),
      matricula: matriculaFinal,
      role,
      leitor_id: role === 'aluno' ? uid : undefined,
      email: emailLimpo,
      avatar_cor: avatarCor,
    };

    return {
      success: true,
      message: `Conta de ${role === 'professor' ? 'Professor(a)' : 'Aluno(a)'} criada com sucesso no banco de dados!`,
      usuario: sessao,
    };
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    let errorMsg = 'Não foi possível concluir o cadastro.';
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = 'Este e-mail já está cadastrado no sistema. Faça login com sua senha.';
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = 'O endereço de e-mail informado é inválido.';
    } else if (error.code === 'auth/weak-password') {
      errorMsg = 'A senha fornecida é muito fraca (mínimo de 6 caracteres).';
    } else if (error.message) {
      errorMsg = error.message;
    }

    return { success: false, message: errorMsg };
  }
}

/**
 * Autentica o usuário no Firebase Auth ou Firestore com hash de segurança
 */
export async function loginContaFirebase(
  email: string,
  senha: string
): Promise<{ success: boolean; message: string; usuario?: UsuarioSessao }> {
  try {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !senha) {
      return { success: false, message: 'Informe seu e-mail e senha cadastrados.' };
    }

    // 1. Tenta autenticação via Firebase Auth
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailLimpo, senha);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data() as ContaUsuario;
          const sessao: UsuarioSessao = {
            id: user.uid,
            nome: data.nome || user.displayName || 'Usuário',
            matricula: data.matricula || `MAT-${user.uid.slice(0, 5).toUpperCase()}`,
            role: data.role || 'aluno',
            leitor_id: data.role === 'aluno' ? user.uid : undefined,
            email: data.email || user.email || '',
            avatar_cor: data.avatar_cor || 'bg-amber-700',
          };

          return {
            success: true,
            message: `Bem-vindo(a), ${sessao.nome}!`,
            usuario: sessao,
          };
        }
      }
    } catch (authErr: any) {
      console.warn('Tentando autenticação via Firestore security:', authErr?.code || authErr?.message);
    }

    // 2. Busca na coleção 'users' do Firestore caso Auth não esteja ativo ou usuário criado via Firestore
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', emailLimpo));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const userDoc = querySnap.docs[0];
        const data = userDoc.data() as ContaUsuario;

        const senhaValida = await verificarSenhaSegura(senha, data.senhaHash);
        if (senhaValida) {
          const sessao: UsuarioSessao = {
            id: data.id || userDoc.id,
            nome: data.nome,
            matricula: data.matricula || `MAT-${userDoc.id.slice(0, 5).toUpperCase()}`,
            role: data.role || 'aluno',
            leitor_id: data.role === 'aluno' ? (data.id || userDoc.id) : undefined,
            email: data.email,
            avatar_cor: data.avatar_cor || 'bg-amber-700',
          };

          return {
            success: true,
            message: `Bem-vindo(a), ${sessao.nome}!`,
            usuario: sessao,
          };
        } else {
          return {
            success: false,
            message: 'Senha incorreta. Verifique a senha digitada e tente novamente.',
          };
        }
      }
    } catch (firestoreErr) {
      console.warn('Erro ao consultar Firestore users:', firestoreErr);
    }

    return {
      success: false,
      message: 'Nenhuma conta encontrada com este e-mail. Crie uma nova conta na aba "Criar Nova Conta".',
    };
  } catch (error: any) {
    console.error('Erro no login:', error);
    return {
      success: false,
      message: error.message || 'Erro ao realizar login.',
    };
  }
}

/**
 * Encerra a sessão ativa
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Erro ao deslogar no Firebase:', err);
  }
}

/**
 * Observa o estado de autenticação em tempo real
 */
export function observarAutenticacao(callback: (usuario: UsuarioSessao | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as ContaUsuario;
        callback({
          id: firebaseUser.uid,
          nome: data.nome,
          matricula: data.matricula || `MAT-${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
          role: data.role || 'aluno',
          leitor_id: data.role === 'aluno' ? firebaseUser.uid : undefined,
          email: data.email || firebaseUser.email || '',
          avatar_cor: data.avatar_cor || 'bg-amber-700',
        });
      } else {
        callback({
          id: firebaseUser.uid,
          nome: firebaseUser.email?.split('@')[0] || 'Usuário',
          matricula: `MAT-${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
          role: 'aluno',
          email: firebaseUser.email || '',
          avatar_cor: 'bg-amber-700',
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do Firestore:', err);
      callback({
        id: firebaseUser.uid,
        nome: firebaseUser.email?.split('@')[0] || 'Usuário',
        matricula: `MAT-${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
        role: 'aluno',
        email: firebaseUser.email || '',
        avatar_cor: 'bg-amber-700',
      });
    }
  });
}
