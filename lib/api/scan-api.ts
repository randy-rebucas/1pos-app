import { fetchJson } from "@/lib/api/client";
import type { ApiRequestHeaders } from "@/lib/api/client";

export interface ScanSessionData {
  total: number;
  productIds: string[];
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
  imageUrl?: string;
  notes?: string;
  sessionId?: string;
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
  return res.data;
}

export async function fetchProduct(
  headers: ApiRequestHeaders,
  id: string,
): Promise<ProductData> {
  const res = await fetchJson<{ success: boolean; data: ProductData }>(
    `/products/${id}`,
    { headers },
  );
  return res.data as unknown as ProductData;
}

export async function lookupByBarcode(
  headers: ApiRequestHeaders,
  code: string,
): Promise<ProductData | null> {
  try {
    const res = await fetchJson<{ success: boolean; data: { product: ProductData } }>(
      `/products/by-barcode?code=${encodeURIComponent(code)}`,
      { headers },
    );
    return res.data.product;
  } catch {
    return null;
  }
}

export async function scanUpdateProduct(
  headers: ApiRequestHeaders,
  id: string,
  payload: ScanUpdatePayload,
): Promise<ScanUpdateResult> {
  const res = await fetchJson<{ success: boolean; data: ScanUpdateResult }>(
    `/products/${id}/scan-update`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
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
  await fetchJson<{ success: boolean }>(
    `/products/scan-session/log`,
    {
      method: "POST",
      body: JSON.stringify({ sessionId, stats }),
      headers,
    },
  );
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
