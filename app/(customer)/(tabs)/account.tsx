import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSession } from "@/lib/context/session-context";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { Screen } from "@/components/laundry/screen";
import { colors, spacing } from "@/lib/theme";

export default function CustomerAccountScreen() {
  const { session, token, signOut } = useSession();

  return (
    <Screen edges={["bottom"]}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.sub}>
        Auth, addresses, and wallet integrate with your POS tenant APIs.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Session</Text>
        {session ? (
          <>
            <Text style={styles.name}>{session.displayName}</Text>
            <Text style={styles.role}>Role: {session.role}</Text>
            <Text style={styles.token} numberOfLines={1}>
              Token: {token ?? "—"}
            </Text>
          </>
        ) : (
          <Text style={styles.body}>Not signed in</Text>
        )}
      </Card>

      <Link href="/(customer)/addresses" asChild>
        <PrimaryButton title="Manage addresses" variant="secondary" />
      </Link>
      <Link href="/(customer)/login" asChild>
        <PrimaryButton
          title={session ? "Re-verify (OTP)" : "Sign in"}
          variant="ghost"
          style={styles.gap}
        />
      </Link>

      <Card style={[styles.card, styles.gap]}>
        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.body}>
          Balance: PHP 0 · top-up via POST /payments when your backend exposes it.
        </Text>
      </Card>

      <View style={styles.footer}>
        {session ? (
          <PrimaryButton
            title="Sign out"
            variant="secondary"
            onPress={() => void signOut()}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: spacing.md },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 20 },
  card: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginBottom: spacing.xs },
  name: { fontSize: 18, fontWeight: "700", color: colors.text },
  role: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  token: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
  gap: { marginTop: spacing.md },
  footer: { marginTop: "auto", marginBottom: spacing.lg },
});
