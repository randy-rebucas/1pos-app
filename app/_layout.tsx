import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AppProviders } from "@/lib/context/app-providers";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppProviders>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
