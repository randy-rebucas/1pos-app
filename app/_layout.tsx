import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProviders } from "@/lib/context/app-providers";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </SafeAreaProvider>
  );
}
