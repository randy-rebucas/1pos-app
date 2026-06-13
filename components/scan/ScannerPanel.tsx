import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import type { ScanMode } from "@/lib/context/scan-session-store";

interface ScannerPanelProps {
  mode: ScanMode;
  onScanned: (code: string) => void;
  /** When false, ignore scans (e.g. while saving). */
  active?: boolean;
}

const DUPLICATE_MS = 800;

export function ScannerPanel({ mode, onScanned, active = true }: ScannerPanelProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastCaptureRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    if (active) {
      lastCaptureRef.current = null;
    }
  }, [active]);

  if (!permission) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.permissionText}>Camera access is required to scan barcodes.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const barcodeTypes =
    mode === "qr"
      ? ["qr" as const]
      : ["ean13" as const, "ean8" as const, "code128" as const, "code39" as const, "upc_a" as const, "upc_e" as const];

  function handleBarcode({ data }: { data: string }) {
    if (!active) return;
    const code = data.trim();
    if (!code) return;

    const now = Date.now();
    const last = lastCaptureRef.current;
    if (last && last.code === code && now - last.at < DUPLICATE_MS) {
      return;
    }

    lastCaptureRef.current = { code, at: now };
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScanned(code);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        autofocus="on"
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={active ? handleBarcode : undefined}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.reticle}>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </View>
        <Text style={styles.hint}>
          {active
            ? `Align ${mode === "qr" ? "QR code" : "barcode"} in frame — auto capture`
            : "Processing…"}
        </Text>
      </View>
    </View>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const isTop = pos.startsWith("t");
  const isLeft = pos.endsWith("l");
  return (
    <View
      style={[
        styles.corner,
        isTop ? styles.cornerTop : styles.cornerBottom,
        isLeft ? styles.cornerLeft : styles.cornerRight,
      ]}
    />
  );
}

const CORNER = 20;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: {
    height: 220,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  placeholder: {
    height: 220,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  reticle: {
    width: 200,
    height: 120,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#fff",
  },
  cornerTop: { top: 0, borderTopWidth: CORNER_W },
  cornerBottom: { bottom: 0, borderBottomWidth: CORNER_W },
  cornerLeft: { left: 0, borderLeftWidth: CORNER_W },
  cornerRight: { right: 0, borderRightWidth: CORNER_W },
  hint: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.md,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  permissionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  permissionBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
