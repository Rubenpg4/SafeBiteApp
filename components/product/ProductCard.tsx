/**
 * PRODUCT CARD
 * 
 * Estructura:
 * - Borde de la tarjeta con color (verde/rojo)
 * - Círculo con check/cruz en esquina SUPERIOR IZQUIERDA
 * - Imagen del producto
 * - Nombre del producto (color según si es apto o no)
 * - "Alérgenos" + iconos de alérgenos que coinciden
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { Product } from '@/types';
import { AllergenIcon } from '../AllergenIcon';

interface ProductCardProps {
    product: Product;
    onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const handlePress = () => {
        onPress?.(product);
    };

    // Colores según el diseño de Figma
    const statusColor = product.isSafe ? '#5CBFB3' : '#E88B8B';

    return (
        <View style={styles.wrapper}>
            {/* Círculo de estado (check/cruz) en ESQUINA SUPERIOR IZQUIERDA */}
            <View style={[styles.statusCircle, { backgroundColor: statusColor }]}>
                <Ionicons
                    name={product.isSafe ? 'checkmark' : 'close'}
                    size={18}
                    color={Colors.light.white}
                />
            </View>

            {/* Tarjeta principal con borde de color */}
            <TouchableOpacity
                style={[styles.card, { borderColor: statusColor }]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                {/* Imagen del producto */}
                <View style={styles.imageContainer}>
                    {product.imageSource ? (
                        <Image
                            source={product.imageSource}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                    ) : product.imageUrl ? (
                        <Image
                            source={{ uri: product.imageUrl }}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                            <Ionicons name="cube-outline" size={30} color={Colors.light.textSecondary} />
                        </View>
                    )}
                </View>

                {/* Contenido */}
                <View style={styles.content}>
                    {/* Nombre del producto */}
                    <Text style={[styles.productName, { color: statusColor }]} numberOfLines={1}>
                        {product.name}
                    </Text>

                    {/* Alérgenos */}
                    {product.matchedAllergens.length > 0 && (
                        <View style={styles.allergensRow}>
                            <Text style={styles.allergensLabel}>Alérgenos</Text>
                            <View style={styles.allergenIcons}>
                                {product.matchedAllergens.map((allergen) => (
                                    <View key={allergen.id} style={styles.allergenIconWrapper}>
                                        <AllergenIcon
                                            id={allergen.id}
                                            size={24}
                                            highlighted={false}
                                            style={{ backgroundColor: 'transparent' }}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Flecha de navegación */}
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.light.textSecondary}
                    style={styles.chevron}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        paddingTop: 14, // Espacio para el círculo en la esquina superior
    },
    // Círculo de estado en ESQUINA SUPERIOR IZQUIERDA
    statusCircle: {
        position: 'absolute',
        left: -8,
        top: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    // Tarjeta con borde de color
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.white,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        paddingVertical: Spacing.md,
        paddingLeft: Spacing.md,
        paddingRight: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    // Imagen
    imageContainer: {
        marginRight: Spacing.md,
    },
    productImage: {
        width: 60,
        height: 70,
        borderRadius: BorderRadius.sm,
    },
    placeholderImage: {
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Contenido
    content: {
        flex: 1,
    },
    productName: {
        fontFamily: FontFamily.montserrat.semibold,
        fontSize: FontSize.lg,
        marginBottom: Spacing.xs,
    },
    // Alérgenos
    allergensRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    allergensLabel: {
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.sm,
        color: Colors.light.textSecondary,
        marginRight: Spacing.xs,
    },
    allergenIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    allergenIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    // Flecha
    chevron: {
        marginLeft: Spacing.sm,
    },
});

export default ProductCard;
