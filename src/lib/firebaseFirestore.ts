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
import { db } from './firebase';
import {
  Livro,
  Leitor,
  Emprestimo,
  ComentarioLivro,
  ConfiguracoesBiblioteca,
  AuditoriaRegistro,
  ContaUsuario,
} from '../types';

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
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LIVROS));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Livro));
  } catch (error) {
    console.error('Erro ao buscar livros no Firestore:', error);
    return [];
  }
}

export async function saveLivroFirestore(livro: Livro): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.LIVROS, livro.id);
    const sanitized = sanitizeFirestoreData(livro);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar livro no Firestore:', error);
    return false;
  }
}

export async function deleteLivroFirestore(id: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.LIVROS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Erro ao deletar livro no Firestore:', error);
    return false;
  }
}

export function subscribeLivros(callback: (livros: Livro[]) => void) {
  const colRef = collection(db, COLLECTIONS.LIVROS);
  return onSnapshot(
    colRef,
    snapshot => {
      const livros = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Livro));
      callback(livros);
    },
    err => {
      console.warn('Erro na subscrição de livros:', err);
    }
  );
}

// ==========================================
// LEITORES
// ==========================================

export async function fetchLeitoresFirestore(): Promise<Leitor[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LEITORES));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Leitor));
  } catch (error) {
    console.error('Erro ao buscar leitores no Firestore:', error);
    return [];
  }
}

export async function saveLeitorFirestore(leitor: Leitor): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.LEITORES, leitor.id);
    const sanitized = sanitizeFirestoreData(leitor);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar leitor no Firestore:', error);
    return false;
  }
}

export async function deleteLeitorFirestore(id: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.LEITORES, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Erro ao deletar leitor no Firestore:', error);
    return false;
  }
}

export function subscribeLeitores(callback: (leitores: Leitor[]) => void) {
  const colRef = collection(db, COLLECTIONS.LEITORES);
  return onSnapshot(
    colRef,
    snapshot => {
      const leitores = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Leitor));
      callback(leitores);
    },
    err => {
      console.warn('Erro na subscrição de leitores:', err);
    }
  );
}

// ==========================================
// EMPRESTIMOS
// ==========================================

export async function fetchEmprestimosFirestore(): Promise<Emprestimo[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.EMPRESTIMOS));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Emprestimo));
  } catch (error) {
    console.error('Erro ao buscar empréstimos no Firestore:', error);
    return [];
  }
}

export async function saveEmprestimoFirestore(emprestimo: Emprestimo): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.EMPRESTIMOS, emprestimo.id);
    const sanitized = sanitizeFirestoreData(emprestimo);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar empréstimo no Firestore:', error);
    return false;
  }
}

export async function deleteEmprestimoFirestore(id: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.EMPRESTIMOS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Erro ao deletar empréstimo no Firestore:', error);
    return false;
  }
}

export function subscribeEmprestimos(callback: (emprestimos: Emprestimo[]) => void) {
  const colRef = collection(db, COLLECTIONS.EMPRESTIMOS);
  return onSnapshot(
    colRef,
    snapshot => {
      const emprestimos = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Emprestimo));
      callback(emprestimos);
    },
    err => {
      console.warn('Erro na subscrição de empréstimos:', err);
    }
  );
}

// ==========================================
// COMENTARIOS & AVALIAÇÕES
// ==========================================

export async function fetchComentariosFirestore(): Promise<ComentarioLivro[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COMENTARIOS));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ComentarioLivro));
  } catch (error) {
    console.error('Erro ao buscar comentários no Firestore:', error);
    return [];
  }
}

export async function saveComentarioFirestore(comentario: ComentarioLivro): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.COMENTARIOS, comentario.id);
    const sanitized = sanitizeFirestoreData(comentario);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar comentário no Firestore:', error);
    return false;
  }
}

export async function deleteComentarioFirestore(id: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.COMENTARIOS, id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('Erro ao deletar comentário no Firestore:', error);
    return false;
  }
}

export function subscribeComentarios(callback: (comentarios: ComentarioLivro[]) => void) {
  const colRef = collection(db, COLLECTIONS.COMENTARIOS);
  return onSnapshot(
    colRef,
    snapshot => {
      const comentarios = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ComentarioLivro));
      callback(comentarios);
    },
    err => {
      console.warn('Erro na subscrição de comentários:', err);
    }
  );
}

// ==========================================
// CONFIGURAÇÕES
// ==========================================

export async function fetchConfiguracoesFirestore(): Promise<ConfiguracoesBiblioteca | null> {
  try {
    const ref = doc(db, COLLECTIONS.CONFIGURACOES, 'biblioteca');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as ConfiguracoesBiblioteca;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar configurações no Firestore:', error);
    return null;
  }
}

export async function saveConfiguracoesFirestore(config: ConfiguracoesBiblioteca): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.CONFIGURACOES, 'biblioteca');
    const sanitized = sanitizeFirestoreData(config);
    await setDoc(ref, sanitized, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações no Firestore:', error);
    return false;
  }
}

// ==========================================
// AUDITORIA
// ==========================================

export async function fetchAuditoriaFirestore(): Promise<AuditoriaRegistro[]> {
  try {
    const q = query(collection(db, COLLECTIONS.AUDITORIA), orderBy('criado_em', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditoriaRegistro));
  } catch (error) {
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.AUDITORIA));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditoriaRegistro));
    } catch {
      return [];
    }
  }
}

export async function logAuditoriaFirestore(registro: AuditoriaRegistro): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.AUDITORIA, registro.id);
    const sanitized = sanitizeFirestoreData(registro);
    await setDoc(ref, sanitized);
    return true;
  } catch (error) {
    console.warn('Erro ao registrar auditoria no Firestore:', error);
    return false;
  }
}
