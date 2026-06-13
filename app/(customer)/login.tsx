import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useSession } from "@/lib/context/session-context";
import { requestOtp, verifyOtp } from "@/lib/api/laundry-repository";
import { useApiHeaders } from "@/hooks/use-api-headers";
import { ApiError } from "@/lib/api/client";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { Card } from "@/components/laundry/card";
import { colors, spacing } from "@/lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const headers = useApiHeaders();
  const { signInCustomer } = useSession();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    setBusy(true);
    setError(null);
    try {
      await requestOtp(headers, "sms", phone.trim());
      setStep("code");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const { token, displayName, userId } = await verifyOtp(
        headers,
        phone.trim(),
        code.trim(),
      );
      await signInCustomer(displayName, token, userId);
      router.replace("/(customer)/(tabs)");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.sub}>
        POST /auth/otp/request · POST /auth/otp/verify
      </Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <Card>
        {step === "phone" ? (
          <>
            <Text style={styles.label}>Mobile or email</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="+639…"
            />
            <PrimaryButton
              title="Send code"
              loading={busy}
              onPress={sendOtp}
              disabled={!phone.trim()}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter code</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
              style={styles.input}
              placeholder="OTP"
            />
            <PrimaryButton
              title="Verify & continue"
              loading={busy}
              onPress={verify}
              disabled={!code.trim()}
            />
            <PrimaryButton
              title="Back"
              variant="ghost"
              onPress={() => {
                setStep("phone");
                setError(null);
              }}
              style={styles.back}
            />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg },
  err: { color: colors.danger, marginBottom: spacing.md, fontSize: 13 },
  label: { fontWeight: "700", color: colors.textMuted, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  back: { marginTop: spacing.sm },
});
