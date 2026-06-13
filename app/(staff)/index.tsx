import { Link, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useStaffScan } from "@/lib/context/staff-scan-context";
import { Card } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, spacing } from "@/lib/theme";

export default function StaffHomeScreen() {
  const { selectedStore, resetStaffFlow } = useStaffScan();

  async function handleChangeStore() {
    await resetStaffFlow();
    router.replace("/(staff)/store-select");
  }

  return (
    <Screen contentStyle={styles.screen}>
      <Card style={styles.context}>
        <Text style={styles.contextLabel}>Store</Text>
        <Text style={styles.contextName}>
          {selectedStore?.storeName ?? selectedStore?.name ?? "—"}
        </Text>
        {selectedStore?.storeName !== selectedStore?.name ? (
          <Text style={styles.contextBranch}>{selectedStore?.name}</Text>
        ) : null}
      </Card>

      <Text style={styles.headline}>Store POS</Text>
      <Text style={styles.sub}>
        Scan barcodes to update products, prices, and stock on the floor.
      </Text>

      <Link href="/(staff)/bulk-scan-select" asChild>
        <PrimaryButton title="Scan products" />
      </Link>

      <View style={styles.footer}>
        <PrimaryButton
          title="Change store"
          variant="ghost"
          onPress={() => void handleChangeStore()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  context: { marginBottom: spacing.lg },
  contextLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contextName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.xs,
  },
  contextBranch: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 2,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  footer: { marginTop: "auto", paddingBottom: spacing.lg },
});
