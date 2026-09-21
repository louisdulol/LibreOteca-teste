import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Configuração extraída do projeto provisionado
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Inicialização única do Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Inicializa o Firestore com o databaseId provisionado ou default
let firestoreDb: Firestore;
try {
  if (firebaseConfigJson.firestoreDatabaseId) {
    firestoreDb = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (e) {
  console.warn('Fallback para Firestore padrão:', e);
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;

// Código mestre padrão para criação de conta de professor/administrador
export const CODIGO_MESTRE_PROFESSOR_PADRAO = 'PROF-LIBRE-2026';

/**
 * Validação de conexão inicial com o servidor Firestore
 */
export async function testarConexaoFirestore(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline ou inicializando.');
      return false;
    }
    // Erros de permissão em _connection_test são esperados e significam que o servidor respondeu!
    return true;
  }
}
