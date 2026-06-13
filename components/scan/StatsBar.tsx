import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import type { ScanSessionStats } from "@/lib/context/scan-session-store";

interface StatsBarProps {
  stats: ScanSessionStats;
  currentIndex: number;
  total: number;
}

export function StatsBar({ stats, currentIndex, total }: StatsBarProps) {
  const progress = total > 0 ? (currentIndex / total) : 0;
  const progressPct = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pill label="Done" value={stats.done} color={colors.success} />
        <Pill label="Skipped" value={stats.skipped} color={colors.warning} />
        <Pill label="Errors" value={stats.errors} color={colors.danger} />
        <Pill label="Total" value={total} color={colors.primary} />
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{currentIndex}/{total}</Text>
      </View>
    </View>
  );
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pill: {
    alignItems: "center",
    minWidth: 56,
  },
  pillValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  pillLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    minWidth: 48,
    textAlign: "right",
  },
});
