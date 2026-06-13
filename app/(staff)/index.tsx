import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

export default function StaffHomeScreen() {
  const { orders } = useOrders();
  const open = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <View style={styles.screen}>
      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <Text style={styles.metricLabel}>Open jobs</Text>
          <Text style={styles.metricVal}>{open}</Text>
        </Card>
        <Card style={styles.metric}>
          <Text style={styles.metricLabel}>Booked value</Text>
          <Text style={styles.metricVal}>₱{revenue}</Text>
        </Card>
      </View>
      <Text style={styles.section}>Queues</Text>
      <Link href="/(staff)/rider" asChild>
        <PrimaryButton title="Rider · pickups & drops" />
      </Link>
      <Link href="/(staff)/plant" asChild>
        <PrimaryButton
          title="Plant · production"
          variant="secondary"
          style={styles.second}
        />
      </Link>
      <Link href="/(staff)/admin" asChild>
        <PrimaryButton
          title="Admin · KPIs & dispatch"
          variant="secondary"
          style={styles.second}
        />
      </Link>
      <View style={styles.footer}>
        <Link href="/(customer)" asChild>
          <PrimaryButton title="Open customer app" variant="ghost" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  metrics: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  metricVal: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
  section: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  second: { marginTop: spacing.md },
  footer: { marginTop: "auto", paddingBottom: spacing.lg },
});
