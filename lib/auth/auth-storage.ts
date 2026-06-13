import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "1pos.auth.access_token";
const SESSION_KEY = "1pos.auth.session";

export interface StoredSession {
  userId: string;
  displayName: string;
  role: "customer" | "rider" | "staff" | "admin";
}

function webStorage(): Storage | null {
  if (Platform.OS !== "web") return null;
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

async function write(key: string, value: string): Promise<void> {
  const ls = webStorage();
  if (ls) {
    ls.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

async function read(key: string): Promise<string | null> {
  const ls = webStorage();
  if (ls) {
    return ls.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function remove(key: string): Promise<void> {
  const ls = webStorage();
  if (ls) {
    ls.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function loadStoredCredentials(): Promise<{
  token: string | null;
  session: StoredSession | null;
}> {
  try {
    const [token, raw] = await Promise.all([read(TOKEN_KEY), read(SESSION_KEY)]);
    if (!token || !raw) {
      return { token: null, session: null };
    }
    const session = JSON.parse(raw) as StoredSession;
    if (!session?.userId || !session.displayName || !session.role) {
      return { token: null, session: null };
    }
    return { token, session };
  } catch {
    return { token: null, session: null };
  }
}

export async function persistCredentials(
  token: string,
  session: StoredSession,
): Promise<void> {
  await Promise.all([
    write(TOKEN_KEY, token),
    write(SESSION_KEY, JSON.stringify(session)),
  ]);
}

export async function clearStoredCredentials(): Promise<void> {
  await Promise.all([remove(TOKEN_KEY), remove(SESSION_KEY)]);
}
