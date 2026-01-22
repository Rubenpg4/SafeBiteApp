
import { ALLERGENS_DATA } from "@/constants/allergens";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface AllergenIconProps {
    id: string;
    size?: number;
    highlighted?: boolean;
    style?: ViewStyle;
}

export const AllergenIcon: React.FC<AllergenIconProps> = ({
    id,
    size = 40,
    highlighted = false,
    style
}) => {
    const allergen = ALLERGENS_DATA[id];

    if (!allergen) {
        // Fallback for special IDs
        const fallbackIconName = id === 'unknown' ? 'help' : (id === 'none' ? 'check' : 'alert');
        const fallbackColor = id === 'unknown' ? '#FFA000' : (id === 'none' ? '#5CBFB3' : '#BDBDBD');
        const iconColor = highlighted ? '#FFFFFF' : '#888888';

        return (
            <View
                style={[
                    styles.container,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: highlighted ? fallbackColor : '#F5F5F5',
                        opacity: highlighted ? 1 : 0.5,
                    },
                    style
                ]}
            >
                <MaterialCommunityIcons name={fallbackIconName as any} size={size * 0.6} color={iconColor} />
            </View>
        );
    }

    const wrapperSize = size;
    const imageSize = size * 0.95; // La imagen ocupa casi todo el círculo

    return (
        <View
            style={[
                styles.container,
                {
                    width: wrapperSize,
                    height: wrapperSize,
                    borderRadius: wrapperSize / 2,
                    backgroundColor: highlighted ? allergen.color : '#F5F5F5',
                    opacity: highlighted ? 1 : 0.5, // Opcional: difuminar si no está resaltado
                },
                style
            ]}
        >
            <Image
                source={allergen.image}
                style={{ width: imageSize, height: imageSize }}
                contentFit="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
});
