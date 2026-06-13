import type { ReactNode } from "react";
import { TenantProvider } from "@/lib/context/tenant-context";
import { SessionProvider } from "@/lib/context/session-context";
import { CatalogProvider } from "@/lib/context/catalog-context";
import { OrdersProvider } from "@/lib/context/orders-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <SessionProvider>
        <CatalogProvider>
          <OrdersProvider>{children}</OrdersProvider>
        </CatalogProvider>
      </SessionProvider>
    </TenantProvider>
  );
}
