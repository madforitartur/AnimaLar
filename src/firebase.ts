import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseConfig: any = null;

try {
  // @ts-ignore
  const importedConfig = import.meta.glob('../firebase-applet-config.json', { eager: true });
  const key = Object.keys(importedConfig)[0];
  if (key && (importedConfig[key] as any).default) {
    firebaseConfig = (importedConfig[key] as any).default;
  }
} catch (e) {
  console.warn('firebase-applet-config.json não encontrado.');
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const hasValidApiKey = Boolean(
  firebaseConfig &&
  typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.trim().length > 0
);

if (hasValidApiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (err) {
    console.warn('Erro ao inicializar Firebase App:', err);
  }

  if (app) {
    try {
      auth = getAuth(app);
    } catch (err) {
      console.warn('[Firebase Auth] Chave de API inválida ou indisponível. Autenticação desativada:', err);
    }

    try {
      db = firebaseConfig.firestoreDatabaseId
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    } catch (err) {
      console.warn('[Firestore] Erro ao inicializar a base de dados:', err);
    }
  }
} else {
  console.warn('[Firebase] Nenhuma API Key válida do Firebase encontrada. O serviço funcionará em modo fallback/inativo.');
}

export { app, auth, db };

