import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { StoreOption } from "@/lib/types/staff";

const SELECTED_STORE_KEY = "1pos.staff.selected_store";
const AUTH_TOKEN_KEY = "1pos.staff.token";

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

function isValidStore(store: StoreOption | null): store is StoreOption {
  return Boolean(store?.id && store.name && store.tenantSlug);
}

export async function loadStaffScanState(): Promise<{
  selectedStore: StoreOption | null;
  token: string | null;
}> {
  try {
    const [storeRaw, token] = await Promise.all([
      read(SELECTED_STORE_KEY),
      read(AUTH_TOKEN_KEY),
    ]);
    const selectedStore = storeRaw
      ? (JSON.parse(storeRaw) as StoreOption)
      : null;
    return {
      selectedStore: isValidStore(selectedStore) ? selectedStore : null,
      token: token || null,
    };
  } catch {
    return { selectedStore: null, token: null };
  }
}

export async function persistAuthToken(token: string): Promise<void> {
  await write(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await remove(AUTH_TOKEN_KEY);
}

export async function persistSelectedStore(
  store: StoreOption,
): Promise<void> {
  await write(SELECTED_STORE_KEY, JSON.stringify(store));
}

export async function clearSelectedStore(): Promise<void> {
  await remove(SELECTED_STORE_KEY);
}

export async function clearStaffScanState(): Promise<void> {
  await Promise.all([clearSelectedStore(), clearAuthToken()]);
}
