import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "@/lib/theme";

export default function BulkScanDoneScreen() {
  const params = useLocalSearchParams<{
    done: string;
    skipped: string;
    errors: string;
    total: string;
  }>();

  const done = parseInt(params.done ?? "0", 10);
  const skipped = parseInt(params.skipped ?? "0", 10);
  const errors = parseInt(params.errors ?? "0", 10);
  const total = parseInt(params.total ?? "0", 10);
  const successRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={errors > 0 ? "warning" : "checkmark-circle"}
            size={72}
            color={errors > 0 ? colors.warning : colors.success}
          />
        </View>
        <Text style={styles.title}>Session Complete</Text>
        <Text style={styles.rate}>{successRate}% success rate</Text>

        <View style={styles.statsGrid}>
          <StatCard label="Updated" value={done} color={colors.success} icon="checkmark-circle" />
          <StatCard label="Skipped" value={skipped} color={colors.warning} icon="play-skip-forward" />
          <StatCard label="Errors" value={errors} color={colors.danger} icon="alert-circle" />
          <StatCard label="Total" value={total} color={colors.primary} icon="layers" />
        </View>

        <TouchableOpacity
          style={styles.newSessionBtn}
          onPress={() => // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.replace("/(staff)/bulk-scan-select" as any)}
        >
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.newSessionText}>Start New Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitBtn}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.replace("/(staff)" as any)}
        >
          <Text style={styles.exitText}>Back to Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  iconWrap: { marginBottom: spacing.sm },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  rate: { fontSize: 18, color: colors.textMuted, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  statCard: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase" },
  newSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  newSessionText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  exitBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exitText: { fontSize: 15, color: colors.textMuted, fontWeight: "600" },
});
