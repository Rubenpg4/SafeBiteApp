import { BottomNavbar } from "@/components/BottomNavbar";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type AllergenMock = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

// 14 alérgenos de declaración obligatoria (UE)
const ALLERGENS: AllergenMock[] = [
  { id: "gluten", label: "Cereales con gluten", icon: "cup" },
  { id: "crustaceos", label: "Crustáceos", icon: "cup" },
  { id: "huevos", label: "Huevos", icon: "cup" },
  { id: "pescado", label: "Pescado", icon: "cup" },
  { id: "cacahuetes", label: "Cacahuetes", icon: "cup" },
  { id: "soja", label: "Soja", icon: "cup" },
  { id: "leche", label: "Leche", icon: "cup" },
  { id: "frutos_cascara", label: "Frutos de cáscara", icon: "cup" },
  { id: "apio", label: "Apio", icon: "cup" },
  { id: "mostaza", label: "Mostaza", icon: "cup" },
  { id: "sesamo", label: "Sésamo", icon: "cup" },
  {
    id: "sulfitos",
    label: "Dióxido de azufre y sulfitos",
    icon: "cup",
  },
  { id: "altramuces", label: "Altramuces", icon: "cup" },
  { id: "moluscos", label: "Moluscos", icon: "cup" },
];

export default function ProfileScreen() {
  const colors = Colors.light;

  const [expanded, setExpanded] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([
    "gluten",
    "leche",
  ]);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedAllergens = React.useMemo(
    () => ALLERGENS.filter((a) => selectedSet.has(a.id)),
    [selectedSet],
  );

  const remainingAllergens = React.useMemo(
    () => ALLERGENS.filter((a) => !selectedSet.has(a.id)),
    [selectedSet],
  );

  const toggleAllergen = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      // Mantener un orden estable según ALLERGENS
      return ALLERGENS.filter((a) => next.has(a.id)).map((a) => a.id);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[Typography.h1, { color: colors.text }]}>Mi perfil</Text>

        <View style={[styles.card, { backgroundColor: "#FFFFFF" }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <Text style={[Typography.h3, { color: colors.text }]}>
                Mis alérgenos
              </Text>
              <Text
                style={[Typography.caption, { color: colors.textSecondary }]}
              >
                {selectedIds.length} seleccionados
              </Text>
            </View>

            <Pressable
              onPress={() => setExpanded((v) => !v)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                expanded ? "Cerrar selector" : "Editar alérgenos"
              }
            >
              <MaterialIcons name="edit" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: "#E6E6E6" }]} />

          <View style={styles.selectedRow}>
            {selectedAllergens.length === 0 ? (
              <Text
                style={[Typography.bodySmall, { color: colors.textSecondary }]}
              >
                No has seleccionado alérgenos.
              </Text>
            ) : (
              <View style={styles.iconRowWrap}>
                {selectedAllergens.map((a) => (
                  <AllergenIconButton
                    key={a.id}
                    icon={a.icon}
                    label={a.label}
                    selected={true}
                    accentColor={colors.success}
                    labelColor={colors.textSecondary}
                    onPress={() => toggleAllergen(a.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {expanded ? (
            <View style={styles.dropdown}>
              <Text
                style={[Typography.bodySmall, { color: colors.textSecondary }]}
              >
                Alérgenos restantes
              </Text>

              <View style={[styles.grid, { marginTop: Spacing.sm }]}>
                {remainingAllergens.map((a) => (
                  <AllergenIconButton
                    key={a.id}
                    icon={a.icon}
                    label={a.label}
                    selected={false}
                    accentColor={colors.success}
                    labelColor={colors.textSecondary}
                    containerStyle={styles.allergenTileGrid}
                    onPress={() => toggleAllergen(a.id)}
                  />
                ))}
              </View>

              <Pressable
                onPress={() => setExpanded(false)}
                style={({ pressed }) => [
                  styles.acceptButton,
                  { backgroundColor: colors.success },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Aceptar"
              >
                <Text style={[Typography.button, { color: "#FFFFFF" }]}>
                  Aceptar
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <BottomNavbar buttonColor={colors.success} homeHref="/(tabs)" />
    </View>
  );
}

function AllergenIconButton({
  icon,
  label,
  selected,
  accentColor,
  labelColor,
  containerStyle,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  selected: boolean;
  accentColor: string;
  labelColor: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.allergenTile,
        containerStyle,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View
        style={[
          styles.allergenCircle,
          {
            backgroundColor: selected ? "#EAF6F3" : "#F3F3F3",
            borderColor: selected ? accentColor : "#E2E2E2",
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={26}
          color={selected ? accentColor : "#777"}
        />
      </View>

      <Text
        style={[
          styles.allergenLabel,
          Typography.caption,
          { fontSize: 10, lineHeight: 12 },
          { color: labelColor },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const NAVBAR_SPACE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: Spacing.md,
    paddingBottom: NAVBAR_SPACE,
    gap: Spacing.lg,
  },

  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderText: {
    gap: 2,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: Spacing.sm,
  },

  selectedRow: {
    minHeight: 60,
    justifyContent: "center",
  },
  iconRowWrap: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  dropdown: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  allergenTile: {
    flexBasis: "25%",
    maxWidth: "25%",
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
  },
  allergenTileGrid: {
    paddingHorizontal: 0,
  },
  allergenCircle: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  allergenLabel: {
    textAlign: "center",
  },

  acceptButton: {
    alignSelf: "center",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
});
