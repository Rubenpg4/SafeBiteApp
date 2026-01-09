/**
 * HISTORY LIST
 * 
 * Componente que muestra la lista de productos escaneados.
 * Se usa en la pantalla Home para mostrar el historial.
 */

import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants';
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
    const renderItem = ({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            onPress={onProductPress}
        />
    );

    const keyExtractor = (item: Product) => item.id;

    return (
        <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={ListEmptyComponent}
            ListHeaderComponent={ListHeaderComponent}
        />
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
});

export default HistoryList;
