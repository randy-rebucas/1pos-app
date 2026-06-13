import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import { useSession } from "@/lib/context/session-context";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { StatusSummary } from "@/components/laundry/status-timeline";
import { colors, spacing } from "@/lib/theme";

export default function CustomerHomeScreen() {
  const { session } = useSession();
  const { orders, error: ordersError, syncing } = useOrders();
  const active = orders.find(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greet}>
        Hello{session?.displayName ? `, ${session.displayName}` : ""}
      </Text>
      <Text style={styles.lead}>What do you need washed today?</Text>
      {ordersError ? (
        <Text style={styles.warn}>{ordersError}</Text>
      ) : (
        <Text style={styles.sync}>
          Orders from GET /orders
          {syncing ? " · updating…" : ""}
        </Text>
      )}

      <Link href="/(customer)/(tabs)/book" asChild>
        <PrimaryButton title="Book laundry" style={styles.cta} />
      </Link>

      {active ? (
        <Link
          href={{
            pathname: "/(customer)/(tabs)/orders/[id]",
            params: { id: active.id },
          }}
          asChild
        >
          <Card style={styles.active}>
            <Text style={styles.activeLabel}>Active order</Text>
            <View style={styles.activeRow}>
              <Text style={styles.activeRef}>#{active.reference}</Text>
              <Text style={styles.activeAmt}>
                {active.currency} {active.total}
              </Text>
            </View>
            <StatusSummary status={active.status} />
            <Text style={styles.trackHint}>Tap to track</Text>
          </Card>
        </Link>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active orders</Text>
          <Text style={styles.emptyBody}>
            Schedule a pickup in a few taps. Pricing is estimated until weigh-in
            at the plant.
          </Text>
        </Card>
      )}

      <View style={styles.row}>
        <Link href="/(customer)/(tabs)/orders" asChild>
          <PrimaryButton
            title="Order history"
            variant="secondary"
            style={styles.half}
          />
        </Link>
        <Link href="/(customer)/(tabs)/account" asChild>
          <PrimaryButton title="Account" variant="ghost" style={styles.half} />
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  greet: { fontSize: 16, color: colors.textMuted },
  lead: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sync: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg },
  warn: { fontSize: 12, color: colors.danger, marginBottom: spacing.lg },
  cta: { marginBottom: spacing.lg },
  active: { marginBottom: spacing.md },
  activeLabel: { fontSize: 12, fontWeight: "700", color: colors.primary },
  activeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  activeRef: { fontSize: 20, fontWeight: "800", color: colors.text },
  activeAmt: { fontSize: 16, fontWeight: "700", color: colors.primary },
  trackHint: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  emptyCard: { marginBottom: spacing.md },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  emptyBody: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },
});
