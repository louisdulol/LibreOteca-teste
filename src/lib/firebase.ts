import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// Configuração oficial do projeto Firebase
export const firebaseConfig = {
  projectId: 'festive-gradient-jds98',
  appId: '1:613098411403:web:1a1a8ed66d18987ebf0b8e',
  apiKey: 'AIzaSyCWvQEpn2t4yD_7nWmxHHj-8JeEaAxJ9gM',
  authDomain: 'festive-gradient-jds98.firebaseapp.com',
  storageBucket: 'festive-gradient-jds98.firebasestorage.app',
  messagingSenderId: '613098411403',
};

const FIRESTORE_DATABASE_ID = 'ai-studio-libreoteca-22cbb211-1521-4e5f-a85d-45664861e9e6';

// Inicialização segura do Firebase App
let app: FirebaseApp;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (e) {
  console.warn('Inicializando instância secundária do Firebase:', e);
  app = initializeApp(firebaseConfig, 'libreoteca_primary');
}

export const auth: Auth = getAuth(app);

// Inicializa o Firestore com o databaseId provisionado ou default
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app, FIRESTORE_DATABASE_ID);
} catch (e) {
  console.warn('Fallback para Firestore padrão:', e);
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;

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
