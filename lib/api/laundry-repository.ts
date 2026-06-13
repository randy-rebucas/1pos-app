import type { ApiRequestHeaders } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/laundry-api";
import {
  extractArray,
  mapApiAddon,
  mapApiOrder,
  mapApiService,
} from "@/lib/api/mappers";
import type {
  CatalogAddon,
  CatalogService,
  CreateOrderInput,
  CustomerAddress,
  InboxNotification,
  Order,
  OrderStatus,
  PaymentMethod,
  PickupSlot,
  ReportSummary,
} from "@/lib/types/laundry";

function firstObject(payload: unknown): Record<string, unknown> | null {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }
  return null;
}

function unwrapOrder(payload: unknown): unknown {
  const o = firstObject(payload);
  if (!o) return payload;
  return o.order ?? o.data ?? payload;
}

function parseOrder(payload: unknown): Order {
  const o = mapApiOrder(unwrapOrder(payload));
  if (!o) {
    throw new ApiError("Order response could not be parsed", 502);
  }
  return o;
}

function parseAddress(row: unknown): CustomerAddress {
  if (!row || typeof row !== "object") {
    throw new ApiError("Address response could not be parsed", 502);
  }
  const r = row as Record<string, unknown>;
  const id = String(r.id ?? "");
  if (!id) {
    throw new ApiError("Address response missing id", 502);
  }
  return {
    id,
    label: String(r.label ?? "Address"),
    line1: String(r.line1 ?? r.line_1 ?? ""),
    city: String(r.city ?? ""),
    isDefault: Boolean(r.isDefault ?? r.is_default),
  };
}

export function toCreateOrderBody(
  input: CreateOrderInput,
  tenantId: string,
  branchId: string,
): Record<string, unknown> {
  return {
    tenantId,
    branchId,
    serviceId: input.serviceId,
    serviceType: input.serviceType,
    label: input.label,
    pricingModel: input.pricingModel,
    kg: input.kg,
    itemCount: input.itemCount,
    addonIds: input.addonIds,
    pickupWindow: input.pickupWindow,
    deliveryWindow: input.deliveryWindow,
  };
}

export async function fetchOrdersList(
  headers: ApiRequestHeaders,
): Promise<Order[]> {
  const raw = await api.apiListOrders(headers);
  const arr = extractArray(raw, ["orders", "data", "items"]);
  const list = Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object"
    ? raw
    : arr;
  return list
    .map((row) => mapApiOrder(row))
    .filter((x): x is Order => Boolean(x));
}

export async function fetchOrderById(
  headers: ApiRequestHeaders,
  id: string,
): Promise<Order> {
  const raw = await api.apiGetOrder(headers, id);
  return parseOrder(raw);
}

export async function createOrderRequest(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
): Promise<Order> {
  const raw = await api.apiCreateOrder(headers, body);
  return parseOrder(raw);
}

export async function patchOrderStatusRequest(
  headers: ApiRequestHeaders,
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> {
  const raw = await api.apiPatchOrderStatus(headers, id, { status, note });
  return parseOrder(raw);
}

export async function postPaymentRequest(
  headers: ApiRequestHeaders,
  args: {
    orderId: string;
    method: PaymentMethod;
    amount: number;
    currency?: string;
  },
): Promise<{ paymentId?: string; order: Order }> {
  const raw = await api.apiPostPayment(headers, args);
  const o = firstObject(raw);
  const mapped = mapApiOrder(unwrapOrder(raw));
  if (!mapped) {
    throw new ApiError("Payment response missing order payload", 502);
  }
  return {
    paymentId: o?.paymentId != null ? String(o.paymentId) : undefined,
    order: { ...mapped, paymentStatus: "paid" },
  };
}

export async function fetchServicesCatalog(
  headers: ApiRequestHeaders,
  branchId: string,
): Promise<{ services: CatalogService[]; addons: CatalogAddon[] }> {
  const raw = await api.apiGetServices(headers, branchId);
  const root = firstObject(raw);
  const servicesArr = Array.isArray(raw)
    ? raw
    : extractArray(raw, ["services", "data", "items"]);
  const services = servicesArr
    .map(mapApiService)
    .filter((x): x is CatalogService => Boolean(x));
  const addonsArr = root
    ? extractArray(root.addons ?? root.add_ons, [])
    : [];
  const addons = addonsArr
    .map(mapApiAddon)
    .filter((x): x is CatalogAddon => Boolean(x));
  return { services, addons };
}

export async function fetchPricingQuote(
  headers: ApiRequestHeaders,
  q: {
    serviceId: string;
    pricingModel: string;
    kg?: number;
    itemCount?: number;
    addonIds: string[];
  },
): Promise<{ subtotal: number; addons: number; total: number }> {
  const raw = await api.apiGetPricing(headers, q);
  const o = firstObject(raw);
  if (!o) {
    throw new ApiError("Pricing response could not be parsed", 502);
  }
  return {
    subtotal: Number(o.subtotal ?? o.line_total ?? 0),
    addons: Number(o.addonsTotal ?? o.addons_total ?? 0),
    total: Number(o.total ?? o.amount ?? 0),
  };
}

export async function fetchPickupSlots(
  headers: ApiRequestHeaders,
  branchId: string,
  date: string,
): Promise<PickupSlot[]> {
  const raw = await api.apiGetPickupSlots(headers, branchId, date);
  const arr = extractArray(raw, ["slots", "data", "items"]);
  const slots = arr
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = String(r.id ?? r.slot_id ?? "");
      if (!id) return null;
      return {
        id,
        label: String(r.label ?? r.window ?? "Slot"),
        start: String(r.start ?? r.start_at ?? ""),
        end: String(r.end ?? r.end_at ?? ""),
      };
    })
    .filter(Boolean) as PickupSlot[];
  return slots;
}

