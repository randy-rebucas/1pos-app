import { useHeaderHeight } from "@react-navigation/elements";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

export type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Stack header is shown — skip top safe inset (default true). */
  withHeader?: boolean;
  keyboard?: boolean;
  scroll?: boolean;
  scrollContentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
};

/** Offset for nested KeyboardAvoidingView when a stack header is visible. */
export function useScreenKeyboardOffset(withHeader = true): number {
  const headerHeight = useHeaderHeight();
  return withHeader ? headerHeight : 0;
}

export function Screen({
  children,
  style,
  contentStyle,
  withHeader = true,
  keyboard = false,
  scroll = false,
  scrollContentStyle,
  edges,
}: ScreenProps) {
  const keyboardOffset = useScreenKeyboardOffset(withHeader);
  const safeEdges =
    edges ?? (withHeader ? (["bottom"] as Edge[]) : (["top", "bottom"] as Edge[]));

  let body: ReactNode = (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  if (scroll) {
    body = (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  if (keyboard) {
    body = (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]} edges={safeEdges}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
