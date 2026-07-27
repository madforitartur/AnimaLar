import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface AppStateData {
  residents: any[];
  scheduledActivities: any[];
  progressLogs: any[];
  reminders: any[];
  suggestionRules?: any;
}

/**
 * Saves current application data to Firestore under 'appData/mainState'
 */
export async function syncAppDataToFirestore(data: AppStateData): Promise<boolean> {
  try {
    const docRef = doc(db, 'appData', 'mainState');
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('[Firestore] Dados sincronizados com sucesso.');
    return true;
  } catch (err) {
    console.error('[Firestore] Erro ao sincronizar dados:', err);
    return false;
  }
}

/**
 * Loads application data from Firestore 'appData/mainState'
 */
export async function loadAppDataFromFirestore(): Promise<AppStateData | null> {
  try {
    const docRef = doc(db, 'appData', 'mainState');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('[Firestore] Dados carregados do Firestore com sucesso.');
      return docSnap.data() as AppStateData;
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Erro ao carregar dados:', err);
    return null;
  }
}

/**
 * Subscribes to real-time updates from Firestore 'appData/mainState'
 */
export function subscribeToFirestoreData(onData: (data: AppStateData) => void) {
  const docRef = doc(db, 'appData', 'mainState');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as AppStateData);
    }
  }, (error) => {
    console.warn('[Firestore] Erro na subscrição em tempo real:', error);
  });
}
