import { API_CONFIG, API_PATH_PREFIX, isApiConfigured } from "@/lib/api/env";

export { API_CONFIG } from "@/lib/api/env";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const prefix = API_PATH_PREFIX.startsWith("/")
    ? API_PATH_PREFIX
    : `/${API_PATH_PREFIX}`;
  return `${API_CONFIG.baseUrl}${prefix}${p}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestHeaders = Record<string, string>;

export function buildTenantHeaders(
  tenantId: string,
  branchId: string,
  token?: string | null,
): ApiRequestHeaders {
  const h: ApiRequestHeaders = {
    "X-Tenant-Id": tenantId,
    "X-Branch-Id": branchId,
    Accept: "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError("Invalid JSON in response", 502);
    }
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      text.slice(0, 120) || "Non-JSON response (expected API JSON)",
      502,
    );
  }
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit & { headers?: ApiRequestHeaders },
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(
      "Set EXPO_PUBLIC_API_URL in .env to your JSON API base (e.g. https://api.example.com).",
      503,
    );
  }
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    const msg =
      typeof body === "object" && body && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : typeof body === "string"
          ? body
          : res.statusText;
    throw new ApiError(msg || res.statusText, res.status);
  }
  return body as T;
}
