import { fetchJson, type ApiRequestHeaders } from "@/lib/api/client";
import { makeSessionId } from "@/lib/context/scan-session-store";

export interface ScanSessionData {
  sessionId: string;
  total: number;
  productIds: string[];
  filter?: string;
}

export interface ProductData {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  image?: string;
  description?: string;
}

export interface ScanUpdatePayload {
  barcode?: string;
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  image?: string;
  notes?: string;
  sessionId: string;
}

export interface ScanUpdateResult {
  product: ProductData;
  skuGenerated: boolean;
}

export type SessionFilter = "all" | "missing-barcode" | "missing-image";

export async function fetchScanSession(
  headers: ApiRequestHeaders,
  filter: SessionFilter = "missing-barcode",
): Promise<ScanSessionData> {
  const res = await fetchJson<{ success: boolean; data: ScanSessionData }>(
    `/products/scan-session?filter=${filter}`,
    { headers },
  );
  const data = res.data;
  // Backend returns product list only; client owns sessionId for audit logging.
  const sessionId = data.sessionId?.trim() || makeSessionId();
  return {
    sessionId,
    total: data.total ?? data.productIds?.length ?? 0,
    productIds: data.productIds ?? [],
    filter: data.filter ?? filter,
  };
}

export async function fetchProductsList(
  headers: ApiRequestHeaders,
  filter: SessionFilter,
): Promise<ProductData[]> {
  const all: ProductData[] = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await fetchJson<{
      success: boolean;
      data: ProductData[];
      pagination?: { pages?: number };
    }>(`/products?filter=${filter}&page=${page}&limit=100`, { headers });
    all.push(...(res.data ?? []));
    pages = res.pagination?.pages ?? 1;
    page += 1;
  } while (page <= pages);
  return all;
}

export async function lookupByBarcode(
  headers: ApiRequestHeaders,
  code: string,
): Promise<ProductData | null> {
  try {
    const res = await fetchJson<{
      success: boolean;
      data: { product: ProductData } | null;
    }>(`/products/by-barcode?code=${encodeURIComponent(code)}`, { headers });
    return res.data?.product ?? null;
  } catch (e) {
    const err = e as { status?: number };
    if (err.status === 404) return null;
    return null;
  }
}

export async function scanUpdateProduct(
  headers: ApiRequestHeaders,
  id: string,
  payload: ScanUpdatePayload,
): Promise<ScanUpdateResult> {
  const { image, ...rest } = payload;
  const res = await fetchJson<{ success: boolean; data: ScanUpdateResult }>(
    `/products/${id}/scan-update`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...rest,
        ...(image !== undefined ? { imageUrl: image } : {}),
      }),
      headers,
    },
  );
  return res.data;
}

export async function logScanSession(
  headers: ApiRequestHeaders,
  sessionId: string,
  stats: { done: number; skipped: number; errors: number },
): Promise<void> {
  await fetchJson<{ success: boolean }>(`/products/scan-session/log`, {
    method: "POST",
    body: JSON.stringify({ sessionId, stats }),
    headers,
  });
}

export async function fetchCategories(
  headers: ApiRequestHeaders,
): Promise<{ _id: string; name: string }[]> {
  const res = await fetchJson<{
    success: boolean;
    data: { _id: string; name: string }[];
  }>("/categories", { headers });
  return res.data ?? [];
}

export function indexProductsById(
  products: ProductData[],
): Map<string, ProductData> {
  return new Map(products.map((p) => [p._id, p]));
}
