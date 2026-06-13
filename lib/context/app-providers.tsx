import type { ReactNode } from "react";
import { TenantProvider } from "@/lib/context/tenant-context";
import { StaffScanProvider } from "@/lib/context/staff-scan-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <StaffScanProvider>{children}</StaffScanProvider>
    </TenantProvider>
  );
}
