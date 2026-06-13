import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useStaffScan } from "@/lib/context/staff-scan-context";
import { colors } from "@/lib/theme";

const PUBLIC_STAFF_SCREENS = new Set(["store-select", "login"]);

export default function StaffLayout() {
  const { isHydrated, selectedStore, staffToken } = useStaffScan();
  const segments = useSegments();
  const path = segments as string[];
  const current = path[path.length - 1] ?? "";
  const inStaffArea = path.includes("(staff)");

  if (!isHydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (inStaffArea && !PUBLIC_STAFF_SCREENS.has(current)) {
    if (!selectedStore) return <Redirect href="/(staff)/store-select" />;
    if (!staffToken) return <Redirect href="/(staff)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "POS Home" }} />
      <Stack.Screen name="store-select" options={{ title: "Select store" }} />
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen
        name="bulk-scan-select"
        options={{ title: "Product scanner" }}
      />
      <Stack.Screen
        name="bulk-scan-session"
        options={{ title: "Scanning", headerBackVisible: false }}
      />
      <Stack.Screen
        name="bulk-scan-done"
        options={{ title: "Session complete", headerBackVisible: false }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
