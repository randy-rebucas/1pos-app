import { API_CONFIG, MOBILE_API_KEY, isApiConfigured } from "@/lib/api/env";
import { notifyUnauthorized } from "@/lib/api/auth-events";

export { API_CONFIG } from "@/lib/api/env";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_CONFIG.baseUrl}/api${p}`;
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

/** Default headers for every mobile API request. */
export function buildDefaultHeaders(): ApiRequestHeaders {
  const h: ApiRequestHeaders = {
    Accept: "application/json",
    // Backend CSRF check accepts this for non-browser clients (e.g. multipart upload).
    "X-Requested-With": "XMLHttpRequest",
  };
  if (API_CONFIG.baseUrl.includes("ngrok")) {
    h["ngrok-skip-browser-warning"] = "true";
  }
  if (MOBILE_API_KEY) {
    h["X-Mobile-Api-Key"] = MOBILE_API_KEY;
  }
  return h;
}

/** Authenticated mobile API requests — Bearer token only per API spec. */
export function buildAuthHeaders(token?: string | null): ApiRequestHeaders {
  return {
    ...buildDefaultHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type FetchJsonOptions = RequestInit & {
  headers?: ApiRequestHeaders;
  /** Pre-login / public routes — do not trigger global 401 sign-out. */
  public?: boolean;
};

const REQUEST_TIMEOUT_MS = 15000;

/** Runs fetch with a timeout, turning network/abort failures into a friendly ApiError. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError("Request timed out. Check your connection and try again.", 0);
    }
    throw new ApiError("Network error — check your connection and try again.", 0);
  } finally {
    clearTimeout(timeout);
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (typeof o.message === "string" && o.message) return o.message;
    if (typeof o.error === "string" && o.error) return o.error;
  }
  return fallback;
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/html") || text.trimStart().startsWith("<")) {
    throw new ApiError(
      `API returned an HTML page — check EXPO_PUBLIC_API_URL in .env (got ${res.status} from ${res.url})`,
      502,
    );
  }
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
      "Non-JSON response from server — check EXPO_PUBLIC_API_URL in .env",
      502,
    );
  }
}

async function handleResponse<T>(
  res: Response,
  options?: { public?: boolean },
): Promise<T> {
  const body = await parseJsonBody(res);
  if (res.status === 401 && !options?.public) {
    notifyUnauthorized();
  }
  if (!res.ok) {
    throw new ApiError(errorMessage(body, res.statusText), res.status);
  }
  return body as T;
}

export async function fetchJson<T>(
  path: string,
  init?: FetchJsonOptions,
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(
      "Set EXPO_PUBLIC_API_URL in .env to your JSON API base (e.g. https://api.example.com).",
      503,
    );
  }
  const { public: isPublic, headers, method, body, ...rest } = init ?? {};
  const url = apiUrl(path);
  const hasBody = body != null && method !== "GET" && method !== "HEAD";
  const res = await fetchWithTimeout(url, {
    method,
    body,
    ...rest,
    headers: {
      ...buildDefaultHeaders(),
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });
  return handleResponse<T>(res, { public: isPublic });
}

/** Multipart upload — do not set Content-Type (fetch sets boundary). */
export async function uploadFormData<T>(
  path: string,
  formData: FormData,
  headers?: ApiRequestHeaders,
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("Set EXPO_PUBLIC_API_URL in .env.", 503);
  }
  const url = apiUrl(path);
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { ...buildDefaultHeaders(), ...headers },
    body: formData,
  });
  return handleResponse<T>(res);
}
