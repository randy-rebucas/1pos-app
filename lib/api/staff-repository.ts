import { ApiError, type ApiRequestHeaders, buildAuthHeaders } from "@/lib/api/client";
import { extractArray, firstObject } from "@/lib/api/json-utils";
import * as api from "@/lib/api/staff-api";
import type { RetailStoresPage, StoreOption } from "@/lib/types/staff";

const TOKEN_KEYS = [
  "token",
  "access_token",
  "accessToken",
  "jwt",
  "bearerToken",
] as const;

function readStringField(
  obj: Record<string, unknown> | null,
  key: string,
): string {
  if (!obj) return "";
  const v = obj[key];
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function extractAuthToken(payload: unknown): string {
  const root = firstObject(payload);
  if (!root) {
    throw new ApiError("Invalid login response", 502);
  }

  if (root.success === false) {
    throw new ApiError(
      readStringField(root, "error") ||
        readStringField(root, "message") ||
        "Login failed",
      401,
    );
  }

  const candidates: Record<string, unknown>[] = [
    root,
    firstObject(root.data) ?? {},
    firstObject(root.result) ?? {},
    firstObject(firstObject(root.data)?.auth) ?? {},
  ];

  for (const layer of candidates) {
    for (const key of TOKEN_KEYS) {
      const token = readStringField(layer, key);
      if (token) return token;
    }
  }

  throw new ApiError("Login response missing token", 502);
}

/** Manual store selection when GET /stores/retail is unavailable. */
export function storeFromSlug(slug: string): StoreOption | null {
  const tenantSlug = slug.trim().toLowerCase();
  if (!tenantSlug) return null;
  return {
    id: tenantSlug,
    name: tenantSlug,
    storeName: tenantSlug,
    tenantSlug,
    tenantId: "",
    branchId: "",
  };
}

function mapBranchOption(
  storeRow: Record<string, unknown>,
  branch: Record<string, unknown>,
): StoreOption | null {
  const tenantSlug = String(storeRow.slug ?? storeRow.tenantSlug ?? "");
  const storeName = String(storeRow.name ?? "Store");
  const branchId = String(
    branch.branchId ?? branch.branch_id ?? branch.id ?? branch._id ?? "",
  );
  const tenantId = String(
    branch.tenantId ?? branch.tenant_id ?? storeRow.id ?? storeRow._id ?? "",
  );
  const name = String(branch.name ?? storeName);
  if (!tenantSlug || !branchId || !tenantId) return null;
  const address = branch.address ?? storeRow.address;
  return {
    id: `${tenantSlug}:${branchId}`,
    name,
    storeName,
    tenantSlug,
    tenantId,
    branchId,
    address: address != null ? String(address) : undefined,
  };
}

function flattenRetailStores(payload: unknown): StoreOption[] {
  const root = firstObject(payload);
  const data = firstObject(root?.data) ?? root;
  const retailStores = extractArray(data, ["stores"]);
  const options: StoreOption[] = [];

  for (const row of retailStores) {
    if (!row || typeof row !== "object") continue;
    const store = row as Record<string, unknown>;
    const branches = extractArray(store.branches, []);
    if (branches.length === 0) {
      const slug = String(store.slug ?? "");
      if (!slug) continue;
      options.push({
        id: slug,
        name: String(store.name ?? "Store"),
        storeName: String(store.name ?? "Store"),
        tenantSlug: slug,
        tenantId: String(store.id ?? store._id ?? slug),
        branchId: String(store.id ?? store._id ?? slug),
        address:
          store.address != null ? String(store.address) : undefined,
      });
      continue;
    }
    for (const branch of branches) {
      if (!branch || typeof branch !== "object") continue;
      const mapped = mapBranchOption(store, branch as Record<string, unknown>);
      if (mapped) options.push(mapped);
    }
  }
  return options;
}

function readPagination(data: Record<string, unknown> | null) {
  return {
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? 1),
    limit: Number(data?.limit ?? 50),
    totalPages: Number(data?.totalPages ?? 1),
  };
}

export async function fetchRetailStores(q?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RetailStoresPage> {
  const raw = await api.apiListRetailStores(q);
  const root = firstObject(raw);
  const data = firstObject(root?.data) ?? root;
  const stores = flattenRetailStores(raw);
  const pagination = readPagination(data);
  return { stores, ...pagination };
}

export async function staffLoginRequest(
  tenantSlug: string,
  email: string,
  password: string,
  store?: StoreOption | null,
): Promise<{ token: string; tenantId: string }> {
  const raw = await api.apiStaffLogin(
    {
      email: email.trim(),
      password,
      tenantSlug: tenantSlug.trim(),
    },
    store?.tenantId,
  );
  const token = extractAuthToken(raw);

  const root = firstObject(raw) ?? {};
  const data = firstObject(root.data) ?? root;
  const tenant = firstObject(data.tenant) ?? firstObject(root.tenant) ?? {};
  const tenantId =
    readStringField(tenant, "id") ||
    readStringField(tenant, "_id") ||
    store?.tenantId ||
    tenantSlug.trim();

  return { token, tenantId };
}

export function staffHeaders(token: string | null): ApiRequestHeaders {
  return buildAuthHeaders(token);
}
