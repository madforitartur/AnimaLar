import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const defaultConfig = {
  projectId: "rich-aloe-nv7sv",
  appId: "1:121940734372:web:5328cc76d23a6e7387d131",
  authDomain: "rich-aloe-nv7sv.firebaseapp.com",
  storageBucket: "rich-aloe-nv7sv.firebasestorage.app",
  messagingSenderId: "121940734372",
  firestoreDatabaseId: ""
};

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length === 0 ? initializeApp(defaultConfig) : getApp();
  auth = getAuth(app);
  db = defaultConfig.firestoreDatabaseId
    ? getFirestore(app, defaultConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('[Firebase] Inicialização pendente ou parcial:', e);
  app = getApps()[0];
}

export { app, auth, db };

