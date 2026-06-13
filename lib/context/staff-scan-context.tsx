import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { registerUnauthorizedHandler } from "@/lib/api/auth-events";
import { DEFAULT_BRANCH_ID, DEFAULT_TENANT_ID } from "@/lib/api/env";
import { staffLoginRequest } from "@/lib/api/staff-repository";
import {
  clearAuthToken,
  clearStaffScanState,
  loadStaffScanState,
  persistAuthToken,
  persistSelectedStore,
} from "@/lib/auth/staff-auth-storage";
import { useTenant } from "@/lib/context/tenant-context";
import type { StoreOption } from "@/lib/types/staff";

export interface EmailPasswordSignInParams {
  email: string;
  password: string;
  tenantSlug: string;
}

interface StaffScanContextValue {
  isHydrated: boolean;
  selectedStore: StoreOption | null;
  staffToken: string | null;
  selectStore: (store: StoreOption) => Promise<void>;
  /** Email + password → POST /api/auth/mobile-login */
  signInWithPassword: (params: EmailPasswordSignInParams) => Promise<void>;
  signOut: () => Promise<void>;
  resetStaffFlow: () => Promise<void>;
}

const StaffScanContext = createContext<StaffScanContextValue | null>(null);

function resolveTenantIds(store: StoreOption | null): {
  tenantId: string;
  branchId: string;
} {
  if (!store) {
    return { tenantId: DEFAULT_TENANT_ID, branchId: DEFAULT_BRANCH_ID };
  }
  return {
    tenantId: store.tenantId || DEFAULT_TENANT_ID || store.tenantSlug,
    branchId: store.branchId || DEFAULT_BRANCH_ID || store.tenantSlug,
  };
}

function applyStoreToTenant(
  store: StoreOption | null,
  syncTenant: (tenantId: string, branchId: string) => void,
  resetTenant: () => void,
) {
  if (store) {
    const { tenantId, branchId } = resolveTenantIds(store);
    syncTenant(tenantId, branchId);
  } else {
    resetTenant();
  }
}

export function StaffScanProvider({ children }: { children: ReactNode }) {
  const { syncTenant, resetTenant } = useTenant();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [staffToken, setStaffToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { selectedStore: store, token } = await loadStaffScanState();
      if (cancelled) return;
      setSelectedStore(store);
      applyStoreToTenant(store, syncTenant, resetTenant);
      setStaffToken(token);
      setIsHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [syncTenant, resetTenant]);

  const resetStaffFlow = useCallback(async () => {
    await clearStaffScanState();
    setSelectedStore(null);
    setStaffToken(null);
    resetTenant();
  }, [resetTenant]);

  const signOut = useCallback(async () => {
    await clearAuthToken();
    setStaffToken(null);
  }, []);

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      void signOut();
    });
  }, [signOut]);

  const selectStore = useCallback(
    async (store: StoreOption) => {
      const storeChanged =
        selectedStore != null &&
        (selectedStore.id !== store.id ||
          selectedStore.tenantSlug !== store.tenantSlug);
      await persistSelectedStore(store);
      setSelectedStore(store);
      applyStoreToTenant(store, syncTenant, resetTenant);
      if (storeChanged) {
        await clearAuthToken();
        setStaffToken(null);
      }
    },
    [selectedStore, syncTenant, resetTenant],
  );

  const signInWithPassword = useCallback(
    async ({ email, password, tenantSlug }: EmailPasswordSignInParams) => {
      const { token, tenantId } = await staffLoginRequest(
        tenantSlug,
        email,
        password,
        selectedStore,
      );
      const nextStore: StoreOption = selectedStore
        ? { ...selectedStore, tenantId, tenantSlug: tenantSlug.trim() }
        : {
            id: tenantSlug.trim(),
            name: tenantSlug.trim(),
            storeName: tenantSlug.trim(),
            tenantSlug: tenantSlug.trim(),
            tenantId,
            branchId: tenantId,
          };

      await persistSelectedStore(nextStore);
      setSelectedStore(nextStore);
      await persistAuthToken(token);
      setStaffToken(token);
      syncTenant(tenantId, nextStore.branchId || tenantId);
    },
    [selectedStore, syncTenant],
  );

  const value = useMemo(
    () => ({
      isHydrated,
      selectedStore,
      staffToken,
      selectStore,
      signInWithPassword,
      signOut,
      resetStaffFlow,
    }),
    [
      isHydrated,
      selectedStore,
      staffToken,
      selectStore,
      signInWithPassword,
      signOut,
      resetStaffFlow,
    ],
  );

  return (
    <StaffScanContext.Provider value={value}>
      {children}
    </StaffScanContext.Provider>
  );
}

export function useStaffScan() {
  const ctx = useContext(StaffScanContext);
  if (!ctx) {
    throw new Error("useStaffScan must be used within StaffScanProvider");
  }
  return ctx;
}
