import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface TenantContextValue {
  tenantId: string;
  branchId: string;
  setTenantId: (id: string) => void;
  setBranchId: (id: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState("tenant_demo");
  const [branchId, setBranchId] = useState("branch_qc");

  const value = useMemo(
    () => ({
      tenantId,
      branchId,
      setTenantId,
      setBranchId,
    }),
    [tenantId, branchId],
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

export function useTenantHeaders() {
  const { tenantId, branchId } = useTenant();
  return useCallback(
    () => ({
      "X-Tenant-Id": tenantId,
      "X-Branch-Id": branchId,
    }),
    [tenantId, branchId],
  );
}
