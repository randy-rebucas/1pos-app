import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_BRANCH_ID,
  DEFAULT_TENANT_ID,
} from "@/lib/api/env";

interface TenantContextValue {
  tenantId: string;
  branchId: string;
  setTenantId: (id: string) => void;
  setBranchId: (id: string) => void;
  syncTenant: (tenantId: string, branchId: string) => void;
  resetTenant: () => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const [branchId, setBranchId] = useState(DEFAULT_BRANCH_ID);

  const syncTenant = useCallback((nextTenantId: string, nextBranchId: string) => {
    setTenantId(nextTenantId);
    setBranchId(nextBranchId);
  }, []);

  const resetTenant = useCallback(() => {
    setTenantId(DEFAULT_TENANT_ID);
    setBranchId(DEFAULT_BRANCH_ID);
  }, []);

  const value = useMemo(
    () => ({
      tenantId,
      branchId,
      setTenantId,
      setBranchId,
      syncTenant,
      resetTenant,
    }),
    [tenantId, branchId, syncTenant, resetTenant],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
