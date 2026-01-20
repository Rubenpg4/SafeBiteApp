import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoHistoryIcon, ScannerIcon } from '@/components/icons';
import { HistoryList } from '@/components/product';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { useAuth } from '@/contexts/auth';
import { useProductHistory } from '@/contexts/productHistory';
import { Product } from '@/types';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { products, isLoading } = useProductHistory();
  const insets = useSafeAreaInsets();
  const [showAllProducts, setShowAllProducts] = useState(true);
  // Estado para pruebas: alternar entre empty state y mock data
  const [devShowMock, setDevShowMock] = useState(false);

  const colors = Colors['light'];

  // Obtener el primer nombre del usuario
  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Próximamente', message);
    }
  };

  const handleSearch = () => {
    showToast('Búsqueda próximamente');
  };

  const handleSettings = () => {
    Alert.alert(
      'Ajustes',
      '¿Qué deseas hacer?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La redirección al login se maneja automáticamente en _layout.tsx
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleScan = () => {
    showToast('Escanear código de barras próximamente');
  };

  const handleProductPress = (product: Product) => {
    // TODO: Navegar a pantalla de detalle del producto
    showToast(`Ver detalles de: ${product.name}`);
  };

  // Componente para estado vacío
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <NoHistoryIcon size={60} color={Colors.light.background} />
      </View>

      <Text style={styles.emptyTitle}>Sin historial aún</Text>
      <Text style={styles.emptyDescription}>
        Los productos que escanees{'\n'}
        aparecerán aquí para un acceso{'\n'}
        rápido
      </Text>
    </View>
  );

  // Filtrar productos: si el switch está OFF, mostrar solo los aptos (verdes)
  const filteredProducts = showAllProducts
    ? products
    : products.filter(p => p.isSafe);

  // Determina si mostrar la lista o el estado vacío
  // En modo dev, usamos devShowMock para alternar manualmente
  const hasProducts = devShowMock && filteredProducts.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Bienvenido,</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Línea separadora verde */}
      <View style={styles.divider} />

      {/* Sección de últimas detecciones */}
      <View style={styles.detectionsHeader}>
        <Text style={styles.detectionsTitle}>Últimas detecciones</Text>
        <Switch
          value={showAllProducts}
          onValueChange={setShowAllProducts}
          trackColor={{ false: '#D1D1D6', true: colors.success }}
          thumbColor={colors.white}
          ios_backgroundColor="#D1D1D6"
        />
      </View>

      {/* Contenido: Lista de productos o estado vacío */}
      {hasProducts ? (
        <HistoryList
          products={filteredProducts}
          onProductPress={handleProductPress}
          ListEmptyComponent={<EmptyState />}
        />
      ) : (
        <EmptyState />
      )}

      {/* Botón flotante de escanear */}
      <TouchableOpacity
        style={[styles.scanButton, { bottom: insets.bottom + 24 }]}
        onPress={handleScan}
        activeOpacity={0.8}
      >
        <ScannerIcon size={32} color={Colors.light.white} />
      </TouchableOpacity>

      {/* Botón de desarrollo para alternar entre empty state y mock data */}
      <TouchableOpacity
        style={[styles.devButton, { bottom: insets.bottom + 24 }]}
        onPress={() => setDevShowMock(!devShowMock)}
        activeOpacity={0.8}
      >
        <Ionicons name="construct" size={16} color={Colors.light.white} />
        <Text style={styles.devButtonText}>
          {devShowMock ? 'Mock' : 'Empty'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontFamily: FontFamily.montserrat.bold,
    fontSize: FontSize.xxl,
    color: Colors.light.success,
    lineHeight: 40,
  },
  userName: {
    fontFamily: FontFamily.montserrat.bold,
    fontSize: FontSize.xxl,
    color: Colors.light.success,
    lineHeight: 40,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 3,
    backgroundColor: Colors.light.success,
    marginLeft: Spacing.lg,
    marginRight: Spacing.xxl * 3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: 2,
  },
  detectionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  detectionsTitle: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  // Estilos del Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: -Spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: FontFamily.montserrat.bold,
    fontSize: FontSize.xl,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Estilos del botón de escanear
  scanButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  // Botón de desarrollo para pruebas
  devButton: {
    position: 'absolute',
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FF6B6B',
    opacity: 0.9,
  },
  devButtonText: {
    fontFamily: FontFamily.inter.semibold,
    fontSize: 10,
    color: Colors.light.white,
  },
  // Estilos del Hidden State
  hiddenStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenStateText: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
});