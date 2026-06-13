import { fetchJson } from "@/lib/api/client";
import type { ApiRequestHeaders } from "@/lib/api/client";
import type { OrderStatus, PaymentMethod } from "@/lib/types/laundry";

const jsonHeaders = (h: ApiRequestHeaders) => h;

/** GET /services */
export async function apiGetServices(
  headers: ApiRequestHeaders,
  branchId: string,
) {
  return fetchJson<unknown>(`/services?branchId=${encodeURIComponent(branchId)}`, {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** GET /pricing — quote breakdown */
export async function apiGetPricing(
  headers: ApiRequestHeaders,
  q: {
    serviceId: string;
    pricingModel: string;
    kg?: number;
    itemCount?: number;
    addonIds: string[];
  },
) {
  const p = new URLSearchParams({
    serviceId: q.serviceId,
    pricingModel: q.pricingModel,
    addonIds: q.addonIds.join(","),
  });
  if (q.kg != null) p.set("kg", String(q.kg));
  if (q.itemCount != null) p.set("itemCount", String(q.itemCount));
  return fetchJson<unknown>(`/pricing?${p.toString()}`, {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** GET /pickup-slots */
export async function apiGetPickupSlots(
  headers: ApiRequestHeaders,
  branchId: string,
  date: string,
) {
  return fetchJson<unknown>(
    `/pickup-slots?branchId=${encodeURIComponent(branchId)}&date=${encodeURIComponent(date)}`,
    { method: "GET", headers: jsonHeaders(headers) },
  );
}

/** POST /pickup-schedule */
export async function apiPostPickupSchedule(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
) {
  return fetchJson<unknown>("/pickup-schedule", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** GET /orders */
export async function apiListOrders(headers: ApiRequestHeaders) {
  return fetchJson<unknown>("/orders", {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** GET /orders/:id */
export async function apiGetOrder(headers: ApiRequestHeaders, id: string) {
  return fetchJson<unknown>(`/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** POST /orders */
export async function apiCreateOrder(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
) {
  return fetchJson<unknown>("/orders", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** PATCH /orders/:id/status */
export async function apiPatchOrderStatus(
  headers: ApiRequestHeaders,
  id: string,
  body: { status: OrderStatus; note?: string },
) {
  return fetchJson<unknown>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** PATCH /orders/:id — assign rider, etc. */
export async function apiPatchOrder(
  headers: ApiRequestHeaders,
  id: string,
  body: Record<string, unknown>,
) {
  return fetchJson<unknown>(`/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** POST /payments */
export async function apiPostPayment(
  headers: ApiRequestHeaders,
  body: {
    orderId: string;
    method: PaymentMethod;
    amount: number;
    currency?: string;
  },
) {
  return fetchJson<unknown>("/payments", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** GET /notifications */
export async function apiListNotifications(headers: ApiRequestHeaders) {
  return fetchJson<unknown>("/notifications", {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** GET /customers/me/addresses */
export async function apiListAddresses(headers: ApiRequestHeaders) {
  return fetchJson<unknown>("/customers/me/addresses", {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}

/** POST /customers/me/addresses */
export async function apiCreateAddress(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
) {
  return fetchJson<unknown>("/customers/me/addresses", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** POST /auth/otp/request */
export async function apiAuthOtpRequest(
  headers: ApiRequestHeaders,
  body: { channel: "sms" | "email"; to: string },
) {
  return fetchJson<unknown>("/auth/otp/request", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** POST /auth/otp/verify */
export async function apiAuthOtpVerify(
  headers: ApiRequestHeaders,
  body: { to: string; code: string },
) {
  return fetchJson<unknown>("/auth/otp/verify", {
    method: "POST",
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  });
}

/** GET /reports/summary */
export async function apiGetReportSummary(
  headers: ApiRequestHeaders,
  q: { from: string; to: string; branchId?: string },
) {
  const p = new URLSearchParams({ from: q.from, to: q.to });
  if (q.branchId) p.set("branchId", q.branchId);
  return fetchJson<unknown>(`/reports/summary?${p.toString()}`, {
    method: "GET",
    headers: jsonHeaders(headers),
  });
}
