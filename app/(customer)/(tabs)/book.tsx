import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { CatalogService, PickupSlot } from "@/lib/types/laundry";
import { useOrders } from "@/lib/context/orders-context";
import { useCatalog } from "@/lib/context/catalog-context";
import { useTenant } from "@/lib/context/tenant-context";
import { useApiHeaders } from "@/hooks/use-api-headers";
import {
  fetchPickupSlots,
  fetchPricingQuote,
  reservePickupSchedule,
} from "@/lib/api/laundry-repository";
import { ApiError } from "@/lib/api/client";
import { PrimaryButton } from "@/components/laundry/primary-button";
import { Card } from "@/components/laundry/card";
import { colors, spacing } from "@/lib/theme";

export default function BookScreen() {
  const router = useRouter();
  const { branchId } = useTenant();
  const headers = useApiHeaders();
  const {
    services,
    addons,
    loading: catalogLoading,
    error: catalogError,
  } = useCatalog();
  const { createOrder } = useOrders();
  const [service, setService] = useState<CatalogService | null>(null);
  const [kg, setKg] = useState("6");
  const [items, setItems] = useState("4");
  const [addonIds, setAddonIds] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [pickupWindow, setPickupWindow] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [quote, setQuote] = useState<{
    subtotal: number;
    addons: number;
    total: number;
  } | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!service && services.length > 0) setService(services[0] ?? null);
  }, [service, services]);

  const loadSlots = useCallback(async () => {
    setSlotsError(null);
    const today = new Date().toISOString().slice(0, 10);
    try {
      const list = await fetchPickupSlots(headers, branchId, today);
      setSlots(list);
      if (list.length > 0) {
        setPickupWindow((w) => w || list[0]?.label || "");
        setDeliveryWindow((w) => w || list[1]?.label || list[0]?.label || "");
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : String(e);
      setSlotsError(msg);
      setSlots([]);
    }
  }, [headers, branchId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (!service) return;
    const k = Number(kg) || 0;
    const it = Number(items) || 0;
    let cancelled = false;
    void (async () => {
      try {
        const q = await fetchPricingQuote(headers, {
          serviceId: service.id,
          pricingModel: service.pricingModel,
          kg: service.pricingModel === "per_kg" ? k : undefined,
          itemCount: service.pricingModel === "per_item" ? it : undefined,
          addonIds: [...addonIds],
        });
        if (!cancelled) {
          setQuote(q.total > 0 ? q : null);
          setPricingError(q.total > 0 ? null : "Pricing API returned zero total");
        }
      } catch (e) {
        if (!cancelled) {
          setQuote(null);
          setPricingError(e instanceof ApiError ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [service, kg, items, addonIds, headers]);

  const display = quote ?? { subtotal: 0, addons: 0, total: 0 };

  const canSubmit = useMemo(
    () =>
      Boolean(service) &&
      display.total > 0 &&
      pickupWindow.trim().length > 0 &&
      deliveryWindow.trim().length > 0,
    [service, display.total, pickupWindow, deliveryWindow],
  );

  function toggleAddon(id: string) {
    setAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!service || !canSubmit) return;
    const k = Number(kg) || 0;
    const it = Number(items) || 0;
    setBusy(true);
    setSubmitError(null);
    try {
      await reservePickupSchedule(headers, {
        branchId,
        pickupWindow,
        deliveryWindow,
        serviceId: service.id,
      });
      const order = await createOrder({
        serviceId: service.id,
        serviceType: service.type,
        label: service.label,
        pricingModel: service.pricingModel,
        kg: k,
        itemCount: it,
        addonIds: [...addonIds],
        pickupWindow,
        deliveryWindow,
      });
      router.replace({
        pathname: "/(customer)/(tabs)/orders/[id]",
        params: { id: order.id },
      });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>New booking</Text>
      <Text style={styles.sub}>
        Data from GET /services, GET /pricing, GET /pickup-slots, POST
        /pickup-schedule, POST /orders only.
      </Text>

      {catalogError ? <Text style={styles.err}>{catalogError}</Text> : null}
      {catalogLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : null}
      {slotsError ? <Text style={styles.err}>{slotsError}</Text> : null}
      {pricingError ? <Text style={styles.err}>{pricingError}</Text> : null}
      {submitError ? <Text style={styles.err}>{submitError}</Text> : null}

      <Text style={styles.section}>Service</Text>
      <View style={styles.chips}>
        {services.map((s) => {
          const selected = service?.id === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setService(s)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {services.length === 0 && !catalogLoading ? (
        <Text style={styles.empty}>No services returned from the API.</Text>
      ) : null}
      {service ? (
        <Text style={styles.desc}>{service.description}</Text>
      ) : null}

      <Text style={styles.section}>
        {service?.pricingModel === "per_kg" ? "Estimated weight (kg)" : "Item count"}
      </Text>
      <Card style={styles.inputCard}>
        {service?.pricingModel === "per_kg" ? (
          <TextInput
            value={kg}
            onChangeText={setKg}
            keyboardType="decimal-pad"
            placeholder="e.g. 6"
            style={styles.input}
          />
        ) : (
          <TextInput
            value={items}
            onChangeText={setItems}
            keyboardType="number-pad"
            placeholder="e.g. 4"
            style={styles.input}
          />
        )}
      </Card>

      <Text style={styles.section}>Add-ons</Text>
      {addons.length === 0 ? (
        <Text style={styles.muted}>No add-ons in catalog response.</Text>
      ) : (
        <View style={styles.addons}>
          {addons.map((a) => {
            const on = addonIds.has(a.id);
            return (
              <Pressable
                key={a.id}
                onPress={() => toggleAddon(a.id)}
                style={[styles.addonRow, on && styles.addonRowOn]}
              >
                <Text style={styles.addonLabel}>{a.label}</Text>
                <Text style={styles.addonPrice}>+ PHP {a.price}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.section}>Windows</Text>
      {slots.length > 0 ? (
        <View style={styles.slotWrap}>
          <Text style={styles.slotHead}>Pickup</Text>
          <View style={styles.chips}>
            {slots.slice(0, 8).map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setPickupWindow(s.label)}
                style={[
                  styles.chip,
                  pickupWindow === s.label && styles.chipOn,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    pickupWindow === s.label && styles.chipTextOn,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.slotHead, styles.slotHeadSpaced]}>Delivery</Text>
          <View style={styles.chips}>
            {slots.slice(0, 8).map((s) => (
              <Pressable
                key={`${s.id}-d`}
                onPress={() => setDeliveryWindow(s.label)}
                style={[
                  styles.chip,
                  deliveryWindow === s.label && styles.chipOn,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    deliveryWindow === s.label && styles.chipTextOn,
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <Card style={styles.marginTop}>
        <Text style={styles.slotHead}>Pickup / delivery (API strings)</Text>
        <TextInput
          placeholder="Pickup window"
          value={pickupWindow}
          onChangeText={setPickupWindow}
          style={styles.input}
        />
        <TextInput
          placeholder="Delivery window"
          value={deliveryWindow}
          onChangeText={setDeliveryWindow}
          style={styles.input}
        />
      </Card>

      <Card style={styles.quote}>
        <View style={styles.quoteRow}>
          <Text style={styles.quoteLabel}>Subtotal</Text>
          <Text style={styles.quoteVal}>PHP {display.subtotal}</Text>
        </View>
        <View style={styles.quoteRow}>
          <Text style={styles.quoteLabel}>Add-ons</Text>
          <Text style={styles.quoteVal}>PHP {display.addons}</Text>
        </View>
        <View style={[styles.quoteRow, styles.quoteTotal]}>
          <Text style={styles.totalLabel}>Total (API)</Text>
          <Text style={styles.totalVal}>PHP {display.total}</Text>
        </View>
      </Card>

      <PrimaryButton
        title="Confirm booking"
        loading={busy}
        onPress={submit}
        disabled={!canSubmit}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 18 },
  err: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
  loader: { marginBottom: spacing.md },
  empty: { color: colors.textMuted, marginBottom: spacing.md },
  muted: { color: colors.textMuted, marginBottom: spacing.md },
  section: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: "#E8F4FA" },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  chipTextOn: { color: colors.primaryDark },
  desc: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  inputCard: { padding: 0 },
  input: {
    fontSize: 16,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  addons: { gap: spacing.sm },
  addonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addonRowOn: { borderColor: colors.accent, backgroundColor: "#E8FBF8" },
  addonLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  addonPrice: { fontSize: 14, color: colors.textMuted },
  slotWrap: { marginBottom: spacing.sm },
  slotHead: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  slotHeadSpaced: { marginTop: spacing.md },
  marginTop: { marginTop: spacing.sm },
  quote: { marginTop: spacing.lg },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  quoteTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quoteLabel: { color: colors.textMuted },
  quoteVal: { fontWeight: "600", color: colors.text },
  totalLabel: { fontSize: 16, fontWeight: "800", color: colors.text },
  totalVal: { fontSize: 16, fontWeight: "800", color: colors.primary },
  submit: { marginTop: spacing.lg },
});