export async function reservePickupSchedule(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
): Promise<unknown> {
  return api.apiPostPickupSchedule(headers, body);
}

export async function fetchNotifications(
  headers: ApiRequestHeaders,
): Promise<InboxNotification[]> {
  const raw = await api.apiListNotifications(headers);
  const arr = extractArray(raw, ["notifications", "data", "items"]);
  return arr
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = String(r.id ?? "");
      if (!id) return null;
      return {
        id,
        title: String(r.title ?? "Update"),
        body: String(r.body ?? r.message ?? ""),
        createdAt: String(r.createdAt ?? r.created_at ?? new Date().toISOString()),
        read: Boolean(r.read),
      };
    })
    .filter(Boolean) as InboxNotification[];
}

export async function fetchAddresses(
  headers: ApiRequestHeaders,
): Promise<CustomerAddress[]> {
  const raw = await api.apiListAddresses(headers);
  const arr = extractArray(raw, ["addresses", "data", "items"]);
  return arr.map(parseAddress);
}

export async function createAddressRequest(
  headers: ApiRequestHeaders,
  body: Record<string, unknown>,
): Promise<CustomerAddress> {
  const raw = await api.apiCreateAddress(headers, body);
  const arr = extractArray(raw, ["address", "data", "addresses"]);
  const one = arr[0] ?? unwrapOrder(raw);
  return parseAddress(one);
}

export async function requestOtp(
  headers: ApiRequestHeaders,
  channel: "sms" | "email",
  to: string,
): Promise<void> {
  await api.apiAuthOtpRequest(headers, { channel, to });
}

export async function verifyOtp(
  headers: ApiRequestHeaders,
  to: string,
  code: string,
): Promise<{ token: string; displayName: string; userId: string }> {
  const raw = await api.apiAuthOtpVerify(headers, { to, code });
  const o = firstObject(raw);
  const token =
    o?.token != null
      ? String(o.token)
      : o?.access_token != null
        ? String(o.access_token)
        : "";
  if (!token) {
    throw new ApiError("Verify response missing token", 502);
  }
  const displayName = String(
    o?.displayName ?? o?.display_name ?? o?.name ?? "Customer",
  );
  const userId = String(
    o?.userId ?? o?.user_id ?? o?.sub ?? "user",
  );
  return { token, displayName, userId };
}

export async function fetchReportSummary(
  headers: ApiRequestHeaders,
  q: { from: string; to: string; branchId?: string },
): Promise<ReportSummary> {
  const raw = await api.apiGetReportSummary(headers, q);
  const o = firstObject(raw);
  if (!o) {
    throw new ApiError("Report summary could not be parsed", 502);
  }
  return {
    ordersToday: Number(o.ordersToday ?? o.orders_today ?? 0),
    revenueToday: Number(o.revenueToday ?? o.revenue_today ?? 0),
    currency: String(o.currency ?? "PHP"),
    openJobs: Number(o.openJobs ?? o.open_jobs ?? 0),
  };
}

export async function assignRiderRequest(
  headers: ApiRequestHeaders,
  orderId: string,
  riderId: string,
): Promise<Order> {
  const raw = await api.apiPatchOrder(headers, orderId, { riderId });
  return parseOrder(raw);
}
