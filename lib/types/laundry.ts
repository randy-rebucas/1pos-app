export type OrderStatus =
  | "pending"
  | "picked_up"
  | "washing"
  | "drying"
  | "ironing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type ServiceType = "wash_fold" | "wash_iron" | "dry_clean" | "per_item";

export type PricingModel = "per_kg" | "per_item";

export type UserRole = "customer" | "rider" | "staff" | "admin";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type PaymentMethod = "cash" | "gcash" | "maya" | "card" | "wallet";

export interface ServiceLine {
  serviceType: ServiceType;
  label: string;
  pricingModel: PricingModel;
  /** Estimated or actual kg for per_kg */
  kg?: number;
  itemCount?: number;
}

export interface OrderAddon {
  id: string;
  label: string;
  price: number;
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  reference: string;
  status: OrderStatus;
  customerLabel: string;
  lines: ServiceLine[];
  addons: OrderAddon[];
  subtotal: number;
  total: number;
  currency: string;
  pickupWindow: string;
  deliveryWindow: string;
  createdAt: string;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  /** Staff / rider views */
  addressSummary?: string;
  paymentStatus?: PaymentStatus;
  riderId?: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  line1: string;
  city: string;
  isDefault?: boolean;
}

export interface InboxNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
}

export interface ReportSummary {
  ordersToday: number;
  revenueToday: number;
  currency: string;
  openJobs: number;
}

export interface PickupSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

/** Body shape for POST /orders (client-side; server may expect snake_case). */
export interface CreateOrderInput {
  serviceId: string;
  serviceType: ServiceType;
  label: string;
  pricingModel: PricingModel;
  kg: number;
  itemCount: number;
  addonIds: string[];
  pickupWindow: string;
  deliveryWindow: string;
}

export interface CatalogService {
  id: string;
  type: ServiceType;
  label: string;
  description: string;
  pricingModel: PricingModel;
  ratePerKg?: number;
  ratePerItem?: number;
  minCharge?: number;
}

export interface CatalogAddon {
  id: string;
  label: string;
  price: number;
}
