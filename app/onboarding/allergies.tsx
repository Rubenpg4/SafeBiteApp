import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/auth';
import { useUserPreferences } from '@/contexts/userPreferences';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Using existing project constants + defining local specific ones using values from user request
const theme = Colors.light;

interface AllergyItemType {
    id: string;
    label: string;
    color: string;
    image: any; // Changed to any to support require()
}

const ALLERGY_DATA: AllergyItemType[] = [
    { id: '1', label: 'CEREALES\nCON GLUTEN', color: '#E78054', image: require('@/assets/images/Alergenos/gluten_allergen_food_allergens_icon_183726.svg') },
    { id: '2', label: 'CRUSTÁCEOS', color: '#A65748', image: require('@/assets/images/Alergenos/crustacean_allergen_food_allergens_icon_183733.svg') },
    { id: '3', label: 'HUEVOS', color: '#DFBC65', image: require('@/assets/images/Alergenos/egg_allergen_food_allergens_icon_183730.svg') },
    { id: '4', label: 'PESCADO', color: '#2E8B9E', image: require('@/assets/images/Alergenos/fish_allergen_food_allergens_icon_183728.svg') },
    { id: '5', label: 'FRUTOS DE\nCÁSCARA', color: '#7C4E3F', image: require('@/assets/images/Alergenos/nuts_allergen_food_allergens_icon_183722.svg') },
    { id: '6', label: 'APIO', color: '#88B04B', image: require('@/assets/images/Alergenos/celery_allergen_food_allergens_icon_183723.svg') },
    { id: '7', label: 'MOSTAZA', color: '#F2BD2E', image: require('@/assets/images/Alergenos/mustard_allergen_food_allergens_icon_183732.svg') },
    { id: '8', label: 'GRANOS DE\nSÉSAMO', color: '#F7B983', image: require('@/assets/images/Alergenos/sesame_allergen_food_allergens_icon_183729.svg') },
    { id: '9', label: 'CACAHUETES', color: '#C99F83', image: require('@/assets/images/Alergenos/peanuts_allergen_food_allergens_icon_183731.svg') },
    { id: '10', label: 'SOJA', color: '#8DAF66', image: require('@/assets/images/Alergenos/soy_allergen_food_allergens_icon_183721.svg') },
    { id: '11', label: 'LÁCTEOS', color: '#A06DA5', image: require('@/assets/images/Alergenos/milk_allergen_food_allergens_icon_183724.svg') },
    { id: '12', label: 'SULFITOS', color: '#006FB6', image: require('@/assets/images/Alergenos/sulfites_allergen_food_allergens_icon_183725.svg') },
    { id: '13', label: 'MOLUSCOS', color: '#707070', image: require('@/assets/images/Alergenos/shellfish_allergen_food_allergens_icon_183727.svg') },
    { id: '14', label: 'ALTRAMUCES', color: '#F2B16D', image: require('@/assets/images/Alergenos/lupins_allergen_food_allergens_icon_183720.svg') },
];

const AllergyItem = ({ item, isSelected, onPress }: { item: AllergyItemType, isSelected: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[
                styles.iconWrapper,
                isSelected && styles.iconWrapperSelected
            ]}>
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                    <Image
                        source={item.image}
                        style={styles.allergyImage}
                        contentFit="contain"
                    />
                </View>

                {isSelected && (
                    <View style={styles.checkmarkBadge}>
                        <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                )}
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
        </TouchableOpacity>
    );
};

export default function AllergySelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ fromRegistration?: string; email?: string; password?: string }>();
    const { setAllergiesSetupComplete } = useAuth();
    const { updateUserAllergens } = useUserPreferences();
    const [selectedAllergies, setSelectedAllergies] = useState(['9', '10', '11', '14']);

    const toggleAllergy = (id: string) => {
        if (selectedAllergies.includes(id)) {
            setSelectedAllergies(selectedAllergies.filter(itemId => itemId !== id));
        } else {
            setSelectedAllergies([...selectedAllergies, id]);
        }
    };

    const handleStartPress = async () => {
        console.log("Alergias seleccionadas para enviar:", selectedAllergies);

        // Guardar preferencias del usuario (esto ya usa AsyncStorage internamente)
        await updateUserAllergens(selectedAllergies);

        // Marcar que ya se completó la configuración inicial
        await setAllergiesSetupComplete();

        // Navegar a la pantalla principal
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <View style={styles.headerContainer}>
                <Text
                    style={styles.title}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    Selecciona tus alergias
                </Text>
            </View>

            {/* Replacement of FlatList with custom Flex Grid */}
            <View style={styles.gridContainer}>
                {/* Row 1: 4 items */}
                <View style={styles.row}>
                    {ALLERGY_DATA.slice(0, 4).map((item) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <AllergyItem
                                item={item}
                                isSelected={selectedAllergies.includes(item.id)}
                                onPress={() => toggleAllergy(item.id)}
                            />
                        </View>
                    ))}
                </View>
                {/* Row 2: 4 items */}
                <View style={styles.row}>
                    {ALLERGY_DATA.slice(4, 8).map((item) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <AllergyItem
                                item={item}
                                isSelected={selectedAllergies.includes(item.id)}
                                onPress={() => toggleAllergy(item.id)}
                            />
                        </View>
                    ))}
                </View>
                {/* Row 3: 3 items */}
                <View style={styles.row}>
                    {ALLERGY_DATA.slice(8, 11).map((item) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <AllergyItem
                                item={item}
                                isSelected={selectedAllergies.includes(item.id)}
                                onPress={() => toggleAllergy(item.id)}
                            />
                        </View>
                    ))}
                </View>
                {/* Row 4: 3 items */}
                <View style={styles.row}>
                    {ALLERGY_DATA.slice(11, 14).map((item) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <AllergyItem
                                item={item}
                                isSelected={selectedAllergies.includes(item.id)}
                                onPress={() => toggleAllergy(item.id)}
                            />
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
                    <Text style={styles.startButtonText}>Empezar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 30,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
    },
    gridContainer: {
        flex: 1, // Fill available vertical space
        paddingHorizontal: 10,
        paddingBottom: 20,
        justifyContent: 'space-between', // Distribute rows vertically
    },
    row: {
        flexDirection: 'row',
        flex: 1, // Each row takes equal vertical portion
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemWrapper: {
        flex: 1, // Each item takes equal horizontal portion in the row
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    itemContainer: {
        // Removed fixed width
        // width: ITEM_WIDTH - 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        // Removed marginBottom as spacing is handled by flex
    },
    iconWrapper: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
        marginBottom: 8,
        position: 'relative',
        flexShrink: 0, // Ensure it doesn't shrink in 4-item rows
    },
    iconWrapperSelected: {
        borderColor: '#65C2BD', // Hardcoded specific color from request as it matches design
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    allergyImage: {
        width: '120%',
        height: '120%',
    },
    iconPlaceholderTxt: {
        opacity: 0.5
    },
    checkmarkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#65C2BD',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.background,
    },
    checkmarkText: {
        color: theme.white,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: -2
    },
    itemLabel: {
        fontSize: 11,
        color: theme.text,
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 14,
        height: 28, // Fixed height for 2 lines to ensure icon alignment
        textAlignVertical: 'top', // Find alignment for Android if needed
    },
    footerContainer: {
        padding: 24,
        backgroundColor: theme.background,
    },
    startButton: {
        backgroundColor: theme.success, // Using project success color which is mint-like
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonText: {
        color: theme.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
