import { StyleSheet, Text, View } from "react-native";
import type { OrderStatus } from "@/lib/types/laundry";
import { colors, radius, spacing } from "@/lib/theme";

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  picked_up: "Picked up",
  washing: "Washing",
  drying: "Drying",
  ironing: "Ironing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const FLOW: OrderStatus[] = [
  "pending",
  "picked_up",
  "washing",
  "drying",
  "ironing",
  "out_for_delivery",
  "completed",
];

function flowIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  const i = FLOW.indexOf(status);
  return i >= 0 ? i : 0;
}

type Props = {
  current: OrderStatus;
};

/** Full vertical timeline for order detail */
export function StatusTimeline({ current }: Props) {
  if (current === "cancelled") {
    return (
      <View style={styles.banner}>
        <Text style={styles.bannerText}>This order was cancelled.</Text>
      </View>
    );
  }
  const activeIndex = flowIndex(current);

  return (
    <View style={styles.list}>
      {FLOW.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <View key={s} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.node,
                  done && styles.nodeDone,
                  active && styles.nodeActive,
                ]}
              />
              {i < FLOW.length - 1 && (
                <View style={[styles.line, i < activeIndex && styles.lineDone]} />
              )}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, (done || active) && styles.titleStrong]}>
                {LABELS[s]}
              </Text>
              {active && (
                <Text style={styles.sub}>Current stage</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Single-line summary for home cards */
export function StatusSummary({ status }: { status: OrderStatus }) {
  const i = flowIndex(status);
  const pct = status === "cancelled" ? 0 : Math.round(((i + 1) / FLOW.length) * 100);
  return (
    <View>
      <Text style={styles.summaryLabel}>{LABELS[status]}</Text>
      {status !== "cancelled" && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: { flexDirection: "row", minHeight: 44 },
  rail: { width: 20, alignItems: "center" },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: colors.border,
  },
  nodeDone: { backgroundColor: colors.accent },
  nodeActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  lineDone: { backgroundColor: colors.accent },
  copy: { flex: 1, paddingBottom: spacing.md, paddingLeft: spacing.sm },
  title: { fontSize: 15, color: colors.textMuted },
  titleStrong: { color: colors.text, fontWeight: "600" },
  sub: { fontSize: 12, color: colors.primary, marginTop: 2 },
  banner: {
    backgroundColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  bannerText: { color: colors.textMuted, fontWeight: "600" },
  summaryLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
