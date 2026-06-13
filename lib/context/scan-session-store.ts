import AsyncStorage from "@react-native-async-storage/async-storage";

export type ScanMode = "barcode" | "qr";
export type SessionFilter = "all" | "missing-barcode" | "missing-image";

export interface ScanSessionStats {
  done: number;
  skipped: number;
  errors: number;
}

export interface PersistedScanSession {
  sessionId: string;
  scanMode: ScanMode;
  filter: SessionFilter;
  productIds: string[];
  currentIndex: number;
  total: number;
  stats: ScanSessionStats;
  startedAt: string;
}

const KEY = "1pos.scan_session";

export async function loadSession(): Promise<PersistedScanSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedScanSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: PersistedScanSession): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function makeSessionId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
