/**
 * SAFEBITE ANALYSIS ENGINE
 * Sistema experto para detección de alérgenos
 */

// Mapeo exhaustivo de Tags de OpenFoodFacts a nuestros IDs
// Incluye EN, ES, FR y códigos comunes
export const API_TAG_MAP: Record<string, string> = {
    // 1. GLUTEN
    'en:gluten': '1', 'es:gluten': '1', 'fr:gluten': '1', 'de:gluten': '1',
    'en:wheat': '1', 'es:trigo': '1',
    'en:barley': '1', 'es:cebada': '1',
    'en:rye': '1', 'es:centeno': '1',
    'en:oats': '1', 'es:avena': '1',
    'en:spelt': '1', 'es:espelta': '1',
    'en:kamut': '1', 'es:kamut': '1',

    // 2. CRUSTÁCEOS
    'en:crustaceans': '2', 'es:crustaceos': '2', 'es:crustáceos': '2', 'fr:crustaces': '2',
    'en:shrimp': '2', 'es:gamba': '2', 'es:camaron': '2',
    'en:crab': '2', 'es:cangrejo': '2',
    'en:lobster': '2', 'es:bogavante': '2', 'es:langosta': '2',

    // 3. HUEVOS
    'en:eggs': '3', 'en:egg': '3', 'es:huevos': '3', 'es:huevo': '3', 'fr:oeuf': '3', 'de:ei': '3',

    // 4. PESCADO
    'en:fish': '4', 'es:pescado': '4', 'fr:poisson': '4', 'de:fisch': '4',

    // 5. FRUTOS DE CÁSCARA (NUTS)
    'en:nuts': '5', 'es:frutos-de-cascara': '5', 'es:frutos-secos': '5', 'fr:fruits-a-coque': '5',
    'en:almonds': '5', 'es:almendra': '5',
    'en:hazelnuts': '5', 'es:avellana': '5',
    'en:walnuts': '5', 'es:nuez': '5',
    'en:cashews': '5', 'es:anacardo': '5',
    'en:pecan-nuts': '5', 'es:pecana': '5',
    'en:brazil-nuts': '5',
    'en:pistachio-nuts': '5', 'es:pistacho': '5',
    'en:macadamia-nuts': '5', 'es:macadamia': '5',

    // 6. APIO
    'en:celery': '6', 'es:apio': '6', 'fr:celeri': '6',

    // 7. MOSTAZA
    'en:mustard': '7', 'es:mostaza': '7', 'fr:moutarde': '7',

    // 8. SÉSAMO
    'en:sesame-seeds': '8', 'en:sesame': '8', 'es:granos-de-sesamo': '8', 'es:sesamo': '8', 'fr:graines-de-sesame': '8',

    // 9. CACAHUETES
    'en:peanuts': '9', 'en:peanut': '9', 'es:cacahuetes': '9', 'es:cacahuete': '9', 'es:mani': '9', 'fr:arachide': '9',

    // 10. SOJA
    'en:soybeans': '10', 'en:soy': '10', 'en:soya': '10', 'es:soja': '10', 'fr:soja': '10',

    // 11. LECHE (LÁCTEOS)
    'en:milk': '11', 'es:leche': '11', 'fr:lait': '11', 'de:milch': '11',
    'en:lactose': '11', 'es:lactosa': '11',

    // 12. SULFITOS
    'en:sulphur-dioxide-and-sulphites': '12', 'en:sulfites': '12', 'es:sulfitos': '12', 'es:dioxido-de-azufre': '12',

    // 13. MOLUSCOS
    'en:molluscs': '13', 'es:moluscos': '13', 'fr:mollusques': '13',

    // 14. ALTRAMUCES
    'en:lupin': '14', 'es:altramuces': '14', 'es:altramuz': '14', 'fr:lupin': '14'
};

