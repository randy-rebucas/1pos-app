import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useStaffScan } from "@/lib/context/staff-scan-context";
import { Screen } from "@/components/ui/screen";
import { colors, spacing, radius } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { selectedStore, signInWithPassword } = useStaffScan();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenantSlug = selectedStore?.tenantSlug ?? "";

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!tenantSlug) {
      setError("No store selected. Go back and select a store first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword({ email: email.trim(), password, tenantSlug });
      router.replace("/(staff)/bulk-scan-select" as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen keyboard scroll scrollContentStyle={styles.scroll}>
          <View style={styles.header}>
            <Ionicons name="scan-circle" size={56} color={colors.primary} />
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Use your store email and password
            </Text>
            {tenantSlug ? (
              <Text style={styles.storeName}>
                {selectedStore?.storeName ?? tenantSlug}
              </Text>
            ) : null}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@store.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in" size={20} color="#fff" />
                <Text style={styles.loginText}>Sign in</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            disabled={loading}
          >
          <Text style={styles.backText}>← Change store</Text>
        </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  storeName: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fff0f0",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: { marginTop: spacing.lg, alignItems: "center" },
  backText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
});
