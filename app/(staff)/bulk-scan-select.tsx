import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "@/lib/theme";
import type { ScanMode, SessionFilter } from "@/lib/context/scan-session-store";

export default function BulkScanSelectScreen() {
  const [mode, setMode] = useState<ScanMode>("barcode");
  const [filter, setFilter] = useState<SessionFilter>("missing-barcode");

  function start() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push({ pathname: "/(staff)/bulk-scan-session" as any, params: { mode, filter } });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Bulk Product Editor</Text>
        <Text style={styles.subtitle}>
          Scan barcodes or QR codes to update products one by one.
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
          <Text style={styles.startBtnText}>Start Bulk Edit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg },
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
