/**
 * HISTORY LIST
 * 
 * Componente que muestra la lista de productos escaneados.
 * Se usa en la pantalla Home para mostrar el historial.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { useProductHistory } from '@/contexts/productHistory';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface HistoryListProps {
    products: Product[];
    onProductPress?: (product: Product) => void;
    ListEmptyComponent?: React.ReactElement;
    ListHeaderComponent?: React.ReactElement;
}

export const HistoryList: React.FC<HistoryListProps> = ({
    products,
    onProductPress,
    ListEmptyComponent,
    ListHeaderComponent,
}) => {
    const { removeProduct } = useProductHistory();

    const renderRightActions = (progress: any, dragX: any, item: Product) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity onPress={() => removeProduct(item.id)} style={styles.deleteButtonContainer}>
                <View style={styles.deleteButton}>
                    <Animated.Text style={{ transform: [{ scale }] }}>
                        <Ionicons name="trash-outline" size={24} color="#FFF" />
                    </Animated.Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Product }) => (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
            overshootRight={false}
        >
            <ProductCard
                product={item}
                onPress={onProductPress}
            />
        </Swipeable>
    );

    const keyExtractor = (item: Product) => item.id;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={ListEmptyComponent}
                ListHeaderComponent={ListHeaderComponent}
            />
        </GestureHandlerRootView>
    );
};

/**
 * Componente de sección del día para agrupar productos
 */
interface DaySectionProps {
    title: string;
}

export const DaySection: React.FC<DaySectionProps> = ({ title }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    listContent: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xxl * 4, // Espacio para el botón flotante
    },
    sectionHeader: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.background,
    },
    sectionTitle: {
        fontFamily: FontFamily.inter.semibold,
        fontSize: FontSize.sm,
        color: Colors.light.textSecondary,
    },
    deleteButtonContainer: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        paddingTop: 14, // Coincidir con ProductCard wrapper
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '100%',
        borderRadius: 16,
    },
});

export default HistoryList;
