import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro ao autenticar com o Google:', error);
    throw error;
  }
}

export async function logoutFirebase() {
  await signOut(auth);
}

// Validate connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Ligação ao Firestore estabelecida com sucesso.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Por favor verifique a configuração do Firebase.');
    }
  }
}
testConnection();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function syncToFirestore(data: {
  residents: any[];
  scheduledActivities: any[];
  progressLogs: any[];
  reminders: any[];
  suggestionRules?: any;
  activities?: any[];
  settings?: any;
}) {
  try {
    const payload = {
      residents: data.residents || [],
      scheduledActivities: data.scheduledActivities || [],
      progressLogs: data.progressLogs || [],
      reminders: data.reminders || [],
      suggestionRules: data.suggestionRules || null,
      activities: data.activities || [],
      settings: data.settings || {},
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'appData', 'global'), payload);
    return { success: true, timestamp: payload.updatedAt };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'appData/global');
  }
}

export async function restoreFromFirestore() {
  try {
    const docSnap = await getDoc(doc(db, 'appData', 'global'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'appData/global');
  }
}

export function subscribeToFirestore(onData: (data: any) => void, onError?: (err: any) => void) {
  return onSnapshot(
    doc(db, 'appData', 'global'),
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data());
      }
    },
    (err) => {
      console.error('[Firebase Firestore] Erro de subscrição:', err);
      if (onError) onError(err);
    }
  );
}