// Palabras clave avanzadas para análisis de texto (ingredientes)
// Incluye derivados técnicos y sinónimos peligrosos
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
    // 1. GLUTEN
    '1': [
        'gluten', 'trigo', 'wheat', 'cebada', 'barley', 'centeno', 'rye', 'avena', 'oat',
        'espelta', 'spelt', 'kamut', 'triticale', 'malta', 'malt', 'semolina',
        'almidon de trigo', 'wheat starch', 'bulgur', 'couscous', 'cuscus',
        'seitan', 'farro', 'germen de trigo', 'salvado de trigo'
    ],
    // 2. CRUSTÁCEOS
    '2': [
        'crustaceo', 'crustacean', 'gamba', 'shrimp', 'prawn', 'langostino',
        'cangrejo', 'crab', 'bogavante', 'lobster', 'cigala', 'camaron', 'krill', 'buey de mar',
        'nechora', 'centollo', 'percebe'
    ],
    // 3. HUEVO
    '3': [
        'huevo', 'egg', 'yema', 'yolk', 'clara', 'white', 'ovo',
        'albumina', 'albumin', 'lisozima', 'lysozyme', 'lecitina de huevo',
        'ovomucoide', 'ovomucina', 'ovoglobulina', 'ovovitellina'
    ],
    // 4. PESCADO
    '4': [
        'pescado', 'fish', 'bacalao', 'cod', 'atun', 'tuna', 'salmon',
        'merluza', 'hake', 'anchoa', 'anchovy', 'sardina', 'boqueron',
        'caballa', 'mackerel', 'gelatina de pescado', 'ictiocola', 'surimi'
    ],
    // 5. FRUTOS DE CÁSCARA
    '5': [
        'nuez', 'nut', 'almendra', 'almond', 'avellana', 'hazelnut',
        'anacardo', 'cashew', 'pistacho', 'pistachio', 'macadamia',
        'pecana', 'pecan', 'nogal', 'walnut', 'castaña', 'chestnut',
        'piñon', 'pine nut', 'jojoba', 'praline', 'gianduja', 'mazapan', 'marzipan'
    ],
    // 6. APIO
    '6': [
        'apio', 'celery', 'apionabo', 'celeriac', 'sal de apio'
    ],
    // 7. MOSTAZA
    '7': [
        'mostaza', 'mustard', 'sinapis'
    ],
    // 8. SÉSAMO
    '8': [
        'sesamo', 'sesame', 'ajonjoli', 'tahini', 'tahina', 'hummus',
        'aceite de sesamo', 'gesti'
    ],
    // 9. CACAHUETES
    '9': [
        'cacahuete', 'peanut', 'mani', 'arachis', 'manteca de cacahuete',
        'aceite de cacahuete', 'manies'
    ],
    // 10. SOJA
    '10': [
        'soja', 'soy', 'soya', 'edamame', 'tofu', 'tempeh', 'miso', 'tamari', 'natto',
        'lecitina de soja', 'proteina de soja', 'harina de soja', 'aceite de soja',
        'glicina max'
    ],
    // 11. LECHE
    '11': [
        'leche', 'milk', 'lait', 'nata', 'cream', 'queso', 'cheese',
        'yogur', 'yogurt', 'mantequilla', 'butter', 'suero', 'whey',
        'lactosa', 'lactose', 'caseina', 'casein', 'caseinato', 'caseinate',
        'lactalbumina', 'lactalbumin', 'lactoglobulina',
        'cuajo', 'rennet', 'recuit', 'ghee', 'kefir', 'mazada'
    ],
    // 12. SULFITOS
    '12': [
        'sulfito', 'sulphite', 'bisulfito', 'metabisulfito', 'dioxido de azufre',
        'sulfur dioxide', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228',
        'agente de tratamiento de la harina'
    ],
    // 13. MOLUSCOS
    '13': [
        'molusco', 'mollusc', 'mejillon', 'mussel', 'almeja', 'clam',
        'sepia', 'cuttlefish', 'calamar', 'squid', 'pulpo', 'octopus',
        'berberecho', 'cockle', 'ostra', 'oyster', 'vieira', 'scallop',
        'caracol', 'snail', 'lapas'
    ],
    // 14. ALTRAMUCES
    '14': [
        'altramuc', 'altramuz', 'lupin', 'harina de altramuz'
    ]
};

// Generar Regex compiladas para máximo rendimiento
const ALLERGEN_REGEXES: Record<string, RegExp> = Object.entries(ALLERGEN_KEYWORDS).reduce((acc, [id, keywords]) => {
    // Escapar caracteres especiales y crear patrón con límites de palabra (\b)
    const pattern = keywords
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escapar regex
        .join('|');

    // Regex case-insensitive
    // \b asegura que coincida "leche" pero no "fleche" (si existiera)
    // Se permite coincidencia parcial al final para plurales simples en algunos casos
    acc[id] = new RegExp(`\\b(${pattern})`, 'i');
    return acc;
}, {} as Record<string, RegExp>);


/**
 * Función Principal de Detección
 * @param productTags Array de tags de la API (allergens_tags)
 * @param ingredientsText Texto completo de ingredientes
 * @returns Set de IDs de alérgenos detectados
 */
export const detectAllergens = (
    productTags: string[] = [],
    ingredientsText: string = ''
): Set<string> => {
    const detectedIds = new Set<string>();

    // 1. Análisis de Tags de la API (Rápido y fiable)
    productTags.forEach(tag => {
        // Normalizar tag (quitar prefijos de idioma extraños si los hay, aunque el mapa ya cubre en: etc)
        const cleanTag = tag.toLowerCase().trim();
        if (API_TAG_MAP[cleanTag]) {
            detectedIds.add(API_TAG_MAP[cleanTag]);
        }
    });

    // 2. Análisis de Texto Profundo (Regex sobre ingredientes)
    if (ingredientsText) {
        // Normalización previa del texto:
        // - Minúsculas
        // - Quitar tildes (para coincidir con keywords sin tildes)
        const normalizedText = ingredientsText
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar acentos

        Object.entries(ALLERGEN_REGEXES).forEach(([id, regex]) => {
            // Si ya se detectó por tag, saltar
            if (detectedIds.has(id)) return;

            if (regex.test(normalizedText)) {
                console.log(`[AllergenDetection] Detected ${id} via regex match`);
                detectedIds.add(id);
            }
        });
    }

    return detectedIds;
};

// Exportar keywords para debugging o UI
export { ALLERGEN_KEYWORDS };
