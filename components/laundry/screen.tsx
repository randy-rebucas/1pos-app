import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  edges?: ("top" | "bottom")[];
  style?: object;
};

export function Screen({ children, style, edges = ["top", "bottom"] }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.md },
});
