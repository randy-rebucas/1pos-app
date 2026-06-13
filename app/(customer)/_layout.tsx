import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSession } from "@/lib/context/session-context";
import { colors } from "@/lib/theme";

export default function CustomerLayout() {
  const { isHydrated, isAuthenticated } = useSession();
  const segments = useSegments();

  if (!isHydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inLogin = (segments as string[]).includes("login");

  if (!isAuthenticated && !inLogin) {
    return <Redirect href="/(customer)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Sign in", headerShown: true }} />
      <Stack.Screen
        name="addresses"
        options={{ title: "Addresses", headerShown: true }}
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
