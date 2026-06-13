import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "@/lib/theme";

export interface ProductFormValues {
  barcode: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUri: string;
  notes: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  values: ProductFormValues;
  onChange: (field: keyof ProductFormValues, value: string) => void;
  categories: Category[];
  uploading?: boolean;
  onImageUpload?: (uri: string) => Promise<string>;
}

export function ProductForm({
  values,
  onChange,
  categories,
  uploading = false,
  onImageUpload,
}: ProductFormProps) {
  async function pickImage() {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      onChange("imageUri", uri);
      if (onImageUpload) {
        const uploadedUrl = await onImageUpload(uri);
        onChange("imageUri", uploadedUrl);
      }
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Field label="Barcode / QR Code">
        <TextInput
          style={styles.input}
          value={values.barcode}
          onChangeText={(v) => onChange("barcode", v)}
          placeholder="Scanned or manual entry"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />
      </Field>

      <Field label="Product Title *">
        <TextInput
          style={styles.input}
          value={values.name}
          onChangeText={(v) => onChange("name", v)}
          placeholder="Product name"
          placeholderTextColor={colors.textMuted}
        />
      </Field>

      <Field label="SKU">
        <TextInput
          style={styles.input}
          value={values.sku}
          onChangeText={(v) => onChange("sku", v)}
          placeholder="Leave blank to auto-generate"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
        />
      </Field>

      <View style={styles.row}>
        <View style={styles.half}>
          <Field label="Price">
            <TextInput
              style={styles.input}
              value={values.price}
              onChangeText={(v) => onChange("price", v)}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </Field>
        </View>
        <View style={styles.half}>
          <Field label="Stock">
            <TextInput
              style={styles.input}
              value={values.stock}
              onChangeText={(v) => onChange("stock", v)}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </Field>
        </View>
      </View>

      {categories.length > 0 && (
        <Field label="Category">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[styles.catChip, values.categoryId === cat._id && styles.catChipActive]}
                onPress={() => onChange("categoryId", cat._id)}
              >
                <Text style={[styles.catChipText, values.categoryId === cat._id && styles.catChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Field>
      )}

      <Field label="Photo">
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage} disabled={uploading}>
          {values.imageUri ? (
            <Image source={{ uri: values.imageUri }} style={styles.preview} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="camera" size={28} color={colors.textMuted} />
                  <Text style={styles.photoHint}>Take photo</Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Field>

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.multiline]}
          value={values.notes}
          onChangeText={(v) => onChange("notes", v)}
          placeholder="Optional notes"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />
      </Field>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  catScroll: { flexGrow: 0 },
  catChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  catChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  catChipText: { fontSize: 13, color: colors.text },
  catChipTextActive: { color: "#fff", fontWeight: "700" },
  photoBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  preview: { width: "100%", height: 160 },
  photoPlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  photoHint: { fontSize: 13, color: colors.textMuted },
});
