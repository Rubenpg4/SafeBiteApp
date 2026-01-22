/**
 * CONTEXTO DE HISTORIAL DE PRODUCTOS
 */

import { ALLERGENS_DATA } from '@/constants/allergens';
import { Allergen, Product, ProductHistoryState } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useUserPreferences } from './userPreferences';

const PRODUCT_HISTORY_KEY = 'scanned_products_history';

// Mapeo de API tags a nuestros IDs (Solo necesitamos el ID, el resto está en constants/allergens.ts)
// Mapeo ampliado de tags de la API
const ALLERGEN_MAP: Record<string, string> = {
    // Gluten
    'en:gluten': '1', 'es:gluten': '1', 'fr:gluten': '1',
    // Crustaceans
    'en:crustaceans': '2', 'es:crustáceos': '2', 'es:crustaceos': '2',
    // Eggs
    'en:eggs': '3', 'es:huevos': '3', 'en:egg': '3', 'es:huevo': '3',
    // Fish
    'en:fish': '4', 'es:pescado': '4',
    // Nuts
    'en:nuts': '5', 'es:frutos de cáscara': '5', 'es:frutos-de-cascara': '5', 'es:frutos secos': '5',
    // Celery
    'en:celery': '6', 'es:apio': '6',
    // Mustard
    'en:mustard': '7', 'es:mostaza': '7',
    // Sesame
    'en:sesame-seeds': '8', 'es:granos de sésamo': '8', 'es:sesamo': '8', 'en:sesame': '8',
    // Peanuts
    'en:peanuts': '9', 'es:cacahuetes': '9', 'es:cacahuete': '9', 'en:peanut': '9',
    // Soybeans
    'en:soybeans': '10', 'es:soja': '10', 'en:soy': '10', 'en:soya': '10',
    // Milk
    'en:milk': '11', 'es:leche': '11', 'fr:lait': '11', 'pt:leite': '11',
    // Sulphur dioxide
    'en:sulphur-dioxide-and-sulphites': '12', 'es:dióxido de azufre y sulfitos': '12', 'es:sulfitos': '12',
    // Molluscs
    'en:molluscs': '13', 'es:moluscos': '13',
    // Lupin
    'en:lupin': '14', 'es:altramuces': '14',
};

// Palabras clave para búsqueda en ingredientes (fallback)
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
    '1': ['gluten', 'trigo', 'wheat', 'cebada', 'barley', 'centeno', 'rye', 'avena', 'oat'],
    '2': ['crustaceo', 'crustáceo', 'gamba', 'langostino', 'cangrejo', 'bogavante', 'camaron', 'camarón'],
    '3': ['huevo', 'egg', 'yema', 'clara', 'ovo'],
    '4': ['pescado', 'fish', 'bacalao', 'atun', 'atún', 'salmon', 'salmón', 'merluza'],
    '5': ['nuez', 'nueces', 'nut', 'almendra', 'almond', 'avellana', 'hazelnut', 'pistacho', 'anacardo'],
    '6': ['apio', 'celery'],
    '7': ['mostaza', 'mustard'],
    '8': ['sesamo', 'sésamo', 'sesame', 'ajonjoli', 'ajonjolí'],
    '9': ['cacahuete', 'peanut', 'maní', 'mani'],
    '10': ['soja', 'soy', 'soya', 'edamame'],
    '11': ['leche', 'milk', 'lait', 'nata', 'cream', 'queso', 'cheese', 'yogur', 'yogurt', 'mantequilla', 'butter', 'suero', 'whey', 'lactosa', 'lactose', 'casein', 'caseina', 'fermentos lacticos', 'fermentos lácticos', 'mozzarella'],
    '12': ['sulfito', 'sulphite', 'bisulfito', 'metabisulfito', 'e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228'],
    '13': ['molusco', 'mollusc', 'mejillon', 'mejillón', 'almeja', 'sepia', 'calamar', 'pulpo'],
    '14': ['altramuc', 'altramuz', 'lupin'],
};

// Pre-compilar regexes para rendimiento óptimo
const ALLERGEN_REGEXES: Record<string, RegExp> = Object.entries(ALLERGEN_KEYWORDS).reduce((acc, [id, keywords]) => {
    const pattern = keywords
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    acc[id] = new RegExp(`\\b(${pattern})\\b`, 'i');
    return acc;
}, {} as Record<string, RegExp>);

interface ProductHistoryContextType extends ProductHistoryState {
    addProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    clearHistory: () => void;
    scanAndAddProduct: (barcode: string) => Promise<Product | null>;
    searchProducts: (query: string) => Promise<Product[]>;
}

