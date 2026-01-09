/**
 * CONTEXTO DE HISTORIAL DE PRODUCTOS
 * 
 * Este contexto maneja el estado de los productos escaneados.
 * Por ahora usa datos mock, pero está preparado para conectar con:
 * - La API de Open Food Facts ( Scanner/API)
 * - Los alérgenos del usuario ( Onboarding)
 * 
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

import { MOCK_SCANNED_PRODUCTS, MOCK_USER_ALLERGENS } from '@/data/mockData';
import { Allergen, Product, ProductHistoryState } from '@/types';

interface ProductHistoryContextType extends ProductHistoryState {
    /** Añade un producto escaneado al historial */
    addProduct: (product: Product) => void;
    /** Elimina un producto del historial */
    removeProduct: (productId: string) => void;
    /** Limpia todo el historial */
    clearHistory: () => void;
    /**
     * FUNCIÓN PARA CONECTAR CON LA API DE OPEN FOOD FACTS
     * 
     * TODO: Implementar esta función
     * 
     * @param barcode - Código de barras escaneado
     * @returns Producto procesado con información de compatibilidad
     */
    scanAndAddProduct: (barcode: string) => Promise<Product | null>;
}

const ProductHistoryContext = createContext<ProductHistoryContextType | undefined>(undefined);

interface ProductHistoryProviderProps {
    children: React.ReactNode;
    /**
     * PROP PARA RECIBIR ALÉRGENOS DEL USUARIO
     * 
     * TODO: Pasar los alérgenos del usuario aquí
     * Ejemplo: <ProductHistoryProvider userAllergens={userAllergens}>
     * 
     * Por defecto usa MOCK_USER_ALLERGENS para desarrollo
     */
    userAllergens?: Allergen[];
}

export const ProductHistoryProvider: React.FC<ProductHistoryProviderProps> = ({
    children,
    userAllergens = MOCK_USER_ALLERGENS, // Mock por defecto
}) => {
    // Estado inicial con productos mock para demostración
    // Cambiar a [] cuando se conecte con la API real
    const [products, setProducts] = useState<Product[]>(MOCK_SCANNED_PRODUCTS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Calcula qué alérgenos del producto coinciden con los del usuario
     */
    const calculateMatchedAllergens = useCallback((productAllergens: Allergen[]): Allergen[] => {
        return productAllergens.filter(productAllergen =>
            userAllergens.some(userAllergen => userAllergen.id === productAllergen.id)
        );
    }, [userAllergens]);

    /**
     * Añade un producto al historial
     */
    const addProduct = useCallback((product: Product) => {
        setProducts(prev => [product, ...prev]); // Más reciente primero
    }, []);

    /**
     * Elimina un producto del historial
     */
    const removeProduct = useCallback((productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }, []);

    /**
     * Limpia todo el historial
     */
    const clearHistory = useCallback(() => {
        setProducts([]);
    }, []);

    /**
     * ESCANEA Y AÑADE UN PRODUCTO
     * 
     * TODO: Implementar llamada real a Open Food Facts aquí
     * 
     * Esta función debe:
     * 1. Llamar a la API de Open Food Facts con el barcode
     * 2. Parsear la respuesta (allergens_tags)
     * 3. Calcular matchedAllergens con los alérgenos del usuario
     * 4. Determinar si es isSafe
     * 5. Añadir al historial
     */
    const scanAndAddProduct = useCallback(async (barcode: string): Promise<Product | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: REEMPLAZAR ESTE MOCK CON LA LLAMADA REAL A LA API      

            // Mock: Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock: Crear producto de ejemplo
            const mockAllergens: Allergen[] = [
                { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
            ];

            const matchedAllergens = calculateMatchedAllergens(mockAllergens);

            const newProduct: Product = {
                id: Date.now().toString(),
                barcode,
                name: `Producto ${barcode.slice(-4)}`,
                brand: 'Marca ejemplo',
                allergens: mockAllergens,
                matchedAllergens,
                isSafe: matchedAllergens.length === 0,
                scannedAt: new Date(),
            };

            addProduct(newProduct);
            return newProduct;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [calculateMatchedAllergens, addProduct]);

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

/**
 * Hook para acceder al historial de productos
 */
export const useProductHistory = (): ProductHistoryContextType => {
    const context = useContext(ProductHistoryContext);
    if (!context) {
        throw new Error('useProductHistory debe usarse dentro de ProductHistoryProvider');
    }
    return context;
};
