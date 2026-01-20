/**
 * DATOS MOCK 
 * 
 * Estos datos son temporales.
 * 
 */

import { Allergen, Product } from '@/types';

/**
 * MOCK: Alérgenos del usuario (configurados en onboarding)
 * 
 * TODO: Reemplazar por el estado real del UserAllergenContext
 */
export const MOCK_USER_ALLERGENS: Allergen[] = [
    { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
    { id: 'en:peanuts', name: 'Cacahuetes', icon: 'peanuts' },
];

/**
 * MOCK: Productos escaneados (historial)
 * 
 * TODO: Reemplazar por productos reales de Open Food Facts
 */
export const MOCK_SCANNED_PRODUCTS: Product[] = [
    {
        id: '1',
        barcode: '8410500010041',
        name: 'Leche entera',
        brand: 'Hacendado',
        imageSource: require('@/assets/images/product-leche.png'),
        allergens: [
            { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
        ],
        matchedAllergens: [
            { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
        ],
        isSafe: false, // Contiene lácteos que el usuario evita
        scannedAt: new Date(Date.now() - 1000 * 60 * 5), // Hace 5 minutos
    },
    {
        id: '2',
        barcode: '8410500010058',
        name: 'Crema de cacahuete',
        brand: 'Hacendado',
        imageSource: require('@/assets/images/product-cacahuete.png'),
        allergens: [
            { id: 'en:peanuts', name: 'Cacahuetes', icon: 'peanuts' },
            { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
        ],
        matchedAllergens: [
            { id: 'en:peanuts', name: 'Cacahuetes', icon: 'peanuts' },
            { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
        ],
        isSafe: false, // Contiene cacahuetes Y lácteos
        scannedAt: new Date(Date.now() - 1000 * 60 * 15), // Hace 15 minutos
    },
    {
        id: '3',
        barcode: '8480000591234',
        name: 'Galletas de avena',
        brand: 'Hacendado',
        imageSource: require('@/assets/images/product-galletas.png'),
        allergens: [
            { id: 'en:gluten', name: 'Gluten', icon: 'gluten' },
        ],
        matchedAllergens: [], // El usuario no es alérgico al gluten
        isSafe: true, // Es seguro para el usuario
        scannedAt: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 minutos
    },
];

/**
 * Función helper para simular el escaneo de un producto
 * 
 * TODO: Reemplazar por llamada real a Open Food Facts
 * 
 * @param barcode - Código de barras escaneado
 * @param userAllergens - Alérgenos del usuario
 * @returns Producto con información de compatibilidad
 */
export const mockScanProduct = async (
    barcode: string,
    userAllergens: Allergen[]
): Promise<Product> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar si ya tenemos este producto en mock
    const existingProduct = MOCK_SCANNED_PRODUCTS.find(p => p.barcode === barcode);

    if (existingProduct) {
        return {
            ...existingProduct,
            id: Date.now().toString(),
            scannedAt: new Date(),
        };
    }

    // Producto genérico si no lo encontramos
    return {
        id: Date.now().toString(),
        barcode,
        name: 'Producto desconocido',
        allergens: [],
        matchedAllergens: [],
        isSafe: true,
        scannedAt: new Date(),
    };
};
