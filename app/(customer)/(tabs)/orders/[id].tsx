import { useLocalSearchParams, Link } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useOrders } from "@/lib/context/orders-context";
import { Screen } from "@/components/laundry/screen";
import { Card } from "@/components/laundry/card";
import { StatusTimeline } from "@/components/laundry/status-timeline";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

export default function CustomerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrder, fetchOrderRemote, error: ordersError } = useOrders();
  const order = id ? getOrder(id) : undefined;

  useFocusEffect(
    useCallback(() => {
      if (id) void fetchOrderRemote(id);
    }, [id, fetchOrderRemote]),
  );

  if (!order) {
    return (
      <Screen>
        <Text style={styles.miss}>Order not found.</Text>
        <Link href="/(customer)/(tabs)/orders" asChild>
          <PrimaryButton title="Back to orders" variant="secondary" />
        </Link>
      </Screen>
    );
  }

  const unpaid = order.paymentStatus !== "paid";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.apiHint}>GET /orders/:id</Text>
      {ordersError ? <Text style={styles.warn}>{ordersError}</Text> : null}
      <View style={styles.top}>
        <Text style={styles.ref}>#{order.reference}</Text>
        <Text style={styles.amount}>
          {order.currency} {order.total}
        </Text>
      </View>
      <Card>
        <Text style={styles.section}>Payment</Text>
        <Text style={styles.payLine}>
          {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
        </Text>
        {unpaid ? (
          <Link
            href={{
              pathname: "/(customer)/(tabs)/orders/pay/[orderId]",
              params: { orderId: order.id },
            }}
            asChild
          >
            <PrimaryButton title="Pay now" style={styles.payBtn} />
          </Link>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.section}>Status</Text>
        <StatusTimeline current={order.status} />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.section}>Schedule</Text>
        <Text style={styles.line}>Pickup: {order.pickupWindow}</Text>
        <Text style={styles.line}>Delivery: {order.deliveryWindow}</Text>
        {order.addressSummary ? (
          <Text style={styles.muted}>{order.addressSummary}</Text>
        ) : null}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.section}>Items</Text>
        {order.lines.map((l) => (
          <Text key={l.label} style={styles.line}>
            {l.label}
            {l.kg != null ? ` · ${l.kg} kg` : ""}
            {l.itemCount != null ? ` · ${l.itemCount} items` : ""}
          </Text>
        ))}
        {order.addons.length > 0 && (
          <>
            <Text style={[styles.section, styles.addonHead]}>Add-ons</Text>
            {order.addons.map((a) => (
              <Text key={a.id} style={styles.muted}>
                {a.label} · {order.currency} {a.price}
              </Text>
            ))}
          </>
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.section}>Activity</Text>
        {[...order.timeline].reverse().map((e, i) => (
          <Text key={`${e.at}-${i}`} style={styles.timelineLine}>
            {new Date(e.at).toLocaleString()} — {e.note ?? e.status}
          </Text>
        ))}
      </Card>
      <Link href="/(customer)/(tabs)/orders" asChild>
        <PrimaryButton title="Back to list" variant="ghost" style={styles.back} />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  apiHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  warn: { fontSize: 12, color: colors.danger, marginBottom: spacing.sm },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.md,
  },
  ref: { fontSize: 24, fontWeight: "800", color: colors.text },
  amount: { fontSize: 18, fontWeight: "700", color: colors.primary },
  card: { marginTop: spacing.md },
  section: { fontSize: 13, fontWeight: "700", color: colors.textMuted, marginBottom: spacing.sm },
  line: { fontSize: 15, color: colors.text, marginBottom: spacing.xs },
  muted: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm },
  addonHead: { marginTop: spacing.md },
  timelineLine: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  miss: { fontSize: 16, marginBottom: spacing.md },
  back: { marginTop: spacing.lg },
  payLine: { fontSize: 15, fontWeight: "600", color: colors.text },
  payBtn: { marginTop: spacing.md },
});
