import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScannerIcon } from '@/components/icons';
import ProductCard from '@/components/product/ProductCard';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { useProductHistory } from '@/contexts/productHistory';
import { Product } from '@/types';

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { searchProducts, isLoading } = useProductHistory();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setHasSearched(true);
        const products = await searchProducts(query);
        setResults(products);
    };

    const handleProductPress = (product: Product) => {
        const params = {
            productName: product.name,
            productBrand: product.brand,
            productImage: product.imageUrl,
            ingredients: product.ingredients,
            barcode: product.barcode,
            allergens: JSON.stringify(product.matchedAllergens || []),
        };

        if (product.isSafe) {
            router.push({
                pathname: '/safe_screen',
                params,
            });
        } else {
            // CHECK FOR MISSING DATA
            if (product.analysisStatus === 'missing_data') {
                router.push({
                    pathname: "/guest_warning_screen",
                    params: {
                        ...params,
                        ingredients: product.ingredients || "No hay información de ingredientes disponible.",
                        allergens: JSON.stringify([{
                            id: 'unknown',
                            label: 'No pudimos verificar los ingredientes de este producto.',
                            icon: 'help-circle'
                        }]),
                        title: "Información\ndesconocida"
                    },
                });
                return;
            }

            router.push({
                pathname: '/danger_screen',
                params,
            });
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleScan = () => {
        router.push('/scan_screen');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header Verde */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={Colors.light.text} />
                </TouchableOpacity>

                <View style={styles.searchBarContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar productos..."
                        placeholderTextColor="#666"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={handleSearch} style={styles.searchIconBtn}>
                            <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Título de Resultados */}
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Resultados de la</Text>
                    <Text style={styles.subtitle}>búsqueda</Text>
                    <View style={styles.titleUnderline} />
                </View>

                <Text style={styles.sectionLabel}>Productos</Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.light.success} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ProductCard
                                product={item}
                                onPress={handleProductPress}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            hasSearched ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No se encontraron productos</Text>
                                </View>
                            ) : null
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Botón flotante de escanear */}
            <TouchableOpacity
                style={[styles.scanButton, { bottom: insets.bottom + 24 }]}
                onPress={handleScan}
                activeOpacity={0.8}
            >
                <ScannerIcon size={32} color={Colors.light.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.success, // Fondo verde superior inicial
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.light.success, // Header verde
    },
    backButton: {
        marginRight: Spacing.md,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.md,
        color: Colors.light.text,
        height: '100%',
    },
    searchIconBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
        backgroundColor: Colors.light.background, // Resto blanco/crema
        borderTopLeftRadius: 30, // Curva superior visual
        borderTopRightRadius: 30,
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        overflow: 'hidden',
    },
    titleContainer: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: 24,
        color: Colors.light.success,
    },
    subtitle: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: 24,
        color: Colors.light.success,
    },
    titleUnderline: {
        marginTop: 4,
        width: 60,
        height: 3,
        backgroundColor: Colors.light.success,
        borderRadius: 2,
    },
    sectionLabel: {
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.lg,
        color: '#666',
        marginBottom: Spacing.md,
    },
    listContent: {
        paddingBottom: 100, // Espacio para FAB
    },
    loadingContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: FontFamily.inter.regular,
        color: Colors.light.textSecondary,
        fontSize: FontSize.md,
    },
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
        zIndex: 100,
    },
});
