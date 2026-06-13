import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "@/lib/theme";
import type { ScanMode } from "@/lib/context/scan-session-store";

interface ScannerPanelProps {
  mode: ScanMode;
  onScanned: (code: string) => void;
  paused?: boolean;
}

export function ScannerPanel({ mode, onScanned, paused = false }: ScannerPanelProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastCode, setLastCode] = useState<string | null>(null);
  const cooldownRef = useRef(false);

  // Reset cooldown when paused is cleared (user moved to next product)
  useEffect(() => {
    if (!paused) {
      cooldownRef.current = false;
      setLastCode(null);
    }
  }, [paused]);

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
    if (paused || cooldownRef.current || data === lastCode) return;
    cooldownRef.current = true;
    setLastCode(data);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScanned(data);
    // Allow re-scan after 2.5s if still on same product
    setTimeout(() => { cooldownRef.current = false; }, 2500);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={paused ? undefined : handleBarcode}
      >
        <View style={styles.overlay}>
          <View style={styles.reticle}>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </View>
          <Text style={styles.hint}>
            {paused ? "Scan captured" : `Point camera at ${mode === "qr" ? "QR code" : "barcode"}`}
          </Text>
        </View>
      </CameraView>
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
  container: { height: 220 },
  placeholder: {
    height: 220,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
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
