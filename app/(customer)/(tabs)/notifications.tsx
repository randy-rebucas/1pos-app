import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { InboxNotification } from "@/lib/types/laundry";
import { fetchNotifications } from "@/lib/api/laundry-repository";
import { useApiHeaders } from "@/hooks/use-api-headers";
import { ApiError } from "@/lib/api/client";
import { Card } from "@/components/laundry/card";
import { colors, spacing } from "@/lib/theme";

export default function NotificationsScreen() {
  const headers = useApiHeaders();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchNotifications(headers);
      setItems(list);
    } catch (e) {
      setItems([]);
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

  return (
    <View style={styles.screen}>
      <Text style={styles.meta}>GET /notifications</Text>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {error ? "" : "No notifications from the API."}
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, !item.read && styles.unread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </Card>
        )}
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
  card: {},
  unread: { borderColor: colors.primary },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  body: { marginTop: spacing.xs, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  date: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: spacing.xl },
});
