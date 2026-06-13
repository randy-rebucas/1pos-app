import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "@/lib/theme";

interface ActionBarProps {
  onSkip: () => void;
  onSave: () => void;
  onDone: () => void;
  saving?: boolean;
  isLast?: boolean;
}

export function ActionBar({ onSkip, onSave, onDone, saving = false, isLast = false }: ActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} disabled={saving}>
        <Ionicons name="play-skip-forward" size={18} color={colors.textMuted} />
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.saveBtnText}>{isLast ? "Save & Finish" : "Save & Next"}</Text>
            <Ionicons name={isLast ? "checkmark-circle" : "arrow-forward"} size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} disabled={saving}>
        <Ionicons name="flag" size={18} color={colors.primary} />
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 72,
    justifyContent: "center",
  },
  skipText: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 72,
    justifyContent: "center",
  },
  doneText: { fontSize: 14, color: colors.primary, fontWeight: "600" },
});
