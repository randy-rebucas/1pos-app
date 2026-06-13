import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  fetchRetailStores,
  storeFromSlug,
} from "@/lib/api/staff-repository";
import { ApiError } from "@/lib/api/client";
import { useStaffScan } from "@/lib/context/staff-scan-context";
import type { StoreOption } from "@/lib/types/staff";
import { Card } from "@/components/ui/card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Screen } from "@/components/ui/screen";
import { colors, spacing } from "@/lib/theme";

export default function StoreSelectScreen() {
  const router = useRouter();
  const { selectStore } = useStaffScan();
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [search, setSearch] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [listUnavailable, setListUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (term?: string) => {
    setLoading(true);
    setError(null);
    setListUnavailable(false);
    try {
      const page = await fetchRetailStores({
        search: term?.trim() || undefined,
        page: 1,
        limit: 50,
      });
      setStores(page.stores);
      if (page.stores.length === 0) {
        setError("No retail stores found.");
      }
    } catch (e) {
      setStores([]);
      if (e instanceof ApiError && e.status === 401) {
        setListUnavailable(true);
        setError(
          "Store directory is blocked by the server (401). Enter your store slug below to continue.",
        );
      } else {
        setError(e instanceof ApiError ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function proceed(store: StoreOption) {
    setBusyId(store.id);
    try {
      await selectStore(store);
      router.push("/(staff)/login" as never);
    } finally {
      setBusyId(null);
    }
  }

  async function onManualContinue() {
    const store = storeFromSlug(manualSlug);
    if (!store) {
      setError("Enter your store slug (e.g. my-retail-store).");
      return;
    }
    setError(null);
    await proceed(store);
  }

  return (
    <Screen keyboard contentStyle={styles.container}>
        <Text style={styles.title}>Select store</Text>
        <Text style={styles.sub}>
          Choose your retail location, then start scanning.
        </Text>

        {!listUnavailable ? (
          <>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search stores…"
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => void load(search)}
            />
            {error ? <Text style={styles.err}>{error}</Text> : null}
            {loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={stores}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => void proceed(item)}
                    disabled={busyId === item.id}
                  >
                    <Card style={styles.storeCard}>
                      <Text style={styles.storeName}>{item.storeName}</Text>
                      <Text style={styles.branchName}>{item.name}</Text>
                      {item.address ? (
                        <Text style={styles.storeMeta}>{item.address}</Text>
                      ) : null}
                      {busyId === item.id ? (
                        <ActivityIndicator
                          color={colors.primary}
                          style={styles.cardLoader}
                        />
                      ) : null}
                    </Card>
                  </Pressable>
                )}
                ListEmptyComponent={
                  !loading && !error ? (
                    <Text style={styles.empty}>No stores available.</Text>
                  ) : null
                }
              />
            )}
            <PrimaryButton
              title="Search"
              variant="secondary"
              onPress={() => void load(search)}
              loading={loading}
            />
          </>
        ) : null}

        <Card style={styles.manualCard}>
          <Text style={styles.manualTitle}>
            {listUnavailable ? "Enter store slug" : "Or enter store slug"}
          </Text>
          <Text style={styles.manualSub}>
            Your store slug is the URL segment after your domain (e.g.{" "}
            <Text style={styles.slugExample}>my-store</Text> in{" "}
            1pos.app/my-store).
          </Text>
          {listUnavailable && error ? (
            <Text style={styles.warn}>{error}</Text>
          ) : null}
          <TextInput
            value={manualSlug}
            onChangeText={setManualSlug}
            placeholder="my-retail-store"
            style={styles.search}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => void onManualContinue()}
          />
          <PrimaryButton
            title="Continue to scanner"
            onPress={() => void onManualContinue()}
            loading={busyId != null}
            disabled={!manualSlug.trim()}
          />
          {listUnavailable ? (
            <Pressable onPress={() => void load(search)} style={styles.retry}>
              <Text style={styles.retryText}>Retry store directory</Text>
            </Pressable>
          ) : null}
        </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  err: { color: colors.danger, marginBottom: spacing.md, fontSize: 13 },
  warn: {
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontSize: 13,
    lineHeight: 18,
  },
  loader: { marginTop: spacing.xl },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  storeCard: { marginBottom: spacing.sm },
  storeName: { fontSize: 17, fontWeight: "700", color: colors.text },
  branchName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  storeMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardLoader: { marginTop: spacing.sm },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginVertical: spacing.xl,
  },
  manualCard: { marginTop: spacing.md },
  manualTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  manualSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  slugExample: { fontWeight: "700", color: colors.text },
  retry: { marginTop: spacing.md, alignItems: "center" },
  retryText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
