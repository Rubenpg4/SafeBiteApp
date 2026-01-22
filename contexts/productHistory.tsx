/**
 * CONTEXTO DE HISTORIAL DE PRODUCTOS
 */

import { ALLERGENS_DATA } from '@/constants/allergens';
import { Allergen, Product, ProductHistoryState } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useUserPreferences } from './userPreferences';

const PRODUCT_HISTORY_KEY = 'scanned_products_history';

// Mapeo de API tags a nuestros IDs (Solo necesitamos el ID, el resto está en constants/allergens.ts)
const ALLERGEN_MAP: Record<string, string> = {
    'en:gluten': '1',
    'en:crustaceans': '2',
    'en:eggs': '3',
    'en:fish': '4',
    'en:nuts': '5',
    'en:celery': '6',
    'en:mustard': '7',
    'en:sesame-seeds': '8',
    'en:peanuts': '9',
    'en:soybeans': '10',
    'en:milk': '11',
    'en:sulphur-dioxide-and-sulphites': '12',
    'en:molluscs': '13',
    'en:lupin': '14',
};

interface ProductHistoryContextType extends ProductHistoryState {
    addProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    clearHistory: () => void;
    scanAndAddProduct: (barcode: string) => Promise<Product | null>;
}

const ProductHistoryContext = createContext<ProductHistoryContextType | undefined>(undefined);

export const ProductHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userAllergens } = useUserPreferences();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar historial al iniciar
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const savedHistory = await AsyncStorage.getItem(PRODUCT_HISTORY_KEY);
            if (savedHistory) {
                // Parseamos los datos y convertimos las fechas de string a Date
                const parsedProducts = JSON.parse(savedHistory).map((p: any) => ({
                    ...p,
                    scannedAt: new Date(p.scannedAt), // Restaurar objeto Date
                }));
                setProducts(parsedProducts);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const saveHistory = async (newProducts: Product[]) => {
        try {
            await AsyncStorage.setItem(PRODUCT_HISTORY_KEY, JSON.stringify(newProducts));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    };

    /**
     * Calcula qué alérgenos del producto coinciden con los del usuario
     */
    const calculateMatchedAllergens = useCallback((productAllergenIds: string[]): Allergen[] => {
        const matches: Allergen[] = [];

        productAllergenIds.forEach(id => {
            if (userAllergens.includes(id)) {
                const def = ALLERGENS_DATA[id];
                if (def) {
                    // El icono lo maneja la UI con el ID, aquí pasamos un placeholder o el ID mismo si cambiáramos el tipo
                    matches.push({ id: def.id, name: def.label, icon: 'alert' });
                }
            }
        });

        return matches;
    }, [userAllergens]);

    const addProduct = useCallback((product: Product) => {
        setProducts(prev => {
            const updated = [product, ...prev];
            saveHistory(updated);
            return updated;
        });
    }, []);

    const removeProduct = useCallback((productId: string) => {
        setProducts(prev => {
            const updated = prev.filter(p => p.id !== productId);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setProducts([]);
        saveHistory([]);
    }, []);

    /**
     * LLAMADA REAL A LA API Y LÓGICA DE NEGOCIO
     */
    const scanAndAddProduct = useCallback(async (barcode: string): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Fetch OpenFoodFacts
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
            const data = await response.json();

            if (data.status !== 1 || !data.product) {
                throw new Error('Producto no encontrado');
            }

            const productData = data.product;

            // 2. Extraer y traducir alérgenos
            const rawTags = productData.allergens_tags || [];
            const productAllergens: Allergen[] = [];
            const productAllergenIds: string[] = [];

            rawTags.forEach((tag: string) => {
                const mappedId = ALLERGEN_MAP[tag];
                if (mappedId) {
                    productAllergenIds.push(mappedId);
                    const def = ALLERGENS_DATA[mappedId];
                    if (def) {
                        productAllergens.push({ id: def.id, name: def.label, icon: 'alert' });
                    }
                }
            });

            // 3. Comparar con preferencias del usuario
            const matchedAllergens = calculateMatchedAllergens(productAllergenIds);

            // isSafe si NO hay coincidencias
            const isSafe = matchedAllergens.length === 0;

            const newProduct: Product = {
                id: Date.now().toString(), // ID único local
                barcode,
                name: productData.product_name || 'Producto desconocido',
                brand: productData.brands || 'Marca desconocida',
                imageUrl: productData.image_front_url || productData.image_url,
                allergens: productAllergens, // Todos los alérgenos del producto
                matchedAllergens: matchedAllergens, // Los que son peligrosos para el usuario
                isSafe,
                scannedAt: new Date(),
                ingredients: productData.ingredients_text
            };

            // 4. Guardar
            addProduct(newProduct);
            return newProduct;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al escanear';
            console.error(err);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userAllergens, calculateMatchedAllergens, addProduct]);

    const value: ProductHistoryContextType = {
        products,
        isLoading,
        error,
        addProduct,
        removeProduct,
        clearHistory,
        scanAndAddProduct,
    };

    return (
        <ProductHistoryContext.Provider value={value}>
            {children}
        </ProductHistoryContext.Provider>
    );
};

export const useProductHistory = (): ProductHistoryContextType => {
    const context = useContext(ProductHistoryContext);
    if (!context) {
        throw new Error('useProductHistory debe usarse dentro de ProductHistoryProvider');
    }
    return context;
};
