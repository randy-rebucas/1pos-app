import { Link } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useOrders } from "@/lib/context/orders-context";
import { Card } from "@/components/laundry/card";
import { StatusSummary } from "@/components/laundry/status-timeline";
import { colors, spacing } from "@/lib/theme";

export default function CustomerOrdersScreen() {
  const { orders, loading, syncing, error, clearError, refreshOrders } =
    useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    clearError();
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  }, [refreshOrders, clearError]);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>GET /orders</Text>
        {syncing && !refreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No orders from the API yet. Pull to refresh.
            </Text>
          }
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: "/(customer)/(tabs)/orders/[id]",
                params: { id: item.id },
              }}
              asChild
            >
              <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
                <Card>
                  <View style={styles.row}>
                    <Text style={styles.ref}>#{item.reference}</Text>
                    <Text style={styles.total}>
                      {item.currency} {item.total}
                    </Text>
                  </View>
                  <Text style={styles.payHint}>
                    {item.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </Text>
                  <Text style={styles.lines} numberOfLines={1}>
                    {item.lines.map((l) => l.label).join(" · ")}
                  </Text>
                  <View style={styles.meta}>
                    <StatusSummary status={item.status} />
                  </View>
                </Card>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  bannerText: { flex: 1, fontSize: 12, color: colors.textMuted },
  errorBox: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: "#FCE8E8",
    borderRadius: 8,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  center: { marginTop: spacing.xl },
  list: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  pressed: { opacity: 0.9 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ref: { fontSize: 18, fontWeight: "700", color: colors.text },
  total: { fontSize: 15, fontWeight: "600", color: colors.primary },
  payHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  lines: { marginTop: spacing.xs, color: colors.textMuted, fontSize: 14 },
  meta: { marginTop: spacing.md },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: spacing.xl },
});
