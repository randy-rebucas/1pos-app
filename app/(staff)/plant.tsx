import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import type { OrderStatus } from "@/lib/types/laundry";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  picked_up: "washing",
  washing: "drying",
  drying: "ironing",
  ironing: "out_for_delivery",
};

function advanceTitle(next: OrderStatus) {
  return `Advance to ${next.replace(/_/g, " ")}`;
}

export default function PlantScreen() {
  const { orders, advanceStatus } = useOrders();
  const queue = orders.filter(
    (o) =>
      o.status !== "pending" &&
      o.status !== "completed" &&
      o.status !== "cancelled" &&
      o.status !== "out_for_delivery",
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>PATCH /orders/:id/status</Text>
      <Text style={styles.head}>Production</Text>
      <Text style={styles.sub}>
        Advance stages as work moves through the plant (mock — no role guard
        yet).
      </Text>
      {queue.length === 0 ? (
        <Text style={styles.empty}>Nothing in plant right now.</Text>
      ) : (
        queue.map((o) => {
          const next = NEXT[o.status];
          return (
            <Card key={o.id} style={styles.card}>
              <Text style={styles.ref}>#{o.reference}</Text>
              <Text style={styles.status}>Stage: {o.status.replace(/_/g, " ")}</Text>
              {next ? (
                <PrimaryButton
                  title={advanceTitle(next)}
                  style={styles.btn}
                  onPress={() =>
                    void advanceStatus(o.id, next, `Moved to ${next}`)
                  }
                />
              ) : (
                <Text style={styles.muted}>No further plant steps.</Text>
              )}
            </Card>
          );
        })
      )}

      <Link href="/(staff)" asChild>
        <PrimaryButton title="Back" variant="ghost" style={styles.back} />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  head: { fontSize: 18, fontWeight: "800", color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 20 },
  empty: { color: colors.textMuted },
  card: { marginTop: spacing.md },
  ref: { fontSize: 17, fontWeight: "800", color: colors.text },
  status: { marginTop: spacing.xs, color: colors.textMuted, textTransform: "capitalize" },
  btn: { marginTop: spacing.md },
  muted: { marginTop: spacing.md, color: colors.textMuted },
  back: { marginTop: spacing.xl },
});
