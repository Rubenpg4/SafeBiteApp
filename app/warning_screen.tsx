/* IMPORTS */
import { BottomNavbar } from "@/components/BottomNavbar";
import { TopBox } from "@/components/TopBox";
import { Colors, FontFamily } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* TIPOS */
type Allergen = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

type Product = {
  name: string;
  brand: string;
  image: ImageSourcePropType;
  ingredientsTitle?: string; // ej: "Ingredientes"
  ingredients: string[];
};

type AllergenResultScreenProps = {
  accentColor: string; // danger/success
  backgroundColor: string;
  topTitle: string;
  topIconName: string; // lo que espera tu TopBox
  topIconColor: string;
  topIconSize?: number;

  product: Product;
  allergens: Allergen[];

  onPressBrand?: () => void;
  onPressMoreInfo?: () => void;
};

/* PANTALLA */
function AllergenResultScreen({
  accentColor,
  backgroundColor,
  topTitle,
  topIconName,
  topIconColor,
  topIconSize = 50,
  product,
  allergens,
  onPressBrand,
  onPressMoreInfo,
}: AllergenResultScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      {/* Barra superior de color */}
      <TopBox
        title={topTitle}
        backgroundColor={accentColor}
        iconName={topIconName as any}
        iconSize={topIconSize}
        iconColor={topIconColor}
      />

      {/* Cuerpo */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nombre del producto y marca */}
        <ProductHeader
          name={product.name}
          brand={product.brand}
          onPressBrand={onPressBrand}
        />

        {/* Card para la foto e ingredientes */}
        <View style={styles.productRow}>
          <ProductCard image={product.image} />

          <IngredientsCard
            ingredientsTitle={product.ingredientsTitle ?? "Ingredientes"}
            ingredients={product.ingredients}
          />
        </View>

        {/* Sección de alérgenos y mas info*/}
        <AllergenSection
          title="Alérgenos en este producto"
          allergens={allergens}
        />

        <MoreInfo brand={product.brand} onPress={onPressMoreInfo} />
      </ScrollView>

      <BottomNavbar
        buttonColor={accentColor}
        homeHref="/(tabs)"
        secondaryIconName="autorenew"
        onPressSecondary={() => {
          // refresh / re-scan
        }}
      />
    </View>
  );
}

/** ---------- Pantalla “Peligro” usando el layout reutilizable ---------- */

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
      accentColor={colors.warning}
      backgroundColor={colors.background}
      topTitle="Alérgenos encontrados"
      topIconName="report"
      topIconColor={colors.background}
      product={product}
      allergens={allergens}
      onPressBrand={() => {
        // navegación o acción
      }}
      onPressMoreInfo={() => {
        // navegación o acción
      }}
    />
  );
}

/** ---------------- Components (modulares y reutilizables) ---------------- */

function ProductHeader({
  name,
  brand,
  onPressBrand,
}: {
  name: string;
  brand: string;
  onPressBrand?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.productName}>{name}</Text>

      <Pressable
        onPress={onPressBrand}
        hitSlop={8}
        style={({ pressed }) => [styles.brandRow, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.brandText}>{brand}</Text>
        <View style={styles.brandUnderline} />
      </Pressable>
    </View>
  );
}

function ProductCard({ image }: { image: ImageSourcePropType }) {
  return (
    <View style={styles.cardLeftShadow}>
      <View style={styles.cardLeftClip}>
        <Image source={image} style={styles.productImage} resizeMode="cover" />
      </View>
    </View>
  );
}

function IngredientsCard({
  ingredientsTitle,
  ingredients,
}: {
  ingredientsTitle: string;
  ingredients: string[];
}) {
  return (
    <View style={styles.ingredientsCard}>
      <Text style={styles.cardTitle}>{ingredientsTitle}</Text>
      <IngredientsList items={ingredients} />
    </View>
  );
}

function IngredientsList({ items }: { items: string[] }) {
  return (
    <View style={styles.ingredients}>
      {items.map((t, idx) => (
        <Text key={`${t}-${idx}`} style={styles.ingredientText}>
          {t}
        </Text>
      ))}
    </View>
  );
}

function AllergenSection({
  title,
  allergens,
}: {
  title: string;
  allergens: Allergen[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.allergenGrid}>
        {allergens.map((a) => (
          <AllergenTile key={a.id} label={a.label} icon={a.icon} />
        ))}
      </View>
    </View>
  );
}

function AllergenTile({
  label,
  icon,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}) {
  return (
    <View style={styles.allergenTile}>
      <View style={styles.allergenIconWrap}>
        <MaterialCommunityIcons name={icon} size={22} color="#5A2D82" />
      </View>
      <Text style={styles.allergenLabel} numberOfLines={3}>
        {label}
      </Text>
    </View>
  );
}

function MoreInfo({ brand, onPress }: { brand: string; onPress?: () => void }) {
  return (
    <View style={styles.moreInfo}>
      <Text style={styles.moreInfoLabel}>Más información:</Text>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        <Text style={styles.moreInfoLink}>{brand}</Text>
        <View style={styles.moreInfoUnderline} />
      </Pressable>
    </View>
  );
}

/** ---------------- Styles ---------------- */

const NAVBAR_SPACE = 160;

const styles = StyleSheet.create({
  container: { flex: 1 },

  scroll: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: NAVBAR_SPACE,
    alignItems: "center",
  },
  header: {
    width: "100%",
    marginTop: 4,
    marginBottom: 10,
  },
  productName: {
    fontSize: 34,
    fontFamily: FontFamily.montserrat.bold,
    color: "#111",
    letterSpacing: -0.3,
  },
  brandRow: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  brandText: {
    fontSize: 16,
    fontFamily: FontFamily.inter.medium,
    color: "#6B6B6B",
  },
  brandUnderline: {
    marginTop: 3,
    height: 2,
    width: 90,
    backgroundColor: "#2C7BE5",
    borderRadius: 2,
  },
  productRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  card: {
    width: "100%",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 14,
  },
  cardLeftShadow: {
    width: 150,
    height: 150,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardLeftClip: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.montserrat.semibold,
    color: "#111",
    marginBottom: 6,
  },
  ingredientsCard: {
    flex: 1,
    flexShrink: 1,
    justifyContent: "center",
  },
  ingredients: {
    gap: 4,
  },
  ingredientText: {
    fontSize: 11,
    fontFamily: FontFamily.inter.regular,
    color: "#6B6B6B",
    lineHeight: 18,
  },
  section: {
    width: "100%",
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.montserrat.semibold,
    color: "#111",
    marginBottom: 12,
  },
  allergenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 12,
  },
  allergenTile: {
    width: "18%",
    alignItems: "center",
    gap: 8,
  },
  allergenIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFE7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  allergenLabel: {
    fontSize: 13,
    fontFamily: FontFamily.inter.regular,
    color: "#5A2D82",
    fontWeight: "700",
    textAlign: "center",
  },
  moreInfo: {
    width: "100%",
    marginTop: 16,
  },
  moreInfoLabel: {
    fontSize: 12,
    color: "#8A8A8A",
    fontFamily: FontFamily.inter.regular,
    marginBottom: 4,
  },
  moreInfoLink: {
    fontSize: 12,
    fontFamily: FontFamily.inter.regular,
    color: "#8A8A8A",
  },
  moreInfoUnderline: {
    marginTop: 2,
    height: 1,
    width: 84,
    backgroundColor: "#BDBDBD",
  },
});
