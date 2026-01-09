/**
 * TIPOS COMPARTIDOS - SafeBite App
 */

/**
 * Representa un alérgeno
 * Los IDs deben coincidir con los de Open Food Facts
 */
export interface Allergen {
    id: string;           // ej: 'en:gluten', 'en:milk', 'en:peanuts'
    name: string;         // Nombre para mostrar: 'Gluten', 'Lácteos', 'Cacahuetes'
    icon?: string;        // Nombre del icono (opcional)
}

/**
 * Producto escaneado con información de la API
 */
export interface Product {
    id: string;                    // ID único del producto (puede ser el barcode)
    barcode: string;               // Código de barras escaneado
    name: string;                  // Nombre del producto
    brand?: string;                // Marca del producto
    imageUrl?: string;             // URL de la imagen del producto
    allergens: Allergen[];         // Lista de alérgenos que contiene el producto
    matchedAllergens: Allergen[];  // Alérgenos que coinciden con los del usuario
    isSafe: boolean;               // true si NO tiene alérgenos del usuario
    scannedAt: Date;               // Fecha/hora del escaneo
}

/**
 * Resultado del escaneo de la API de Open Food Facts
 */
export interface OpenFoodFactsResponse {
    status: number;
    product?: {
        product_name?: string;
        brands?: string;
        image_url?: string;
        allergens_tags?: string[];      // ej: ['en:gluten', 'en:milk']
        allergens_hierarchy?: string[];
    };
}

/**
 * Alérgenos del usuario (configurados en el onboarding)
 */
export interface UserAllergenProfile {
    userId: string;
    allergens: Allergen[];           // Alérgenos que el usuario quiere evitar
    updatedAt: Date;
}

/**
 * Estado del historial de productos
 */
export interface ProductHistoryState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
}
