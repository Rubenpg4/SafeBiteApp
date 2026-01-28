import {
    Allergen,
    AllergenResultScreen,
    Product,
} from "@/components/AllergenResultScreen";
import { Colors } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";

export default function GuestWarningScreen() {
    const warningColor = "#E8BB62";
    const backgroundColor = Colors["light"].background;

    const params = useLocalSearchParams<{
        productName?: string;
        productBrand?: string;
        productImage?: string;
        ingredients?: string;
        allergens?: string;
        barcode?: string;
        title?: string;
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

    const handleScanAnother = () => {
        router.replace("/scan_screen");
    };

    return (
        <AllergenResultScreen
            accentColor={warningColor}
            backgroundColor={backgroundColor}
            topTitle={params.title || `Alérgenos\ndetectados`}
            topIconName="warning" // or 'priority-high' or similar suitable icon
            topIconColor={backgroundColor}
            product={product}
            allergens={parsedAllergens}
            onPressSecondary={handleScanAnother}
        />
    );
}
