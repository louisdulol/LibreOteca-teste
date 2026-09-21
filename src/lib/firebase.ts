import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// Configuração robusta com fallback embutido do projeto
const DEFAULT_CONFIG = {
  projectId: 'festive-gradient-jds98',
  appId: '1:613098411403:web:1a1a8ed66d18987ebf0b8e',
  apiKey: 'AIzaSyCWvQEpn2t4yD_7nWmxHHj-8JeEaAxJ9gM',
  authDomain: 'festive-gradient-jds98.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-libreoteca-22cbb211-1521-4e5f-a85d-45664861e9e6',
  storageBucket: 'festive-gradient-jds98.firebasestorage.app',
  messagingSenderId: '613098411403',
};

let loadedConfig = DEFAULT_CONFIG;
try {
  // @ts-ignore
  import('../../firebase-applet-config.json').then(mod => {
    if (mod && mod.default) {
      loadedConfig = { ...DEFAULT_CONFIG, ...mod.default };
    }
  }).catch(() => {});
} catch {
  // Mantém fallback seguro
}

export const firebaseConfig = {
  apiKey: loadedConfig.apiKey,
  authDomain: loadedConfig.authDomain,
  projectId: loadedConfig.projectId,
  storageBucket: loadedConfig.storageBucket,
  messagingSenderId: loadedConfig.messagingSenderId,
  appId: loadedConfig.appId,
};

// Inicialização segura do Firebase
let app: FirebaseApp;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (e) {
  console.warn('Erro ao inicializar Firebase App, reinicializando...', e);
  app = initializeApp(firebaseConfig, 'libreoteca_primary');
}

export const auth: Auth = getAuth(app);

// Inicializa o Firestore com o databaseId provisionado ou default
let firestoreDb: Firestore;
try {
  if (loadedConfig.firestoreDatabaseId) {
    firestoreDb = getFirestore(app, loadedConfig.firestoreDatabaseId);
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
    return true;
  }
}
