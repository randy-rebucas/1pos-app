export interface StoreOption {
  /** Unique key for list rendering (branch-scoped). */
  id: string;
  /** Branch display name. */
  name: string;
  /** Parent retail store name. */
  storeName: string;
  /** Tenant slug for this store. */
  tenantSlug: string;
  tenantId: string;
  branchId: string;
  address?: string;
}

export interface RetailStoresPage {
  stores: StoreOption[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
