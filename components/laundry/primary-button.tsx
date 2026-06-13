import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "@/lib/theme";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...rest
}: Props) {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.labelOnPrimary,
            isGhost && styles.labelGhost,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.92 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  labelOnPrimary: { color: "#FFFFFF" },
  labelGhost: { color: colors.primary },
});
