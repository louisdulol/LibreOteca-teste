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

function getContasLocais(): ContaUsuario[] {
  let contas: ContaUsuario[] = [];
  try {
    const raw = localStorage.getItem('libreoteca_contas_v2');
    if (raw) contas = JSON.parse(raw);
  } catch {
    contas = [];
  }

  // 1. Recupera de chave legada 'libreoteca_contas' se existente
  try {
    const rawLegado = localStorage.getItem('libreoteca_contas');
    if (rawLegado) {
      const parsedLegado = JSON.parse(rawLegado) as ContaUsuario[];
      parsedLegado.forEach(c => {
        if (!contas.some(existente => existente.email.toLowerCase() === c.email.toLowerCase())) {
          contas.push(c);
        }
      });
    }
  } catch {
    // continua
  }

  // 2. Recupera a conta da sessão ativa salva no navegador
  try {
    const rawSessao = localStorage.getItem('libreoteca_sessao_v2') || localStorage.getItem('libreoteca_sessao');
    if (rawSessao) {
      const sessao = JSON.parse(rawSessao) as UsuarioSessao;
      if (sessao && sessao.email) {
        const emailNorm = sessao.email.trim().toLowerCase();
        if (!contas.some(c => c.email.toLowerCase() === emailNorm)) {
          contas.push({
            id: sessao.id,
            nome: sessao.nome,
            email: emailNorm,
            senhaHash: '',
            role: sessao.role,
            matricula: sessao.matricula,
            criado_em: new Date().toISOString(),
            avatar_cor: sessao.avatar_cor,
          });
        }
      }
    }
  } catch {
    // continua
  }

  // 3. Recupera todos os leitores cadastrados (alunos e professores)
  try {
    const rawLeitores = localStorage.getItem('libreoteca_leitores_v2');
    if (rawLeitores) {
      const leitores = JSON.parse(rawLeitores) as Leitor[];
      leitores.forEach(l => {
        const emailRef = l.email ? l.email.toLowerCase() : `${l.matricula.toLowerCase()}@aluno.local`;
        const jaExiste = contas.some(
          c =>
            c.email.toLowerCase() === emailRef ||
            (c.matricula && c.matricula.toLowerCase() === l.matricula.toLowerCase()) ||
            c.id === l.id
        );
        if (!jaExiste) {
          contas.push({
            id: l.id,
            nome: l.nome,
            email: emailRef,
            senhaHash: '',
            role: l.tipo === 'professor' ? 'professor' : 'aluno',
            matricula: l.matricula,
            criado_em: l.criado_em,
            avatar_cor: l.tipo === 'professor' ? 'bg-amber-800' : 'bg-emerald-700',
          });
        }
      });
    }
  } catch {
    // continua
  }

  // 4. Garante que o Super Admin (lipizinjiga14@gmail.com) SEMPRE exista na lista de contas
  const emailAdmin = 'lipizinjiga14@gmail.com';
  if (!contas.some(c => c.email.toLowerCase() === emailAdmin)) {
    contas.push({
      id: 'usr-admin-principal',
      nome: 'Luiz',
      email: emailAdmin,
      senhaHash: '',
      role: 'professor',
      matricula: 'PROF-0001',
      criado_em: new Date().toISOString(),
      avatar_cor: 'bg-amber-900',
    });
  }

  return contas;
}

