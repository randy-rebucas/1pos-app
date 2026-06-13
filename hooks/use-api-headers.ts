import { useMemo } from "react";
import { buildTenantHeaders } from "@/lib/api/client";
import { useTenant } from "@/lib/context/tenant-context";
import { useSession } from "@/lib/context/session-context";

export function useApiHeaders() {
  const { tenantId, branchId } = useTenant();
  const { token } = useSession();
  return useMemo(
    () => buildTenantHeaders(tenantId, branchId, token),
    [tenantId, branchId, token],
  );
}
