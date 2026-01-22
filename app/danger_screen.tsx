import {
  Allergen,
  AllergenResultScreen,
  Product,
} from "@/components/AllergenResultScreen";
import { Colors } from "@/constants";
import React from "react";

export default function DangerScreen() {
  const colors = Colors["light"];

  // Datos mock para la UI. Sustituirás esto por datos reales cuando conectéis lógica.
  const product: Product = {
    name: "Leche entera",
    brand: "Mercadona",
    image: require("@/assets/leche.jpeg"),
    ingredients: [
      "LECHE entera de vaca, estabilizantes (E-331, E-339), vitamina D3, corrector de acidez (E-331), ferro quelado con EDTA, aromas, conservador (E-202).",
    ],
  };

  const allergens: Allergen[] = [
    { id: "lacteos", label: "Lácteos", icon: "cup" },
    { id: "sulfitos", label: "Sulfitos", icon: "chemical-weapon" },
    { id: "frutos", label: "Frutos con cáscara", icon: "nut" },
  ];

  return (
    <AllergenResultScreen
      accentColor={colors.danger}
      backgroundColor={colors.background}
      topTitle="Alérgenos encontrados"
      topIconName="dangerous"
      topIconColor={colors.background}
      product={product}
      allergens={allergens}
    />
  );
}
