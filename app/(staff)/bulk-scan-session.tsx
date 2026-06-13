import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Screen, useScreenKeyboardOffset } from "@/components/ui/screen";
import { StatsBar } from "@/components/scan/StatsBar";
import { ScannerPanel } from "@/components/scan/ScannerPanel";
import { ProductForm, type ProductFormHandle, type ProductFormValues } from "@/components/scan/ProductForm";
import { ActionBar } from "@/components/scan/ActionBar";
import { colors } from "@/lib/theme";
import { useStaffScanHeaders } from "@/hooks/use-staff-scan-headers";
import {
  fetchScanSession,
  fetchProductsList,
  lookupByBarcode,
  scanUpdateProduct,
  logScanSession,
  fetchCategories,
  indexProductsById,
} from "@/lib/api/scan-api";
import type { ProductData } from "@/lib/api/scan-api";
import { uploadProductImage } from "@/lib/api/upload-api";
import {
  loadSession,
  saveSession,
  clearSession,
  makeSessionId,
  type ScanMode,
  type SessionFilter,
  type ScanSessionStats,
} from "@/lib/context/scan-session-store";

const EMPTY_FORM: ProductFormValues = {
  barcode: "",
  name: "",
  sku: "",
  price: "",
  stock: "",
  categoryId: "",
  imageUri: "",
  notes: "",
};

function productToForm(p: ProductData): ProductFormValues {
  return {
    barcode: p.barcode ?? "",
    name: p.name ?? "",
    sku: p.sku ?? "",
    price: p.price != null ? String(p.price) : "",
    stock: p.stock != null ? String(p.stock) : "",
    categoryId: p.categoryId ?? "",
    imageUri: p.image ?? "",
    notes: p.description ?? "",
  };
}

