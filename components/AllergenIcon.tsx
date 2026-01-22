
import { ALLERGENS_DATA } from "@/constants/allergens";
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
        // Si no existe, no renderizamos nada o un placeholder
        return null;
    }

    const wrapperSize = size;
    const imageSize = size * 0.6; // La imagen es un poco más pequeña que el círculo

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
