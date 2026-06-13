import type {
  CatalogAddon,
  CatalogService,
  Order,
  OrderAddon,
  OrderStatus,
  PricingModel,
  ServiceLine,
  ServiceType,
} from "@/lib/types/laundry";

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

const STATUSES: OrderStatus[] = [
  "pending",
  "picked_up",
  "washing",
  "drying",
  "ironing",
  "out_for_delivery",
  "completed",
  "cancelled",
];

function asStatus(v: unknown): OrderStatus {
  const s = str(v, "pending");
  return STATUSES.includes(s as OrderStatus) ? (s as OrderStatus) : "pending";
}

export function extractArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const k of keys) {
      const v = o[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export function mapApiOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id);
  if (!id) return null;
  const linesRaw = extractArray(o.lines ?? o["service_lines"], ["items"]);
  const lines: ServiceLine[] = linesRaw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      return {
        serviceType: str(r.serviceType ?? r.service_type, "wash_fold") as ServiceType,
        label: str(r.label ?? r.name, "Service"),
        pricingModel: str(r.pricingModel ?? r.pricing_model, "per_kg") as PricingModel,
        kg: r.kg != null ? num(r.kg) : undefined,
        itemCount: r.itemCount != null ? num(r.itemCount) : r.item_count != null ? num(r.item_count) : undefined,
      };
    })
    .filter(Boolean) as ServiceLine[];

  const addonsRaw = extractArray(o.addons, ["addon_lines"]);
  const addons: OrderAddon[] = addonsRaw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      return {
        id: str(r.id, "addon"),
        label: str(r.label ?? r.name, "Add-on"),
        price: num(r.price ?? r.amount),
      };
    })
    .filter(Boolean) as OrderAddon[];

  const timelineRaw = extractArray(o.timeline ?? o.events, ["events"]);
  const timeline = timelineRaw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      return {
        status: asStatus(r.status ?? r.state),
        at: str(r.at ?? r.created_at ?? r.timestamp, new Date().toISOString()),
        note: r.note != null ? str(r.note) : undefined,
      };
    })
    .filter(Boolean) as Order["timeline"];

  return {
    id,
    tenantId: str(o.tenantId ?? o.tenant_id, "tenant_demo"),
    branchId: str(o.branchId ?? o.branch_id, "branch_qc"),
    reference: str(o.reference ?? o.order_ref ?? id.slice(-6), id),
    status: asStatus(o.status ?? o.state),
    customerLabel: str(o.customerLabel ?? o.customer_label, "Customer"),
    lines: lines.length
      ? lines
      : [
          {
            serviceType: "wash_fold",
            label: "Wash & fold",
            pricingModel: "per_kg",
            kg: 5,
          },
        ],
    addons,
    subtotal: num(o.subtotal, num(o.total, 0)),
    total: num(o.total ?? o.amount, 0),
    currency: str(o.currency, "PHP"),
    pickupWindow: str(o.pickupWindow ?? o.pickup_window, "—"),
    deliveryWindow: str(o.deliveryWindow ?? o.delivery_window, "—"),
    createdAt: str(o.createdAt ?? o.created_at, new Date().toISOString()),
    timeline: timeline.length
      ? timeline
      : [{ status: asStatus(o.status), at: str(o.createdAt ?? o.created_at, new Date().toISOString()), note: "Created" }],
    addressSummary: o.addressSummary != null ? str(o.addressSummary) : o.address_summary != null ? str(o.address_summary) : undefined,
    paymentStatus:
      o.paymentStatus != null
        ? (str(o.paymentStatus) as Order["paymentStatus"])
        : o.payment_status != null
          ? (str(o.payment_status) as Order["paymentStatus"])
          : undefined,
    riderId: o.riderId != null ? str(o.riderId) : o.rider_id != null ? str(o.rider_id) : undefined,
  };
}

export function mapApiService(raw: unknown): CatalogService | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id, "");
  if (!id) return null;
  return {
    id,
    type: str(o.type ?? o.service_type, "wash_fold") as ServiceType,
    label: str(o.label ?? o.name, "Service"),
    description: str(o.description, ""),
    pricingModel: str(o.pricingModel ?? o.pricing_model, "per_kg") as PricingModel,
    ratePerKg: o.ratePerKg != null ? num(o.ratePerKg) : o.rate_per_kg != null ? num(o.rate_per_kg) : undefined,
    ratePerItem: o.ratePerItem != null ? num(o.ratePerItem) : o.rate_per_item != null ? num(o.rate_per_item) : undefined,
    minCharge: o.minCharge != null ? num(o.minCharge) : o.min_charge != null ? num(o.min_charge) : undefined,
  };
}

export function mapApiAddon(raw: unknown): CatalogAddon | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = str(o.id, "");
  if (!id) return null;
  return {
    id,
    label: str(o.label ?? o.name, "Add-on"),
    price: num(o.price, 0),
  };
}
