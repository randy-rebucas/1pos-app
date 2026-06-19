function normalizeBaseUrl(url: string | undefined): string {
  if (!url?.trim()) return "";
  return url.trim().replace(/\/+$/, "");
}

export const DEFAULT_TENANT_ID =
  process.env.EXPO_PUBLIC_TENANT_ID?.trim() || "";

export const DEFAULT_BRANCH_ID =
  process.env.EXPO_PUBLIC_BRANCH_ID?.trim() || "";

export const API_CONFIG = {
  baseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL),
} as const;

/** Optional shared secret if the backend gates API routes. */
export const MOBILE_API_KEY =
  process.env.EXPO_PUBLIC_MOBILE_API_KEY?.trim() || "";

/** True when `EXPO_PUBLIC_API_URL` is set — all data loads use HTTP only. */
export function isApiConfigured(): boolean {
  return Boolean(API_CONFIG.baseUrl?.trim());
}
