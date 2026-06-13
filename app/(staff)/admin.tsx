import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchReportSummary } from "@/lib/api/laundry-repository";
import type { ReportSummary } from "@/lib/types/laundry";
import { useApiHeaders } from "@/hooks/use-api-headers";
import { useTenant } from "@/lib/context/tenant-context";
import { ApiError } from "@/lib/api/client";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

function rangeToday() {
  const d = new Date();
  const from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const to = new Date(from);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function StaffAdminScreen() {
  const headers = useApiHeaders();
  const { branchId } = useTenant();
  const [data, setData] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { from, to } = rangeToday();
      const summary = await fetchReportSummary(headers, {
        from,
        to,
        branchId,
      });
      setData(summary);
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError ? e.message : String(e));
    }
  }, [headers, branchId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.head}>Admin</Text>
      <Text style={styles.sub}>GET /reports/summary</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {!data && !error ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : null}
      {data ? (
        <View style={styles.grid}>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>Orders today</Text>
            <Text style={styles.tileVal}>{data.ordersToday}</Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>Revenue today</Text>
            <Text style={styles.tileVal}>
              {data.currency} {data.revenueToday.toLocaleString()}
            </Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>Open jobs</Text>
            <Text style={styles.tileVal}>{data.openJobs}</Text>
          </Card>
        </View>
      ) : null}
      <Text style={styles.note}>
        Rider assignment: PATCH /orders/:id with {"{ riderId }"}.
      </Text>
      <PrimaryButton
        title="Bulk Product Scanner"
        style={styles.back}
        onPress={() => router.push("/(staff)/bulk-scan-select" as never)}
      />
      <Link href="/(staff)" asChild>
        <PrimaryButton title="Back" variant="ghost" style={styles.back} />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  head: { fontSize: 22, fontWeight: "800", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg },
  err: { color: colors.danger, marginBottom: spacing.md, fontSize: 13 },
  loader: { marginTop: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: { flexGrow: 1, minWidth: "42%" },
  tileLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  tileVal: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
  note: { marginTop: spacing.xl, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  back: { marginTop: spacing.xl },
});
