// components/BottomNavbar.tsx
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Href } from "expo-router";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type BottomNavbarProps = {
  height?: number;
  bottomOffset?: number;
  sideOffset?: number;

  buttonColor: string;

  homeHref?: Href;
  homeButtonSize?: number;
  homeIconName?: MaterialIconName;
  homeIconSize?: number;
  homeIconColor?: string;

  secondaryHref?: Href;
  onPressSecondary?: () => void;
  secondaryButtonSize?: number;
  secondaryIconName?: MaterialIconName;
  secondaryIconSize?: number;
  secondaryIconColor?: string;
  secondaryA11yLabel?: string;
};

export function BottomNavbar({
  height = 130,
  bottomOffset = 18,
  sideOffset = 22,

  buttonColor,

  homeHref = "/",
  homeButtonSize = 80,
  homeIconName = "home",
  homeIconSize = 50,
  homeIconColor = "#FFFFFF",

  secondaryHref,
  onPressSecondary,
  secondaryButtonSize = 56,
  secondaryIconName = "autorenew",
  secondaryIconSize = 30,
  secondaryIconColor = "#FFFFFF",
  secondaryA11yLabel = "Acción secundaria",
}: BottomNavbarProps) {
  const homeRadius = homeButtonSize / 2;
  const secondaryRadius = secondaryButtonSize / 2;

  /*   const SecondaryPressable = (
    <Pressable
      onPress={onPressSecondary}
      disabled={!onPressSecondary && !secondaryHref}
      style={[
        styles.secondaryButton,
        {
          right: sideOffset,
          bottom: bottomOffset + 8,
          width: secondaryButtonSize,
          height: secondaryButtonSize,
          borderRadius: secondaryRadius,
          backgroundColor: buttonColor,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={secondaryA11yLabel}
    >
      <MaterialIcons
        name={secondaryIconName}
        size={secondaryIconSize}
        color={secondaryIconColor}
      />
    </Pressable>
  ); */

  return (
    <View pointerEvents="box-none" style={[styles.container, { height }]}>
      <View pointerEvents="box-none" style={styles.inner}>
        {/* Home centrado REAL (no depende de alignItems) */}
        <Pressable
          onPress={() => router.push(homeHref)}
          style={({ pressed }) => [
            styles.homeButton,
            {
              left: "50%",
              transform: [
                { translateX: -homeRadius },
                { scale: pressed ? 0.98 : 1 },
              ],
              bottom: pressed ? bottomOffset - 1 : bottomOffset,
              width: homeButtonSize,
              height: homeButtonSize,
              borderRadius: homeRadius,
              backgroundColor: buttonColor,
              shadowOpacity: pressed ? 0.14 : 0.18,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Ir a Home"
        >
          <MaterialIcons
            name={homeIconName}
            size={homeIconSize}
            color={homeIconColor}
          />
        </Pressable>

        {/* Botón derecho */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              right: sideOffset,
              transform: [{ scale: pressed ? 0.985 : 1 }],
              bottom: pressed ? bottomOffset + 7 : bottomOffset + 8,
              width: secondaryButtonSize,
              height: secondaryButtonSize,
              borderRadius: secondaryRadius,
              backgroundColor: buttonColor,
              shadowOpacity: pressed ? 0.1 : 0.14,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={secondaryA11yLabel}
        >
          <MaterialIcons
            name={secondaryIconName}
            size={secondaryIconSize}
            color={secondaryIconColor}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  inner: {
    flex: 1,
    position: "relative", // importante para left/right/bottom absolutos
  },

  homeButton: {
    position: "absolute",
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  secondaryButton: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
});
