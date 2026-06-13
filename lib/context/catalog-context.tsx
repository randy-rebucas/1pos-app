import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CatalogAddon, CatalogService } from "@/lib/types/laundry";
import { fetchServicesCatalog } from "@/lib/api/laundry-repository";
import { useTenant } from "@/lib/context/tenant-context";
import { useSession } from "@/lib/context/session-context";
import { ApiError, buildTenantHeaders } from "@/lib/api/client";

interface CatalogContextValue {
  services: CatalogService[];
  addons: CatalogAddon[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { tenantId, branchId } = useTenant();
  const { token } = useSession();
  const [services, setServices] = useState<CatalogService[]>([]);
  const [addons, setAddons] = useState<CatalogAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = buildTenantHeaders(tenantId, branchId, token);
      const { services: s, addons: a } = await fetchServicesCatalog(
        headers,
        branchId,
      );
      setServices(s);
      setAddons(a);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : String(e);
      setError(msg);
      setServices([]);
      setAddons([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, branchId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ services, addons, loading, error, clearError, refresh }),
    [services, addons, loading, error, clearError, refresh],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
