import { BottomNavbar } from "@/components/BottomNavbar";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { useAuth } from "@/contexts/auth";
import { useUserPreferences } from "@/contexts/userPreferences";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AllergenIcon } from "@/components/AllergenIcon";
import { getAllergensList } from "@/constants/allergens";

// Obtenemos la lista ordenada de alérgenos desde nuestra fuente central
const ALLERGENS_LIST = getAllergensList();

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { userAllergens, updateUserAllergens } = useUserPreferences();
  const colors = Colors.light;

  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(userAllergens);
  }, [userAllergens]);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedAllergensList = React.useMemo(
    () => ALLERGENS_LIST.filter((a) => selectedSet.has(a.id)),
    [selectedSet],
  );

  const remainingAllergensList = React.useMemo(
    () => ALLERGENS_LIST.filter((a) => !selectedSet.has(a.id)),
    [selectedSet],
  );

  const toggleAllergen = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      // Mantenemos el orden original basado en ALLERGENS_LIST
      return ALLERGENS_LIST.filter((a) => next.has(a.id)).map((a) => a.id);
    });
  };

  const saveChanges = async () => {
    await updateUserAllergens(selectedIds);
    setExpanded(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

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
            {selectedAllergensList.length === 0 ? (
              <Text
                style={[Typography.bodySmall, { color: colors.textSecondary }]}
              >
                No has seleccionado alérgenos.
              </Text>
            ) : (
              <View style={styles.iconRowWrap}>
                {selectedAllergensList.map((a) => (
                  <AllergenIconButton
                    key={a.id}
                    id={a.id}
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
                {remainingAllergensList.map((a) => (
                  <AllergenIconButton
                    key={a.id}
                    id={a.id}
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
                onPress={saveChanges}
                style={({ pressed }) => [
                  styles.acceptButton,
                  { backgroundColor: colors.success },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Aceptar"
              >
                <Text style={[Typography.button, { color: "#FFFFFF" }]}>
                  Guardar cambios
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.9 },
          ]}
        >
          <MaterialIcons name="logout" size={20} color="#FF3B30" />
          <Text style={[Typography.button, { color: "#FF3B30", marginLeft: 8 }]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNavbar buttonColor={colors.success} homeHref="/(tabs)" />
    </View>
  );
}

function AllergenIconButton({
  id,
  label,
  selected,
  accentColor,
  labelColor,
  containerStyle,
  onPress,
}: {
  id: string; // Recibimos el ID para usar AllergenIcon
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
        {/* Usamos el nuevo componente de icono que renderiza el SVG */}
        <AllergenIcon
          id={id}
          size={52}
          highlighted={false} // Controlamos el color de fondo manualmente en el View padre si queremos, o usamos este prop
          style={{ backgroundColor: 'transparent' }} // Override del background porque lo maneja el padre
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
    width: 60, // Aumentado ligeramente para mejor visualización del SVG
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    overflow: 'hidden', // Importante para que no se salga la imagen
  },
  allergenLabel: {
    textAlign: "center",
    marginTop: 4,
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#FFF0F0",
    marginTop: Spacing.xl,
  },
});