const ProductHistoryContext = createContext<ProductHistoryContextType | undefined>(undefined);

export const ProductHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
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
            // Eliminar si ya existe el mismo barcode para ponerlo arriba
            const filtered = prev.filter(p => p.barcode !== product.barcode);
            const updated = [product, ...filtered];
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
     * Helper to parse OpenFoodFacts product data into our Product type
     */
    /**
 * Helper to parse OpenFoodFacts product data into our Product type
 */
    const parseProductData = useCallback((productData: any, barcode: string): Product => {
        const detectedAllergenIds = new Set<string>();

        // 2a. Extraer de etiquetas (Tags)
        const rawTags = productData.allergens_tags || [];
        rawTags.forEach((tag: string) => {
            const lowerTag = tag.toLowerCase();
            if (ALLERGEN_MAP[lowerTag]) {
                detectedAllergenIds.add(ALLERGEN_MAP[lowerTag]);
            }
        });

        // 2b. Búsqueda por palabras clave en ingredientes Y nombre del producto
        const searchableText = [
            productData.product_name,
            productData.brands,
            productData.ingredients_text
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchableText) {
            // Usar regexes pre-compiladas. Mucho más rápido.
            Object.entries(ALLERGEN_REGEXES).forEach(([id, regex]) => {
                if (detectedAllergenIds.has(id)) return;

                if (regex.test(searchableText)) {
                    detectedAllergenIds.add(id);
                }
            });
        }

        // Construir lista completa de alérgenos del producto
        const productAllergens: Allergen[] = [];
        const productAllergenIds = Array.from(detectedAllergenIds);

        productAllergenIds.forEach(id => {
            const def = ALLERGENS_DATA[id];
            if (def) {
                productAllergens.push({ id: def.id, name: def.label, icon: 'alert' });
            }
        });

        // 3. Comparar con preferencias del usuario
        let matchedAllergens: Allergen[] = calculateMatchedAllergens(productAllergenIds);

        // 4. Determinar estado de datos (calidad)
        const hasIngredients = !!productData.ingredients_text;
        const hasTags = rawTags.length > 0;

        let analysisStatus: 'complete' | 'missing_data' = 'complete';

        // Si no hay ingredientes y no hemos detectado nada (ni por tags ni por nombre)
        // O si no hay nada de info
        if (!hasIngredients && !hasTags && detectedAllergenIds.size === 0) {
            analysisStatus = 'missing_data';
        }

        // isSafe logic:
        // Safe si NO hay coincidencias Y los datos son completos.
        // Si faltan datos, NO es safe (es unknown/warning).
        let isSafe = matchedAllergens.length === 0;

        if (analysisStatus === 'missing_data') {
            isSafe = false; // Forzamos unsafe para no dar falso positivo
        }

        return {
            id: productData._id || barcode || Date.now().toString(),
            barcode: barcode || productData.code || '',
            name: productData.product_name || 'Producto desconocido',
            brand: productData.brands || 'Marca desconocida',
            imageUrl: productData.image_front_url || productData.image_url,
            allergens: productAllergens,
            matchedAllergens: matchedAllergens,
            isSafe,
            scannedAt: new Date(),
            ingredients: productData.ingredients_text,
            analysisStatus
        };
    }, [userAllergens, calculateMatchedAllergens]);

    /**
     * BUSCAR PRODUCTOS POR NOMBRE
     */
    const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`
            );
            const data = await response.json();

            if (!data.products || data.products.length === 0) {
                return [];
            }

            const results: Product[] = data.products.map((p: any) =>
                parseProductData(p, p.code || '')
            );

            return results;

        } catch (err) {
            console.error('Error searching products:', err);
            setError('Error al buscar productos');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [parseProductData]);

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

            // 2. Parsear datos usando la función centralizada
            const product = parseProductData(data.product, barcode);

            // 3. Ajuste para usuarios NO logueados (Guest)
            // Si el usuario NO está logueado, consideramos TODOS los detectados como peligrosos para mostrar alerta
            if (!user) {
                product.matchedAllergens = product.allergens;
                product.isSafe = product.matchedAllergens.length === 0;
            }

            // 4. Guardar
            addProduct(product);
            return product;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al escanear';
            console.error(err);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user, parseProductData, addProduct]);

    const value: ProductHistoryContextType = {
        products,
        isLoading,
        error,
        addProduct,
        removeProduct,
        clearHistory,
        scanAndAddProduct,
        searchProducts,
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
