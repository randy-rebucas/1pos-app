function normalizeBaseUrl(url: string | undefined): string {
  if (!url?.trim()) return "";
  return url.trim().replace(/\/+$/, "");
}

export const API_CONFIG = {
  baseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL),
} as const;

export const API_PATH_PREFIX = (
  process.env.EXPO_PUBLIC_API_PATH_PREFIX ?? "/api/v1"
)
  .trim()
  .replace(/\/+$/, "");

/** True when `EXPO_PUBLIC_API_URL` is set — all data loads use HTTP only. */
export function isApiConfigured(): boolean {
  return Boolean(API_CONFIG.baseUrl?.trim());
}
