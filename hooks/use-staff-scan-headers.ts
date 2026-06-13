import { useMemo } from "react";
import { buildAuthHeaders } from "@/lib/api/client";
import { useStaffScan } from "@/lib/context/staff-scan-context";

/** Bearer auth headers for mobile API calls. */
export function useStaffScanHeaders() {
  const { staffToken } = useStaffScan();
  return useMemo(() => buildAuthHeaders(staffToken), [staffToken]);
}
