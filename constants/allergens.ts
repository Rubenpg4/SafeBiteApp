/**
 * CATÁLOGO DE ALÉRGENOS
 * 
 * Lista completa de alérgenos soportados por la app.
 * Los IDs coinciden con los de Open Food Facts.
 * 
 * Documentación Open Food Facts:
 * https://world.openfoodfacts.org/allergens
 */

import { Allergen } from '@/types';

export const ALLERGENS_CATALOG: Allergen[] = [
    { id: 'en:gluten', name: 'Gluten', icon: 'gluten' },
    { id: 'en:milk', name: 'Lácteos', icon: 'milk' },
    { id: 'en:eggs', name: 'Huevos', icon: 'eggs' },
    { id: 'en:nuts', name: 'Frutos secos', icon: 'nuts' },
    { id: 'en:peanuts', name: 'Cacahuetes', icon: 'peanuts' },
    { id: 'en:soybeans', name: 'Soja', icon: 'soybeans' },
    { id: 'en:fish', name: 'Pescado', icon: 'fish' },
    { id: 'en:crustaceans', name: 'Crustáceos', icon: 'crustaceans' },
    { id: 'en:molluscs', name: 'Moluscos', icon: 'molluscs' },
    { id: 'en:celery', name: 'Apio', icon: 'celery' },
    { id: 'en:mustard', name: 'Mostaza', icon: 'mustard' },
    { id: 'en:sesame-seeds', name: 'Sésamo', icon: 'sesame' },
    { id: 'en:sulphur-dioxide-and-sulphites', name: 'Sulfitos', icon: 'sulphites' },
    { id: 'en:lupin', name: 'Altramuces', icon: 'lupin' },
];

/**
 * Obtiene un alérgeno por su ID
 */
export const getAllergenById = (id: string): Allergen | undefined => {
    return ALLERGENS_CATALOG.find(a => a.id === id);
};

/**
 * Obtiene el nombre legible de un alérgeno por su ID
 */
export const getAllergenName = (id: string): string => {
    const allergen = getAllergenById(id);
    return allergen?.name || id.replace('en:', '');
};
