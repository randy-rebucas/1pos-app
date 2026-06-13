import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import type { CustomerAddress } from "@/lib/types/laundry";
import {
  createAddressRequest,
  fetchAddresses,
} from "@/lib/api/laundry-repository";
import { useApiHeaders } from "@/hooks/use-api-headers";
import { ApiError } from "@/lib/api/client";
import { Card } from "@/components/laundry/card";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { colors, spacing } from "@/lib/theme";

export default function AddressesScreen() {
  const router = useRouter();
  const headers = useApiHeaders();
  const [rows, setRows] = useState<CustomerAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchAddresses(headers);
      setRows(list);
    } catch (e) {
      setRows([]);
      setError(e instanceof ApiError ? e.message : String(e));
    }
  }, [headers]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function addAddress() {
    if (!label.trim() || !line1.trim() || !city.trim()) return;
    setSaveError(null);
    try {
      const created = await createAddressRequest(headers, {
        label: label.trim(),
        line1: line1.trim(),
        city: city.trim(),
        isDefault: rows.length === 0,
      });
      setRows((prev) => [...prev, created]);
      setLabel("");
      setLine1("");
      setCity("");
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : String(e));
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.meta}>GET/POST /customers/me/addresses</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      {saveError ? <Text style={styles.err}>{saveError}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(a) => a.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Card style={styles.form}>
            <Text style={styles.section}>Add address</Text>
            <TextInput
              placeholder="Label (Home, Work)"
              value={label}
              onChangeText={setLabel}
              style={styles.input}
            />
            <TextInput
              placeholder="Street / building"
              value={line1}
              onChangeText={setLine1}
              style={styles.input}
            />
            <TextInput
              placeholder="City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />
            <PrimaryButton title="Save address" onPress={addAddress} />
          </Card>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {error ? "" : "No addresses from the API."}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.label}>
              {item.label}
              {item.isDefault ? " · Default" : ""}
            </Text>
            <Text style={styles.line}>{item.line1}</Text>
            <Text style={styles.line}>{item.city}</Text>
          </Card>
        )}
        ListFooterComponent={
          <PrimaryButton title="Close" variant="ghost" onPress={() => router.back()} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  meta: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
  },
  err: {
    paddingHorizontal: spacing.md,
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  list: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  form: { marginBottom: spacing.md },
  section: {
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  card: {},
  label: { fontSize: 16, fontWeight: "700", color: colors.text },
  line: { marginTop: spacing.xs, color: colors.textMuted },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: spacing.md },
});
