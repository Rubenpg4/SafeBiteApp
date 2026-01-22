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

// Tipos para OpenFoodFacts
type OpenFoodFactsProduct = {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  allergens_tags?: string[];
  allergens?: string;
};

type OpenFoodFactsResponse = {
  status: number;
  product?: OpenFoodFactsProduct;
};

// Función para obtener producto de OpenFoodFacts
async function fetchProductFromOpenFoodFacts(
  barcode: string,
): Promise<OpenFoodFactsResponse | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    );
    const data: OpenFoodFactsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from OpenFoodFacts:", error);
    return null;
  }
}

// Mapeo de alérgenos de OpenFoodFacts a iconos
const allergenIconMap: Record<string, string> = {
  "en:milk": "cup",
  "en:gluten": "bread-slice",
  "en:eggs": "egg",
  "en:nuts": "nut",
  "en:peanuts": "peanut",
  "en:soybeans": "soy-sauce",
  "en:fish": "fish",
  "en:crustaceans": "shrimp",
  "en:celery": "leaf",
  "en:mustard": "bottle-tonic",
  "en:sesame-seeds": "seed",
  "en:sulphur-dioxide-and-sulphites": "chemical-weapon",
  "en:lupin": "flower",
  "en:molluscs": "snail",
};

// Mapeo de alérgenos a nombres en español
const allergenLabelMap: Record<string, string> = {
  "en:milk": "Lácteos",
  "en:gluten": "Gluten",
  "en:eggs": "Huevos",
  "en:nuts": "Frutos secos",
  "en:peanuts": "Cacahuetes",
  "en:soybeans": "Soja",
  "en:fish": "Pescado",
  "en:crustaceans": "Crustáceos",
  "en:celery": "Apio",
  "en:mustard": "Mostaza",
  "en:sesame-seeds": "Sésamo",
  "en:sulphur-dioxide-and-sulphites": "Sulfitos",
  "en:lupin": "Altramuces",
  "en:molluscs": "Moluscos",
};

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const hasScanned = useRef(false);
  const insets = useSafeAreaInsets();

  // Handler cuando se detecta un código de barras
  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    // Evitar múltiples escaneos
    if (hasScanned.current || isScanning) return;
    hasScanned.current = true;
    setIsScanning(true);

    console.log(`Código de barras detectado: ${data}`);

    // Obtener producto de OpenFoodFacts
    const result = await fetchProductFromOpenFoodFacts(data);

    if (result && result.status === 1 && result.product) {
      const product = result.product;

      // Procesar alérgenos
      const allergenTags = product.allergens_tags || [];
      const allergens = allergenTags.map((tag) => ({
        id: tag,
        label: allergenLabelMap[tag] || tag.replace("en:", ""),
        icon: allergenIconMap[tag] || "alert-circle",
      }));

      // Siempre navegar a warning_screen para mostrar los alérgenos detectados
      // (No tenemos forma de saber si son peligrosos sin usuario logueado)
      router.push({
        pathname: "/warning_screen",
        params: {
          productName: product.product_name || "Producto desconocido",
          productBrand: product.brands || "Marca desconocida",
          productImage: product.image_front_url || product.image_url || "",
          ingredients:
            product.ingredients_text || "Sin información de ingredientes",
          allergens: JSON.stringify(allergens),
          barcode: data,
        },
      });
    } else {
      // Producto no encontrado
      Alert.alert(
        "Producto no encontrado",
        "Este producto no está registrado en OpenFoodFacts. ¿Deseas escanear otro?",
        [
          {
            text: "Cancelar",
            onPress: () => router.back(),
            style: "cancel",
          },
          {
            text: "Escanear otro",
            onPress: () => {
              hasScanned.current = false;
              setIsScanning(false);
            },
          },
        ],
      );
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
