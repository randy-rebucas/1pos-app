import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import { postPaymentRequest } from "@/lib/api/laundry-repository";
import type { PaymentMethod } from "@/lib/types/laundry";
import { useApiHeaders } from "@/hooks/use-api-headers";
import { ApiError } from "@/lib/api/client";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "card", label: "Card" },
  { id: "wallet", label: "Wallet" },
  { id: "cash", label: "Cash on delivery" },
];

export default function PayOrderScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const headers = useApiHeaders();
  const { getOrder, mergeOrder } = useOrders();
  const order = orderId ? getOrder(orderId) : undefined;
  const [method, setMethod] = useState<PaymentMethod>("gcash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = order?.total ?? 0;

  const subtitle = useMemo(
    () =>
      order ? `POST /payments · Order #${order.reference}` : "Order not found",
    [order],
  );

  async function pay() {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const { order: paid } = await postPaymentRequest(headers, {
        orderId: order.id,
        method,
        amount: order.total,
        currency: order.currency,
      });
      mergeOrder(paid);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <View style={styles.screen}>
        <Text style={styles.miss}>Missing order.</Text>
        <PrimaryButton title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.sub}>{subtitle}</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <Card>
        <Text style={styles.amount}>
          {order.currency} {amount}
        </Text>
        <Text style={styles.section}>Payment method</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => {
            const on = method === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                style={[styles.method, on && styles.methodOn]}
              >
                <Text style={[styles.methodText, on && styles.methodTextOn]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton title="Pay now" loading={busy} onPress={pay} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  err: { color: colors.danger, marginBottom: spacing.md, fontSize: 13 },
  amount: { fontSize: 28, fontWeight: "800", color: colors.text },
  section: {
    marginTop: spacing.lg,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  methods: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  method: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodOn: { borderColor: colors.primary, backgroundColor: "#E8F4FA" },
  methodText: { fontWeight: "600", color: colors.text },
  methodTextOn: { color: colors.primaryDark },
  miss: { marginBottom: spacing.md, fontSize: 16 },
});
