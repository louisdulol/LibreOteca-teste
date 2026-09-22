import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  Livro,
  Leitor,
  Emprestimo,
  ComentarioLivro,
  ConfiguracoesBiblioteca,
  AuditoriaRegistro,
  ContaUsuario,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTIONS = {
  USERS: 'users',
  LIVROS: 'livros',
  LEITORES: 'leitores',
  EMPRESTIMOS: 'emprestimos',
  COMENTARIOS: 'comentarios',
  CONFIGURACOES: 'configuracoes',
  AUDITORIA: 'auditoria',
};

/**
 * Remove qualquer campo com valor undefined de objetos para evitar erros no Firestore setDoc/updateDoc
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// ==========================================
// LIVROS
// ==========================================

export async function fetchLivrosFirestore(): Promise<Livro[]> {
  const path = COLLECTIONS.LIVROS;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Livro));
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Erro ao buscar livros no Firestore (usando fallback local):', error);
    return [];
  }
}

export async function saveLivroFirestore(livro: Livro): Promise<boolean> {
  const path = `${COLLECTIONS.LIVROS}/${livro.id}`;
  try {
    const ref = doc(db, COLLECTIONS.LIVROS, livro.id);
    const sanitized = sanitizeFirestoreData(livro);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Erro ao salvar livro no Firestore:', error);
    return false;
  }
}

export async function deleteLivroFirestore(id: string): Promise<boolean> {
  const path = `${COLLECTIONS.LIVROS}/${id}`;
  try {
    const ref = doc(db, COLLECTIONS.LIVROS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.warn('Erro ao deletar livro no Firestore:', error);
    return false;
  }
}

export function subscribeLivros(callback: (livros: Livro[]) => void) {
  const path = COLLECTIONS.LIVROS;
  const colRef = collection(db, path);
  return onSnapshot(
    colRef,
    snapshot => {
      const livros = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Livro));
      callback(livros);
    },
    err => {
      if (err.message.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('Erro na subscrição de livros:', err);
    }
  );
}

// ==========================================
// LEITORES
// ==========================================

export async function fetchLeitoresFirestore(): Promise<Leitor[]> {
  const path = COLLECTIONS.LEITORES;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Leitor));
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Erro ao buscar leitores no Firestore:', error);
    return [];
  }
}

export async function saveLeitorFirestore(leitor: Leitor): Promise<boolean> {
  const path = `${COLLECTIONS.LEITORES}/${leitor.id}`;
  try {
    const ref = doc(db, COLLECTIONS.LEITORES, leitor.id);
    const sanitized = sanitizeFirestoreData(leitor);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Erro ao salvar leitor no Firestore:', error);
    return false;
  }
}

export async function deleteLeitorFirestore(id: string): Promise<boolean> {
  const path = `${COLLECTIONS.LEITORES}/${id}`;
  try {
    const ref = doc(db, COLLECTIONS.LEITORES, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.warn('Erro ao deletar leitor no Firestore:', error);
    return false;
  }
}

export function subscribeLeitores(callback: (leitores: Leitor[]) => void) {
  const path = COLLECTIONS.LEITORES;
  const colRef = collection(db, path);
  return onSnapshot(
    colRef,
    snapshot => {
      const leitores = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Leitor));
      callback(leitores);
    },
    err => {
      if (err.message.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('Erro na subscrição de leitores:', err);
    }
  );
}

// ==========================================
// EMPRESTIMOS
// ==========================================

export async function fetchEmprestimosFirestore(): Promise<Emprestimo[]> {
  const path = COLLECTIONS.EMPRESTIMOS;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Emprestimo));
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Erro ao buscar empréstimos no Firestore:', error);
    return [];
  }
}

export async function saveEmprestimoFirestore(emprestimo: Emprestimo): Promise<boolean> {
  const path = `${COLLECTIONS.EMPRESTIMOS}/${emprestimo.id}`;
  try {
    const ref = doc(db, COLLECTIONS.EMPRESTIMOS, emprestimo.id);
    const sanitized = sanitizeFirestoreData(emprestimo);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Erro ao salvar empréstimo no Firestore:', error);
    return false;
  }
}

export async function deleteEmprestimoFirestore(id: string): Promise<boolean> {
  const path = `${COLLECTIONS.EMPRESTIMOS}/${id}`;
  try {
    const ref = doc(db, COLLECTIONS.EMPRESTIMOS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.warn('Erro ao deletar empréstimo no Firestore:', error);
    return false;
  }
}

export function subscribeEmprestimos(callback: (emprestimos: Emprestimo[]) => void) {
  const path = COLLECTIONS.EMPRESTIMOS;
  const colRef = collection(db, path);
  return onSnapshot(
    colRef,
    snapshot => {
      const emprestimos = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Emprestimo));
      callback(emprestimos);
    },
    err => {
      if (err.message.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('Erro na subscrição de empréstimos:', err);
    }
  );
}

// ==========================================
// COMENTARIOS & AVALIAÇÕES
// ==========================================

export async function fetchComentariosFirestore(): Promise<ComentarioLivro[]> {
  const path = COLLECTIONS.COMENTARIOS;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ComentarioLivro));
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn('Erro ao buscar comentários no Firestore:', error);
    return [];
  }
}

export async function saveComentarioFirestore(comentario: ComentarioLivro): Promise<boolean> {
  const path = `${COLLECTIONS.COMENTARIOS}/${comentario.id}`;
  try {
    const ref = doc(db, COLLECTIONS.COMENTARIOS, comentario.id);
    const sanitized = sanitizeFirestoreData(comentario);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Erro ao salvar comentário no Firestore:', error);
    return false;
  }
}

export async function deleteComentarioFirestore(id: string): Promise<boolean> {
  const path = `${COLLECTIONS.COMENTARIOS}/${id}`;
  try {
    const ref = doc(db, COLLECTIONS.COMENTARIOS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.warn('Erro ao deletar comentário no Firestore:', error);
    return false;
  }
}

export function subscribeComentarios(callback: (comentarios: ComentarioLivro[]) => void) {
  const path = COLLECTIONS.COMENTARIOS;
  const colRef = collection(db, path);
  return onSnapshot(
    colRef,
    snapshot => {
      const comentarios = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ComentarioLivro));
      callback(comentarios);
    },
    err => {
      if (err.message.includes('permission-denied')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      console.warn('Erro na subscrição de comentários:', err);
    }
  );
}

// ==========================================
// CONFIGURAÇÕES
// ==========================================

export async function fetchConfiguracoesFirestore(): Promise<ConfiguracoesBiblioteca | null> {
  const path = `${COLLECTIONS.CONFIGURACOES}/biblioteca`;
  try {
    const ref = doc(db, COLLECTIONS.CONFIGURACOES, 'biblioteca');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ConfiguracoesBiblioteca;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.warn('Erro ao buscar configurações no Firestore:', error);
    return null;
  }
}

export async function saveConfiguracoesFirestore(config: ConfiguracoesBiblioteca): Promise<boolean> {
  const path = `${COLLECTIONS.CONFIGURACOES}/biblioteca`;
  try {
    const ref = doc(db, COLLECTIONS.CONFIGURACOES, 'biblioteca');
    const sanitized = sanitizeFirestoreData(config);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn('Erro ao salvar configurações no Firestore:', error);
    return false;
  }
}

// ==========================================
// AUDITORIA
// ==========================================

export async function fetchAuditoriaFirestore(): Promise<AuditoriaRegistro[]> {
  const path = COLLECTIONS.AUDITORIA;
  try {
    const q = query(collection(db, path), orderBy('criado_em', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditoriaRegistro));
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditoriaRegistro));
    } catch {
      return [];
    }
  }
}

export async function logAuditoriaFirestore(registro: AuditoriaRegistro): Promise<boolean> {
  const path = `${COLLECTIONS.AUDITORIA}/${registro.id}`;
  try {
    const ref = doc(db, COLLECTIONS.AUDITORIA, registro.id);
    const sanitized = sanitizeFirestoreData(registro);
    await setDoc(ref, sanitized);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('permission-denied')) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    console.warn('Erro ao registrar auditoria no Firestore:', error);
    return false;
  }
}