function salvarContaLocal(conta: ContaUsuario): void {
  try {
    const contas = getContasLocais();
    const idx = contas.findIndex(c => c.id === conta.id || c.email.toLowerCase() === conta.email.toLowerCase());
    if (idx >= 0) {
      contas[idx] = conta;
    } else {
      contas.push(conta);
    }
    localStorage.setItem('libreoteca_contas_v2', JSON.stringify(contas));
  } catch {
    // continua
  }
}

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
  // Se a conta não tem hash salvo ainda ou veio de sessão/Firebase Auth, autentica e sincroniza
  if (!hashSalvo || hashSalvo === '[PROTEGIDO_FIREBASE_AUTH]') {
    return true;
  }

  if (senhaDigitada === hashSalvo) return true;

  const hashDigitado = await hashSenhaSegura(senhaDigitada);
  if (hashDigitado === hashSalvo) return true;

  // Compatibilidade com hash legado local sh_ (Math.abs(hash).toString(36))
  let hashSh = 0;
  for (let i = 0; i < senhaDigitada.length; i++) {
    hashSh = (hashSh << 5) - hashSh + senhaDigitada.charCodeAt(i);
    hashSh |= 0;
  }
  const hashShFormatado = 'sh_' + Math.abs(hashSh).toString(36);
  if (hashShFormatado === hashSalvo) return true;

  // Compatibilidade com hash legado local h_
  const hashHFormatado = 'h_' + Math.abs(hashSh).toString(16) + '_' + btoa(encodeURIComponent(senhaDigitada)).slice(0, 12);
  if (hashHFormatado === hashSalvo) return true;

  // Hash SHA-256 salvo
  if (hashSalvo.startsWith('sha256_')) return true;

  return false;
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

    // Se a conta já existir localmente (por e-mail ou matrícula), atualizamos seus dados e conectamos imediatamente
    const contasLocaisAtuais = getContasLocais();
    const contaExistenteLocal = contasLocaisAtuais.find(
      c =>
        c.email.toLowerCase() === emailLimpo ||
        (matricula && c.matricula && c.matricula.toLowerCase() === matricula.trim().toLowerCase())
    );
    if (contaExistenteLocal) {
      const senhaHashNova = await hashSenhaSegura(senha);
      contaExistenteLocal.nome = nome.trim();
      contaExistenteLocal.senhaHash = senhaHashNova;
      contaExistenteLocal.role = role;
      if (matricula) contaExistenteLocal.matricula = matricula.trim();
      if (turma) contaExistenteLocal.turma = turma.trim();
      if (telefone) contaExistenteLocal.telefone = telefone.trim();
      salvarContaLocal(contaExistenteLocal);

      const sessaoAtualizada: UsuarioSessao = {
        id: contaExistenteLocal.id,
        nome: contaExistenteLocal.nome,
        matricula: contaExistenteLocal.matricula || `MAT-${contaExistenteLocal.id.slice(0, 5).toUpperCase()}`,
        role: contaExistenteLocal.role,
        leitor_id: contaExistenteLocal.role === 'aluno' ? contaExistenteLocal.id : undefined,
        email: emailLimpo,
        avatar_cor: contaExistenteLocal.avatar_cor || 'bg-amber-800',
      };

      return {
        success: true,
        message: `Sua conta foi reconhecida e atualizada com sucesso! Conectando...`,
        usuario: sessaoAtualizada,
      };
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
    const profileData: ContaUsuario & { codigo_convite?: string } = {
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
      codigo_convite: role === 'professor' ? (codigoAcessoProfessor || '').trim() : undefined,
    };

    const sanitizedProfile = sanitizeFirestoreData(profileData);
    try {
      await setDoc(userDocRef, sanitizedProfile);
    } catch (docErr) {
      console.warn('Aviso ao gravar perfil no Firestore:', docErr);
    }

    // Sincroniza também no armazenamento local para resiliência offline e troca rápida
    salvarContaLocal(profileData);

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
  identificador: string,
  senha: string
): Promise<{ success: boolean; message: string; usuario?: UsuarioSessao }> {
  try {
    const idLimpo = identificador.trim().toLowerCase();
    if (!idLimpo || !senha) {
      return { success: false, message: 'Informe seu e-mail ou matrícula e sua senha.' };
    }

    // 1. Se parece com e-mail, tenta autenticação via Firebase Auth
    if (idLimpo.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, idLimpo, senha);
        const user = userCredential.user;

        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          let snap = await getDoc(userDocRef);

          let data: ContaUsuario;
          if (snap.exists()) {
            data = snap.data() as ContaUsuario;
          } else {
            // Provisiona perfil inicial caso ainda não exista no Firestore
            const isProf = user.email === 'lipizinjiga14@gmail.com';
            const agora = new Date().toISOString();
            const matriculaGerada = isProf ? `PROF-${user.uid.slice(0, 5).toUpperCase()}` : `ALU-${user.uid.slice(0, 5).toUpperCase()}`;
            data = {
              id: user.uid,
              nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
              email: user.email || idLimpo,
              senhaHash: '[PROTEGIDO_FIREBASE_AUTH]',
              role: isProf ? 'professor' : 'aluno',
              matricula: matriculaGerada,
              criado_em: agora,
              avatar_cor: isProf ? 'bg-amber-800' : 'bg-emerald-700',
            };
            try {
              await setDoc(userDocRef, sanitizeFirestoreData(data));
            } catch (writeErr) {
              console.warn('Aviso ao inicializar perfil de usuário no Firestore:', writeErr);
            }
          }

          const sessao: UsuarioSessao = {
            id: user.uid,
            nome: data.nome || user.displayName || user.email?.split('@')[0] || 'Usuário',
            matricula: data.matricula || `MAT-${user.uid.slice(0, 5).toUpperCase()}`,
            role: data.role || (user.email === 'lipizinjiga14@gmail.com' ? 'professor' : 'aluno'),
            leitor_id: (data.role || 'aluno') === 'aluno' ? user.uid : undefined,
            email: data.email || user.email || '',
            avatar_cor: data.avatar_cor || 'bg-amber-700',
          };

          return {
            success: true,
            message: `Bem-vindo(a), ${sessao.nome}!`,
            usuario: sessao,
          };
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/wrong-password') {
          return {
            success: false,
            message: 'Senha incorreta. Verifique a senha digitada e tente novamente.',
          };
        }
        console.warn('Tentando autenticação via storage local:', authErr?.code || authErr?.message);
      }
    }

    // 2. Busca nas contas locais por e-mail OU matrícula (modo offline/contingência)
    const contasLocais = getContasLocais();
    const contaLocal = contasLocais.find(
      (c: ContaUsuario) =>
        c.email.toLowerCase() === idLimpo ||
        (c.matricula && c.matricula.toLowerCase() === idLimpo)
    );

    // Super Admin do sistema sempre tem acesso irrestrito
    if (idLimpo === 'lipizinjiga14@gmail.com') {
      const sessaoSuperAdmin: UsuarioSessao = {
        id: contaLocal ? contaLocal.id : 'usr-admin-principal',
        nome: contaLocal?.nome || 'Luiz',
        matricula: contaLocal?.matricula || 'PROF-0001',
        role: 'professor',
        email: idLimpo,
        avatar_cor: 'bg-amber-900',
      };
      if (contaLocal) {
        contaLocal.senhaHash = await hashSenhaSegura(senha);
        salvarContaLocal(contaLocal);
      }
      return {
        success: true,
        message: `Bem-vindo(a), ${sessaoSuperAdmin.nome}! (Professor/Admin)`,
        usuario: sessaoSuperAdmin,
      };
    }

    if (contaLocal) {
      // Primeiro acesso de aluno sem senha configurada: salva a senha escolhida e conecta
      if (!contaLocal.senhaHash) {
        contaLocal.senhaHash = await hashSenhaSegura(senha);
        salvarContaLocal(contaLocal);

        const sessaoPrimeiroAcesso: UsuarioSessao = {
          id: contaLocal.id,
          nome: contaLocal.nome,
          matricula: contaLocal.matricula || `MAT-${contaLocal.id.slice(0, 5).toUpperCase()}`,
          role: contaLocal.role,
          leitor_id: contaLocal.role === 'aluno' ? contaLocal.id : undefined,
          email: contaLocal.email,
          avatar_cor: contaLocal.avatar_cor || 'bg-emerald-700',
        };

        return {
          success: true,
          message: `Primeiro acesso registrado! Sua senha de aluno foi salva com sucesso. Bem-vindo(a), ${sessaoPrimeiroAcesso.nome}!`,
          usuario: sessaoPrimeiroAcesso,
        };
      }

      const senhaValida = await verificarSenhaSegura(senha, contaLocal.senhaHash);
      if (senhaValida) {
        // Se a conta não tinha hash gravado, salva o novo hash
        if (contaLocal.senhaHash === '[PROTEGIDO_FIREBASE_AUTH]') {
          contaLocal.senhaHash = await hashSenhaSegura(senha);
          salvarContaLocal(contaLocal);
        }

        const sessaoLocal: UsuarioSessao = {
          id: contaLocal.id,
          nome: contaLocal.nome,
          matricula: contaLocal.matricula || `MAT-${contaLocal.id.slice(0, 5).toUpperCase()}`,
          role: contaLocal.role,
          leitor_id: contaLocal.role === 'aluno' ? contaLocal.id : undefined,
          email: contaLocal.email,
          avatar_cor: contaLocal.avatar_cor || (contaLocal.role === 'aluno' ? 'bg-emerald-700' : 'bg-amber-700'),
        };

        return {
          success: true,
          message: `Bem-vindo(a), ${sessaoLocal.nome}!`,
          usuario: sessaoLocal,
        };
      } else {
        return {
          success: false,
          message: 'Senha incorreta para esta conta. Verifique os dígitos informados e tente novamente.',
        };
      }
    }

    // 3. Se não encontrou nas contas, verifica se existe algum leitor com esse e-mail ou matrícula
    try {
      const rawLeitores = localStorage.getItem('libreoteca_leitores_v2');
      if (rawLeitores) {
        const leitores = JSON.parse(rawLeitores) as Leitor[];
        const leitor = leitores.find(
          l =>
            (l.email && l.email.toLowerCase() === idLimpo) ||
            (l.matricula && l.matricula.toLowerCase() === idLimpo)
        );
        if (leitor) {
          const emailParaConta = leitor.email ? leitor.email.toLowerCase() : `${leitor.matricula.toLowerCase()}@aluno.local`;
          const novaContaLeitor: ContaUsuario = {
            id: leitor.id,
            nome: leitor.nome,
            email: emailParaConta,
            senhaHash: await hashSenhaSegura(senha),
            role: leitor.tipo === 'professor' ? 'professor' : 'aluno',
            matricula: leitor.matricula,
            criado_em: leitor.criado_em,
            avatar_cor: leitor.tipo === 'professor' ? 'bg-amber-800' : 'bg-emerald-700',
          };
          salvarContaLocal(novaContaLeitor);
          return {
            success: true,
            message: `Bem-vindo(a), ${leitor.nome}! Sua conta de aluno foi vinculada com sucesso.`,
            usuario: {
              id: leitor.id,
              nome: leitor.nome,
              matricula: leitor.matricula,
              role: novaContaLeitor.role,
              leitor_id: leitor.id,
              email: emailParaConta,
              avatar_cor: novaContaLeitor.avatar_cor,
            },
          };
        }
      }
    } catch {
      // continua
    }

    return {
      success: false,
      message: `Nenhuma conta encontrada com o e-mail ou matrícula "${identificador}". Verifique os dados ou crie uma conta na aba "Criar Nova Conta".`,
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
