import {
    Allergen,
    AllergenResultScreen,
    Product,
} from "@/components/AllergenResultScreen";
import { Colors } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";

export default function SafeScreen() {
  const colors = Colors["light"];
  const params = useLocalSearchParams<{
    productName?: string;
    productBrand?: string;
    productImage?: string;
    ingredients?: string;
    allergens?: string;
    barcode?: string;
  }>();

  // Parsear alérgenos del parámetro JSON
  const parsedAllergens: Allergen[] = params.allergens
    ? JSON.parse(params.allergens)
    : [];

  // Construir el producto con los datos recibidos o usar valores por defecto
  const product: Product = {
    name: params.productName || "Producto desconocido",
    brand: params.productBrand || "Marca desconocida",
    image: params.productImage
      ? { uri: params.productImage }
      : require("@/assets/leche.jpeg"),
    ingredients: params.ingredients
      ? [params.ingredients]
      : ["Sin información de ingredientes"],
  };

  // Usar los alérgenos parseados o un array vacío
  const allergens: Allergen[] =
    parsedAllergens.length > 0
      ? parsedAllergens
      : [
          {
            id: "none",
            label: "Sin alérgenos detectados",
            icon: "check-circle",
          },
        ];

  const handleScanAnother = () => {
    router.replace("/scan_screen");
  };

  return (
    <AllergenResultScreen
      accentColor={colors.success}
      backgroundColor={colors.background}
      topTitle="Producto seguro"
      topIconName="check-circle"
      topIconColor={colors.background}
      product={product}
      allergens={allergens}
      onPressSecondary={handleScanAnother}
    />
  );
}
