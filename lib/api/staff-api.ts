import { fetchJson } from "@/lib/api/client";

export interface StaffLoginBody {
  email: string;
  password: string;
  tenantSlug: string;
}

/** GET /stores/retail — pre-login store picker */
export async function apiListRetailStores(q?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const p = new URLSearchParams();
  if (q?.search?.trim()) p.set("search", q.search.trim());
  if (q?.page != null) p.set("page", String(q.page));
  if (q?.limit != null) p.set("limit", String(q.limit));
  const qs = p.toString();
  return fetchJson<unknown>(`/stores/retail${qs ? `?${qs}` : ""}`, {
    method: "GET",
    public: true,
  });
}

/** POST /auth/mobile-login — email + password; JWT returned in body (React Native). */
export async function apiStaffLogin(
  body: StaffLoginBody,
  tenantId?: string,
) {
  const headers: Record<string, string> = {};
  if (tenantId?.trim()) headers["X-Tenant-Id"] = tenantId.trim();
  return fetchJson<unknown>("/auth/mobile-login", {
    method: "POST",
    public: true,
    body: JSON.stringify(body),
    headers,
  });
}
