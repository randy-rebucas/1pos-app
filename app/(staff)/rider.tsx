import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import type { OrderStatus } from "@/lib/types/laundry";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

const PICKUP_STATUSES: OrderStatus[] = ["pending"];
const DELIVERY_STATUSES: OrderStatus[] = ["out_for_delivery"];

export default function RiderScreen() {
  const { orders, advanceStatus } = useOrders();
  const pickups = orders.filter((o) => PICKUP_STATUSES.includes(o.status));
  const drops = orders.filter((o) => DELIVERY_STATUSES.includes(o.status));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.hint}>PATCH /orders/:id/status</Text>
      <Text style={styles.head}>Pickup run</Text>
      {pickups.length === 0 ? (
        <Text style={styles.empty}>No pickups in queue.</Text>
      ) : (
        pickups.map((o) => (
          <Card key={o.id} style={styles.card}>
            <Text style={styles.ref}>#{o.reference}</Text>
            <Text style={styles.meta}>{o.addressSummary}</Text>
            <Text style={styles.meta}>{o.pickupWindow}</Text>
            <PrimaryButton
              title="Mark picked up"
              style={styles.btn}
              onPress={() =>
                void advanceStatus(o.id, "picked_up", "Rider confirmed pickup")
              }
            />
          </Card>
        ))
      )}

      <Text style={[styles.head, styles.spaced]}>Delivery run</Text>
      {drops.length === 0 ? (
        <Text style={styles.empty}>No deliveries out.</Text>
      ) : (
        drops.map((o) => (
          <Card key={o.id} style={styles.card}>
            <Text style={styles.ref}>#{o.reference}</Text>
            <Text style={styles.meta}>{o.addressSummary}</Text>
            <PrimaryButton
              title="Proof of delivery"
              style={styles.btn}
              onPress={() =>
                void advanceStatus(o.id, "completed", "POD captured (mock)")
              }
            />
          </Card>
        ))
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
  spaced: { marginTop: spacing.xl },
  empty: { color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md },
  card: { marginTop: spacing.md },
  ref: { fontSize: 17, fontWeight: "800", color: colors.text },
  meta: { marginTop: spacing.xs, color: colors.textMuted, fontSize: 14 },
  btn: { marginTop: spacing.md },
  back: { marginTop: spacing.xl },
});
