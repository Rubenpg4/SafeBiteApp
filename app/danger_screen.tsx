import {
  Allergen,
  AllergenResultScreen,
  Product,
} from "@/components/AllergenResultScreen";
import { Colors } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";

export default function DangerScreen() {
  const colors = Colors["light"];
  const params = useLocalSearchParams<{
    productName?: string;
    productBrand?: string;
    productImage?: string;
    ingredients?: string;
    allergens?: string;
    barcode?: string;
  }>();

  const parsedAllergens: Allergen[] = params.allergens
    ? JSON.parse(params.allergens)
    : [];

  const product: Product = {
    name: params.productName || "Producto desconocido",
    brand: params.productBrand || "Marca desconocida",
    image: params.productImage
      ? { uri: params.productImage }
      : null,
    ingredients: params.ingredients
      ? [params.ingredients]
      : ["Sin información de ingredientes"],
  };

  const allergens: Allergen[] = parsedAllergens;

  const handleScanAnother = () => {
    router.replace("/scan_screen");
  };

  return (
    <AllergenResultScreen
      accentColor={colors.error}
      backgroundColor={colors.background}
      topTitle="Alérgenos encontrados"
      topIconName="dangerous"
      topIconColor={colors.background}
      product={product}
      allergens={allergens}
      onPressSecondary={handleScanAnother}
    />
  );
}
