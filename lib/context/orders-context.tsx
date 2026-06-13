import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CreateOrderInput, Order, OrderStatus } from "@/lib/types/laundry";
import { useTenant } from "@/lib/context/tenant-context";
import { useSession } from "@/lib/context/session-context";
import { ApiError, buildTenantHeaders } from "@/lib/api/client";
import {
  createOrderRequest,
  fetchOrderById,
  fetchOrdersList,
  patchOrderStatusRequest,
  toCreateOrderBody,
} from "@/lib/api/laundry-repository";

interface OrdersContextValue {
  orders: Order[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  clearError: () => void;
  refreshOrders: () => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  fetchOrderRemote: (id: string) => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  advanceStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string,
  ) => Promise<void>;
  mergeOrder: (order: Order) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { tenantId, branchId } = useTenant();
  const { token } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(
    () => buildTenantHeaders(tenantId, branchId, token),
    [tenantId, branchId, token],
  );

  const clearError = useCallback(() => setError(null), []);

  const refreshOrders = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const list = await fetchOrdersList(headers);
      setOrders(list);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : String(e);
      setError(msg);
      setOrders([]);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const mergeOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id);
      if (idx === -1) return [order, ...prev];
      const next = [...prev];
      next[idx] = order;
      return next;
    });
  }, []);

  const fetchOrderRemote = useCallback(
    async (id: string) => {
      try {
        const one = await fetchOrderById(headers, id);
        setOrders((prev) => {
          const idx = prev.findIndex((o) => o.id === one.id);
          if (idx === -1) return [one, ...prev];
          const next = [...prev];
          next[idx] = one;
          return next;
        });
        setError(null);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : String(e);
        setError(msg);
      }
    },
    [headers],
  );

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      try {
        const body = toCreateOrderBody(input, tenantId, branchId);
        const order = await createOrderRequest(headers, body);
        setOrders((prev) => [order, ...prev]);
        setError(null);
        return order;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : String(e);
        setError(msg);
        throw e;
      }
    },
    [headers, tenantId, branchId],
  );

  const advanceStatus = useCallback(
    async (orderId: string, status: OrderStatus, note?: string) => {
      try {
        const updated = await patchOrderStatusRequest(
          headers,
          orderId,
          status,
          note,
        );
        mergeOrder(updated);
        setError(null);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : String(e);
        setError(msg);
      }
    },
    [headers, mergeOrder],
  );

  const value = useMemo(
    () => ({
      orders,
      loading,
      syncing,
      error,
      clearError,
      refreshOrders,
      getOrder,
      fetchOrderRemote,
      createOrder,
      advanceStatus,
      mergeOrder,
    }),
    [
      orders,
      loading,
      syncing,
      error,
      clearError,
      refreshOrders,
      getOrder,
      fetchOrderRemote,
      createOrder,
      advanceStatus,
      mergeOrder,
    ],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
