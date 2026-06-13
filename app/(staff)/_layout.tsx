import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function StaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Staff" }} />
      <Stack.Screen name="rider" options={{ title: "Rider" }} />
      <Stack.Screen name="plant" options={{ title: "Plant" }} />
      <Stack.Screen name="admin" options={{ title: "Admin" }} />
    </Stack>
  );
}
