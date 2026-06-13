import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function OrdersStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: "700", color: colors.text },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Orders" }} />
      <Stack.Screen name="[id]" options={{ title: "Order" }} />
      <Stack.Screen name="pay/[orderId]" options={{ title: "Pay" }} />
    </Stack>
  );
}
