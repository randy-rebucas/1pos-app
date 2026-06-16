import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStaffScan } from "@/lib/context/staff-scan-context";
import { Screen } from "@/components/ui/screen";
import { colors, spacing, radius } from "@/lib/theme";
import type { ScanMode, SessionFilter } from "@/lib/context/scan-session-store";

export default function BulkScanSelectScreen() {
  const { selectedStore, resetStaffFlow } = useStaffScan();
  const [mode, setMode] = useState<ScanMode>("barcode");
  const [filter, setFilter] = useState<SessionFilter>("missing-barcode");
  const [changingStore, setChangingStore] = useState(false);

  function start() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: "/(staff)/bulk-scan-session" as any, params: { mode, filter } });
  }

  async function handleChangeStore() {
    setChangingStore(true);
    try {
      await resetStaffFlow();
    } finally {
      setChangingStore(false);
    }
  }

  return (
    <Screen contentStyle={styles.container}>
        <View style={styles.contextBar}>
          <View style={styles.contextText}>
            <Text style={styles.contextLabel}>Store</Text>
            <Text style={styles.contextValue}>{selectedStore?.name ?? "—"}</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => void handleChangeStore()}
            disabled={changingStore}
          >
            <Text style={styles.signOutText}>
              {changingStore ? "…" : "Change store"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Product scanner</Text>
        <Text style={styles.subtitle}>
          Scan barcodes or QR codes to update catalog items in your store.
        </Text>

        {/* Scan mode */}
        <Text style={styles.sectionLabel}>Scan Mode</Text>
        <View style={styles.optionRow}>
          <ModeCard
            icon="barcode"
            label="Barcode"
            desc="EAN, UPC, Code128 …"
            active={mode === "barcode"}
            onPress={() => setMode("barcode")}
          />
          <ModeCard
            icon="qr-code"
            label="QR Code"
            desc="QR / Data Matrix"
            active={mode === "qr"}
            onPress={() => setMode("qr")}
          />
        </View>

        {/* Filter */}
        <Text style={styles.sectionLabel}>Product Filter</Text>
        <View style={styles.filterGroup}>
          {(
            [
              ["all", "All products"],
              ["missing-barcode", "Missing barcode"],
              ["missing-image", "Missing image"],
            ] as [SessionFilter, string][]
          ).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
              onPress={() => setFilter(value)}
            >
              <Text style={[styles.filterBtnText, filter === value && styles.filterBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Ionicons name="scan" size={22} color="#fff" />
          <Text style={styles.startBtnText}>Start scanning</Text>
        </TouchableOpacity>
    </Screen>
  );
}

interface ModeCardProps {
  icon: "barcode" | "qr-code";
  label: string;
  desc: string;
  active: boolean;
  onPress: () => void;
}

function ModeCard({ icon, label, desc, active, onPress }: ModeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.modeCard, active && styles.modeCardActive]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={40} color={active ? "#fff" : colors.primary} />
      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text>
      <Text style={[styles.modeDesc, active && styles.modeDescActive]}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  contextBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contextText: { flex: 1 },
  contextLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  contextMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  signOutBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionRow: { flexDirection: "row", gap: spacing.md },
  modeCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  modeLabelActive: { color: "#fff" },
  modeDesc: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
  modeDescActive: { color: "rgba(255,255,255,0.8)" },
  filterGroup: { gap: spacing.sm },
  filterBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  filterBtnActive: { borderColor: colors.primary, backgroundColor: "#e8f4fb" },
  filterBtnText: { fontSize: 14, color: colors.text },
  filterBtnTextActive: { color: colors.primary, fontWeight: "700" },
  startBtn: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: radius.lg,
  },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
