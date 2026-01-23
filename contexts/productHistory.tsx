/**
 * CONTEXTO DE HISTORIAL DE PRODUCTOS
 */

import { ALLERGENS_DATA } from '@/constants/allergens';
import { createProduct, getOrCreateProduct, getProductFromCache, ProductCreateData } from '@/services/productService';
import { addScanToHistory, getScanHistory } from '@/services/userService';
import { Allergen, Product, ProductHistoryState } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useUserPreferences } from './userPreferences';

const PRODUCT_HISTORY_KEY = 'scanned_products_history';

// Mapeo de API tags a nuestros IDs (Solo necesitamos el ID, el resto está en constants/allergens.ts)
// Mapeos y lógica de detección movidos a utils/allergenDetection.ts
import { detectAllergens } from '@/utils/allergenDetection';

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

    // Serializar userAllergens para comparación estable (evita re-renders infinitos)
    const userAllergensKey = JSON.stringify(userAllergens);

    // Cargar historial al iniciar, cuando cambia el usuario, o cuando cambian los alérgenos
    useEffect(() => {
        loadHistory();
    }, [user?.uid, userAllergensKey]);

    const loadHistory = async () => {
        try {
            if (user?.uid && !user.isAnonymous) {
                // Usuario autenticado REAL: cargar desde Firestore (ya viene ordenado por fecha desc)
                console.log('[SafeBite] Loading scan history from Firestore...');
                const firestoreHistory = await getScanHistory(user.uid, 50);

                // Convertir a formato Product para la UI con RECÁLCULO DINÁMICO de isSafe
                const productsFromFirestore: Product[] = firestoreHistory.map(item => {
                    // Recalcular isSafe basado en los alérgenos ACTUALES del usuario
                    const itemAllergenIds = item.allergenIds || [];
                    const hasMatchingAllergen = itemAllergenIds.some(
                        (allergenId: string) => userAllergens.includes(allergenId)
                    );
                    const dynamicIsSafe = !hasMatchingAllergen;

                    // Construir matched allergens para la UI
                    const matchedAllergens: Allergen[] = itemAllergenIds
                        .filter((id: string) => userAllergens.includes(id))
                        .map((id: string) => {
                            const def = ALLERGENS_DATA[id];
                            return def ? { id: def.id, name: def.label, icon: 'alert' } : null;
                        })
                        .filter(Boolean) as Allergen[];

                    // Todos los alérgenos del producto
                    const allAllergens: Allergen[] = itemAllergenIds
                        .map((id: string) => {
                            const def = ALLERGENS_DATA[id];
                            return def ? { id: def.id, name: def.label, icon: 'alert' } : null;
                        })
                        .filter(Boolean) as Allergen[];

                    return {
                        id: item.id,
                        barcode: item.barcode,
                        name: item.productName,
                        brand: item.brand,
                        imageUrl: item.imageUrl,
                        ingredients: item.ingredients,
                        allergens: allAllergens,
                        matchedAllergens: matchedAllergens,
                        isSafe: dynamicIsSafe,
                        scannedAt: item.scannedAt,
                        analysisStatus: item.ingredients ? 'complete' : 'missing_data'
                    } as Product;
                });

                setProducts(productsFromFirestore);
                console.log(`[SafeBite] Loaded ${productsFromFirestore.length} items from Firestore (isSafe recalculated)`);
            } else {
                // Usuario invitado: cargar desde AsyncStorage
                const savedHistory = await AsyncStorage.getItem(PRODUCT_HISTORY_KEY);
                if (savedHistory) {
                    const parsedProducts = JSON.parse(savedHistory).map((p: any) => ({
                        ...p,
                        scannedAt: new Date(p.scannedAt),
                    }));
                    setProducts(parsedProducts);
                }
            }
        } catch (error) {
            console.error('Error loading history:', error);
            // Fallback a AsyncStorage si falla Firestore
            try {
                const savedHistory = await AsyncStorage.getItem(PRODUCT_HISTORY_KEY);
                if (savedHistory) {
                    const parsedProducts = JSON.parse(savedHistory).map((p: any) => ({
                        ...p,
                        scannedAt: new Date(p.scannedAt),
                    }));
                    setProducts(parsedProducts);
                }
            } catch (fallbackError) {
                console.error('Error loading from fallback:', fallbackError);
            }
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
        // 2. Análisis Avanzado con SafeBite Engine (Unificado)
        const analysisTags = productData.allergens_tags || [];
        const analysisIngredients = productData.ingredients_text || '';

        const detectedAllergenIds = detectAllergens(analysisTags, analysisIngredients);


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
        const hasTags = analysisTags.length > 0;

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
     * FLUJO DE ESCANEO OPTIMIZADO CON CATÁLOGO GLOBAL
     * 1. Check caché en /products
     * 2. Si no existe → Llamar API y crear en catálogo
     * 3. Si existe → Incrementar scanCount
     * 4. Calcular isSafe vs alérgenos del usuario
     * 5. Desnormalizar y guardar en historial del usuario
     */
    const scanAndAddProduct = useCallback(async (barcode: string): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('[SafeBite] Starting optimized scan flow for:', barcode);

            // Función para fetch de API
            const fetchFromApi = async (): Promise<ProductCreateData | null> => {
                console.log('[SafeBite] Fetching from OpenFoodFacts API...');
                const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
                const data = await response.json();

                if (data.status !== 1 || !data.product) {
                    return null;
                }

                const productData = data.product;

                // Análisis Avanzado con SafeBite Engine
                const analysisTags = productData.allergens_tags || [];
                const analysisIngredients = productData.ingredients_text || '';

                const detectedAllergenIds = detectAllergens(analysisTags, analysisIngredients);

                return {
                    productName: productData.product_name || 'Producto desconocido',
                    brand: productData.brands || 'Marca desconocida',
                    imageUrl: productData.image_front_url || productData.image_url,
                    ingredients: productData.ingredients_text,
                    allergenIds: Array.from(detectedAllergenIds)
                };
            };

            let productData: ProductCreateData | null = null;
            let catalogProduct: { barcode: string; productName: string; brand: string; imageUrl?: string; ingredients?: string; allergenIds: string[] } | null = null;

            // Flujo diferente para usuarios autenticados vs invitados
            if (user) {
                // Usuario autenticado: usar catálogo global con Firestore
                console.log('[SafeBite] Authenticated user - using Firestore catalog');
                const firestoreProduct = await getOrCreateProduct(barcode, fetchFromApi);
                if (firestoreProduct) {
                    catalogProduct = {
                        barcode: firestoreProduct.barcode,
                        productName: firestoreProduct.productName,
                        brand: firestoreProduct.brand,
                        imageUrl: firestoreProduct.imageUrl,
                        ingredients: firestoreProduct.ingredients,
                        allergenIds: firestoreProduct.allergenIds
                    };
                }
            } else {
                // Usuario invitado: Usar caché global (lectura) -> Fallback a API
                console.log('[SafeBite] Guest user - checking cache first');

                // 1. Intentar leer de caché global
                const cachedProduct = await getProductFromCache(barcode);

                if (cachedProduct) {
                    console.log('[SafeBite] Guest user - found in cache!');
                    catalogProduct = {
                        barcode: cachedProduct.barcode,
                        productName: cachedProduct.productName,
                        brand: cachedProduct.brand,
                        imageUrl: cachedProduct.imageUrl,
                        ingredients: cachedProduct.ingredients,
                        allergenIds: cachedProduct.allergenIds
                    };
                } else {
                    // 2. No está en caché -> Fallback a API (sin guardar en Firestore porque son invitados)
                    console.log('[SafeBite] Guest user - not in cache, fetching from API');
                    productData = await fetchFromApi();
                    if (productData) {
                        try {
                            // CONTRIBUCIÓN A LA CACHÉ: Guardar para futuros usuarios
                            // Aunque sea invitado, puede crear productos en el catálogo global
                            console.log('[SafeBite] Guest user - contributing to cache...');
                            await createProduct(barcode, productData);
                        } catch (cacheError) {
                            console.warn('[SafeBite] Failed to save to cache (guest)', cacheError);
                            // No bloqueamos el flujo si falla la caché
                        }

                        catalogProduct = {
                            barcode: barcode,
                            productName: productData.productName,
                            brand: productData.brand,
                            imageUrl: productData.imageUrl,
                            ingredients: productData.ingredients,
                            allergenIds: productData.allergenIds
                        };
                    }
                }
            }

            if (!catalogProduct) {
                throw new Error('Producto no encontrado');
            }

            // 4. Calcular matchedAllergens e isSafe para ESTE usuario
            const matchedAllergens = calculateMatchedAllergens(catalogProduct.allergenIds);
            const isSafe = matchedAllergens.length === 0;

            // Construir objeto Product para la UI
            const productAllergens: Allergen[] = catalogProduct.allergenIds.map((id: string) => {
                const def = ALLERGENS_DATA[id];
                return def ? { id: def.id, name: def.label, icon: 'alert' } : null;
            }).filter(Boolean) as Allergen[];

            const product: Product = {
                id: barcode,
                barcode: catalogProduct.barcode,
                name: catalogProduct.productName,
                brand: catalogProduct.brand,
                imageUrl: catalogProduct.imageUrl,
                allergens: productAllergens,
                matchedAllergens: user ? matchedAllergens : productAllergens, // Guest: todos son matched
                isSafe: user ? isSafe : false, // Guest: siempre peligroso si hay alérgenos
                scannedAt: new Date(),
                ingredients: catalogProduct.ingredients,
                analysisStatus: catalogProduct.ingredients ? 'complete' : 'missing_data'
            };

            // 5a. Guardar localmente (estado + AsyncStorage)
            addProduct(product);

            // 5b. Desnormalizar y guardar en Firestore (solo usuarios autenticados REALES, no invitados)
            if (user?.uid && !user.isAnonymous) {
                try {
                    await addScanToHistory(user.uid, {
                        barcode: product.barcode,
                        productName: product.name,
                        brand: product.brand,
                        imageUrl: product.imageUrl,
                        ingredients: catalogProduct.ingredients,  // Ingredientes completos
                        allergenIds: catalogProduct.allergenIds,  // Para recálculo dinámico
                        isSafe: product.isSafe
                    });
                    console.log('[SafeBite] Scan saved to user history');
                } catch (firestoreError) {
                    console.error('[SafeBite] Error saving to user history:', firestoreError);
                }
            }

            return product;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al escanear';
            console.error('[SafeBite] Scan error:', err);
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user, userAllergens, calculateMatchedAllergens, addProduct]);

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
