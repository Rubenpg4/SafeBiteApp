import { useProductHistory } from "@/contexts/productHistory";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const hasScanned = useRef(false);
  const insets = useSafeAreaInsets();

  // Usar el contexto de historial para la lógica de negocio
  const { scanAndAddProduct } = useProductHistory();

  // Handler cuando se detecta un código de barras
  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    // Evitar múltiples escaneos
    if (hasScanned.current || isScanning) return;
    hasScanned.current = true;
    setIsScanning(true);

    try {
      console.log(`Código de barras detectado: ${data}`);

      // Usar la lógica centralizada del contexto:
      // 1. Llama a API
      // 2. Compara alérgenos user vs producto
      // 3. Guarda en historial
      const product = await scanAndAddProduct(data);

      if (product) {
        if (product.isSafe) {
          // ES SEGURO -> Pantalla verde (Safe)
          router.push({
            pathname: "/safe_screen",
            params: {
              productName: product.name,
              productBrand: product.brand,
              productImage: product.imageUrl || "",
              ingredients: product.ingredients || "Sin información",
              // Pasar alérgenos formateados como string
              allergens: JSON.stringify(product.allergens),
              barcode: data,
            },
          });
        } else {
          // PELIGRO -> Pantalla roja (Danger)
          // Encontramos alérgenos coincidentes
          router.push({
            pathname: "/danger_screen",
            params: {
              productName: product.name,
              productBrand: product.brand,
              productImage: product.imageUrl || "",
              ingredients: product.ingredients || "Sin información",
              // Pasar los alérgenos que causaron el peligro
              matchedAllergens: JSON.stringify(product.matchedAllergens),
              barcode: data,
            },
          });
        }
      } else {
        // Producto no encontrado o error en API
        Alert.alert(
          "Producto no encontrado",
          "No pudimos encontrar información de este producto.",
          [
            {
              text: "OK", onPress: () => {
                hasScanned.current = false;
                setIsScanning(false);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error al procesar el producto.");
      hasScanned.current = false;
      setIsScanning(false);
    }
  };

  // Permisos de cámara aún cargando
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando cámara...</Text>
      </View>
    );
  }

  // Permisos de cámara no otorgados
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
          <Text style={styles.permissionMessage}>
            Necesitamos acceso a tu cámara para escanear los productos y
            detectar alérgenos.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Camera sin children */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        onBarcodeScanned={isScanning ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
          ],
        }}
      />

      {/* Overlay UI con posicionamiento absoluto */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        {/* Header con botón de volver */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escanear producto</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Área central con marco de escaneo */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          {isScanning ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Buscando producto...</Text>
            </View>
          ) : (
            <Text style={styles.scanInstructions}>
              Apunta al código de barras del producto
            </Text>
          )}
        </View>

        {/* Controles inferiores */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}
          >
            <MaterialCommunityIcons name="camera-flip" size={32} color="#fff" />
            <Text style={styles.controlLabel}>Girar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#4CAF50",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanInstructions: {
    color: "#fff",
    fontSize: 16,
    marginTop: 30,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingOverlay: {
    marginTop: 30,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  controlButton: {
    alignItems: "center",
    padding: 15,
  },
  controlButtonText: {
    fontSize: 28,
  },
  controlLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  // Estilos para la pantalla de permisos
  permissionContainer: {
    padding: 30,
    alignItems: "center",
    maxWidth: 320,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionMessage: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 16,
  },
});
