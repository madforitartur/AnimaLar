import { db } from '../firebase';

export interface AppStateData {
  residents: any[];
  scheduledActivities: any[];
  progressLogs: any[];
  reminders: any[];
  suggestionRules?: any;
}

export async function syncAppDataToFirestore(_data: AppStateData): Promise<boolean> {
  return false;
}

export async function loadAppDataFromFirestore(): Promise<AppStateData | null> {
  return null;
}

export function subscribeToFirestoreData(_onData: (data: AppStateData) => void) {
  return () => {};
}