export default function BulkScanSessionScreen() {
  const params = useLocalSearchParams<{ mode: string; filter: string }>();
  const mode = (params.mode ?? "barcode") as ScanMode;
  const filter = (params.filter ?? "all") as SessionFilter;
  const keyboardOffset = useScreenKeyboardOffset();

  const headers = useStaffScanHeaders();
  const sessionIdRef = useRef<string>("");
  const productMapRef = useRef<Map<string, ProductData>>(new Map());
  const formRef = useRef<ProductFormHandle>(null);

  const [productIds, setProductIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ScanSessionStats>({ done: 0, skipped: 0, errors: 0 });
  const [formValues, setFormValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session or resume
  useEffect(() => {
    void bootstrap();
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function bootstrap() {
    try {
      const persisted = await loadSession();
      if (persisted) {
        const resume = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Resume Session?",
            `You have an unfinished session (${persisted.stats.done} done, ${persisted.stats.skipped} skipped). Resume?`,
            [
              { text: "Start New", onPress: () => resolve(false) },
              { text: "Resume", style: "default", onPress: () => resolve(true) },
            ],
          );
        });
        if (resume) {
          const products = await fetchProductsList(headers, filter);
          productMapRef.current = indexProductsById(products);
          setProductIds(persisted.productIds);
          setCurrentIndex(persisted.currentIndex);
          setTotal(persisted.total);
          setStats(persisted.stats);
          sessionIdRef.current = persisted.sessionId?.trim() || makeSessionId();
          loadCurrentProduct(persisted.productIds, persisted.currentIndex);
          setLoading(false);
          return;
        }
      }
      await startNewSession();
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  async function startNewSession() {
    const [data, products] = await Promise.all([
      fetchScanSession(headers, filter),
      fetchProductsList(headers, filter),
    ]);
    productMapRef.current = indexProductsById(products);
    setProductIds(data.productIds);
    setTotal(data.total);
    setCurrentIndex(0);
    setStats({ done: 0, skipped: 0, errors: 0 });
    sessionIdRef.current = data.sessionId || makeSessionId();
    await saveSession({
      sessionId: data.sessionId,
      scanMode: mode,
      filter,
      productIds: data.productIds,
      currentIndex: 0,
      total: data.total,
      stats: { done: 0, skipped: 0, errors: 0 },
      startedAt: new Date().toISOString(),
    });
    if (data.productIds.length > 0) {
      loadCurrentProduct(data.productIds, 0);
    }
    setLoading(false);
  }

  async function loadCategories() {
    try {
      const cats = await fetchCategories(headers);
      setCategories(cats);
    } catch {
      // Non-fatal; categories will just be empty
    }
  }

  function loadCurrentProduct(ids: string[], index: number) {
    if (index >= ids.length) return;
    const product = productMapRef.current.get(ids[index]);
    setFormValues(product ? productToForm(product) : EMPTY_FORM);
  }

  async function handleImageUpload(uri: string): Promise<string> {
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      return uri;
    }
    return uploadProductImage(headers, uri);
  }

  function handleScanned(code: string) {
    setFormValues((prev) => ({ ...prev, barcode: code }));
    formRef.current?.focusBarcode();
    void lookupByBarcode(headers, code).then((found) => {
      if (found) {
        setFormValues(productToForm({ ...found, barcode: code }));
        formRef.current?.focusBarcode();
      }
    });
  }

  function handleFieldChange(field: keyof ProductFormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  const advance = useCallback(
    async (newStats: ScanSessionStats, newIndex: number, ids: string[]) => {
      if (newIndex >= ids.length) {
        await clearSession();
        try {
          await logScanSession(headers, sessionIdRef.current, newStats);
        } catch {
          // Audit log is best-effort; don't block completion.
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.replace({ pathname: "/(staff)/bulk-scan-done" as any, params: { done: String(newStats.done), skipped: String(newStats.skipped), errors: String(newStats.errors), total: String(ids.length) } });
        return;
      }
      setCurrentIndex(newIndex);
      setStats(newStats);
      await saveSession({
        sessionId: sessionIdRef.current,
        scanMode: mode,
        filter,
        productIds: ids,
        currentIndex: newIndex,
        total: ids.length,
        stats: newStats,
        startedAt: new Date().toISOString(),
      });
      await loadCurrentProduct(ids, newIndex);
    },
    [headers, mode, filter],
  );

  async function handleSave() {
    if (!formValues.name.trim()) {
      Alert.alert("Required", "Product title is required.");
      return;
    }
    setSaving(true);
    const id = productIds[currentIndex];
    try {
      let image = formValues.imageUri || undefined;
      if (
        image &&
        !image.startsWith("http://") &&
        !image.startsWith("https://")
      ) {
        image = await uploadProductImage(headers, image);
      }
      await scanUpdateProduct(headers, id, {
        barcode: formValues.barcode || undefined,
        name: formValues.name.trim(),
        sku: formValues.sku.trim() || undefined,
        price: formValues.price ? parseFloat(formValues.price) : undefined,
        stock: formValues.stock ? parseInt(formValues.stock, 10) : undefined,
        categoryId: formValues.categoryId || undefined,
        image,
        notes: formValues.notes || undefined,
        sessionId: sessionIdRef.current,
      });
      const newStats = { ...stats, done: stats.done + 1 };
      const newIndex = currentIndex + 1;
      await advance(newStats, newIndex, productIds);
    } catch (e) {
      const newStats = { ...stats, errors: stats.errors + 1 };
      setStats(newStats);
      Alert.alert("Save failed", String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    const newStats = { ...stats, skipped: stats.skipped + 1 };
    const newIndex = currentIndex + 1;
    await advance(newStats, newIndex, productIds);
  }

  async function handleDone() {
    Alert.alert("End Session", "End the session now?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Session",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          try {
            await logScanSession(headers, sessionIdRef.current, stats);
          } catch {
            // Audit log is best-effort; don't block completion.
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.replace({ pathname: "/(staff)/bulk-scan-done" as any, params: { done: String(stats.done), skipped: String(stats.skipped), errors: String(stats.errors), total: String(total) } });
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Screen contentStyle={styles.centered}>
        <Text style={styles.loadingText}>Loading products…</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen contentStyle={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </Screen>
    );
  }

  if (total === 0) {
    return (
      <Screen contentStyle={styles.centered}>
        <Text style={styles.emptyText}>No products match the selected filter.</Text>
      </Screen>
    );
  }

  const isLast = currentIndex === productIds.length - 1;

  return (
    <Screen>
      <StatsBar stats={stats} currentIndex={currentIndex} total={total} />
      <ScannerPanel mode={mode} onScanned={handleScanned} active={!saving} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View style={styles.formHeader}>
          <Text style={styles.formHeaderText}>Product {currentIndex + 1} of {total}</Text>
        </View>
        <ProductForm
          ref={formRef}
          values={formValues}
          onChange={handleFieldChange}
          categories={categories}
          onImageUpload={handleImageUpload}
          barcodeFocusKey={currentIndex}
        />
        <ActionBar
          onSkip={handleSkip}
          onSave={handleSave}
          onDone={handleDone}
          saving={saving}
          isLast={isLast}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: { fontSize: 16, color: colors.textMuted },
  errorText: { fontSize: 14, color: colors.danger },
  emptyText: { fontSize: 14, color: colors.textMuted },
  formHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
