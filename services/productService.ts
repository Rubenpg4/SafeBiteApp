/**
 * SERVICIO DE PRODUCTOS - Catálogo Global
 * Gestiona la colección de productos como caché y fuente de verdad
 */

import { db } from '@/config/firebase';
import {
    doc,
    getDoc,
    increment,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';

// Tipos para Firestore
export interface ProductDocument {
    barcode: string;
    productName: string;
    brand: string;
    imageUrl?: string;
    ingredients?: string;
    allergenIds: string[];      // IDs de alérgenos detectados
    scanCount: number;          // Para analítica de popularidad
    lastUpdated: Timestamp;
    createdAt: Timestamp;
}

// Datos para crear un producto desde la API
export interface ProductCreateData {
    productName: string;
    brand: string;
    imageUrl?: string;
    ingredients?: string;
    allergenIds: string[];
}

// Referencia a la colección
const PRODUCTS_COLLECTION = 'products';

/**
 * Buscar producto en el catálogo global (caché)
 * Lectura O(1) usando barcode como ID
 */
export const getProductFromCache = async (barcode: string): Promise<ProductDocument | null> => {
    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, barcode);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            return productSnap.data() as ProductDocument;
        }

        return null;
    } catch (error: any) {
        if (error.code === 'permission-denied' || error.message?.includes('permission')) {
            console.warn('[ProductService] Cache access denied (using fallback API)');
        } else {
            console.error('[ProductService] Error getting product from cache:', error);
        }
        return null;
    }
};

/**
 * Crear nuevo producto en el catálogo global
 * Se llama cuando un producto no existe en caché
 */
export const createProduct = async (
    barcode: string,
    data: ProductCreateData
): Promise<ProductDocument> => {
    const productRef = doc(db, PRODUCTS_COLLECTION, barcode);

    const productDoc: Omit<ProductDocument, 'lastUpdated' | 'createdAt'> & {
        lastUpdated: ReturnType<typeof serverTimestamp>;
        createdAt: ReturnType<typeof serverTimestamp>;
    } = {
        barcode,
        productName: data.productName,
        brand: data.brand,
        imageUrl: data.imageUrl,
        ingredients: data.ingredients,
        allergenIds: data.allergenIds,
        scanCount: 1,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
    };

    await setDoc(productRef, productDoc);
    console.log('[ProductService] Created new product in catalog:', barcode);

    // Retornar con timestamps simulados para uso inmediato
    return {
        ...productDoc,
        lastUpdated: Timestamp.now(),
        createdAt: Timestamp.now()
    } as ProductDocument;
};

/**
 * Incrementar contador de escaneos
 * Se llama cuando un producto ya existe en caché
 */
export const incrementScanCount = async (barcode: string): Promise<void> => {
    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, barcode);

        await updateDoc(productRef, {
            scanCount: increment(1),
            lastUpdated: serverTimestamp()
        });

        console.log('[ProductService] Incremented scanCount for:', barcode);
    } catch (error) {
        console.error('[ProductService] Error incrementing scanCount:', error);
        // No lanzar error - operación no crítica
    }
};

/**
 * Obtener o crear producto (flujo principal de escaneo)
 * Combina check caché + crear si no existe + incrementar si existe
 */
export const getOrCreateProduct = async (
    barcode: string,
    fetchFromApi: () => Promise<ProductCreateData | null>
): Promise<ProductDocument | null> => {
    // 1. Check caché
    console.log('[ProductService] Checking cache for:', barcode);
    const cachedProduct = await getProductFromCache(barcode);

    if (cachedProduct) {
        // 2. Producto existe → Incrementar contador
        console.log('[ProductService] Product found in cache, incrementing count');
        await incrementScanCount(barcode);
        return cachedProduct;
    }

    // 3. Producto no existe → Llamar API y crear
    console.log('[ProductService] Product not in cache, fetching from API');
    const apiData = await fetchFromApi();

    if (!apiData) {
        console.log('[ProductService] Product not found in API');
        return null;
    }

    // 4. Crear en catálogo global
    const newProduct = await createProduct(barcode, apiData);
    return newProduct;
};
