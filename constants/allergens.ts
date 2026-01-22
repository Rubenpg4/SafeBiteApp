
import { ImageSourcePropType } from "react-native";

export interface AllergenDef {
    id: string;
    label: string;
    color: string;
    image: ImageSourcePropType;
}

export const ALLERGENS_DATA: Record<string, AllergenDef> = {
    '1': {
        id: '1',
        label: 'Cereales con gluten',
        color: '#E78054',
        image: require('@/assets/images/Alergenos/gluten_allergen_food_allergens_icon_183726.svg')
    },
    '2': {
        id: '2',
        label: 'Crustáceos',
        color: '#A65748',
        image: require('@/assets/images/Alergenos/crustacean_allergen_food_allergens_icon_183733.svg')
    },
    '3': {
        id: '3',
        label: 'Huevos',
        color: '#DFBC65',
        image: require('@/assets/images/Alergenos/egg_allergen_food_allergens_icon_183730.svg')
    },
    '4': {
        id: '4',
        label: 'Pescado',
        color: '#2E8B9E',
        image: require('@/assets/images/Alergenos/fish_allergen_food_allergens_icon_183728.svg')
    },
    '5': {
        id: '5',
        label: 'Frutos de cáscara',
        color: '#7C4E3F',
        image: require('@/assets/images/Alergenos/nuts_allergen_food_allergens_icon_183722.svg')
    },
    '6': {
        id: '6',
        label: 'Apio',
        color: '#88B04B',
        image: require('@/assets/images/Alergenos/celery_allergen_food_allergens_icon_183723.svg')
    },
    '7': {
        id: '7',
        label: 'Mostaza',
        color: '#F2BD2E',
        image: require('@/assets/images/Alergenos/mustard_allergen_food_allergens_icon_183732.svg')
    },
    '8': {
        id: '8',
        label: 'Sésamo',
        color: '#F7B983',
        image: require('@/assets/images/Alergenos/sesame_allergen_food_allergens_icon_183729.svg')
    },
    '9': {
        id: '9',
        label: 'Cacahuetes',
        color: '#C99F83',
        image: require('@/assets/images/Alergenos/peanuts_allergen_food_allergens_icon_183731.svg')
    },
    '10': {
        id: '10',
        label: 'Soja',
        color: '#8DAF66',
        image: require('@/assets/images/Alergenos/soy_allergen_food_allergens_icon_183721.svg')
    },
    '11': {
        id: '11',
        label: 'Lácteos',
        color: '#A06DA5',
        image: require('@/assets/images/Alergenos/milk_allergen_food_allergens_icon_183724.svg')
    },
    '12': {
        id: '12',
        label: 'Sulfitos',
        color: '#006FB6',
        image: require('@/assets/images/Alergenos/sulfites_allergen_food_allergens_icon_183725.svg')
    },
    '13': {
        id: '13',
        label: 'Moluscos',
        color: '#707070',
        image: require('@/assets/images/Alergenos/shellfish_allergen_food_allergens_icon_183727.svg')
    },
    '14': {
        id: '14',
        label: 'Altramuces',
        color: '#F2B16D',
        image: require('@/assets/images/Alergenos/lupins_allergen_food_allergens_icon_183720.svg')
    },
};

// Helper para obtener datos fácil
export const getAllergenById = (id: string): AllergenDef | undefined => {
    return ALLERGENS_DATA[id];
};

export const getAllergensList = (): AllergenDef[] => {
    return Object.values(ALLERGENS_DATA).sort((a, b) => parseInt(a.id) - parseInt(b.id));
};
