import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Typography } from "@/constants";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type TopBoxProps = {
  title: string;
  backgroundColor: string;

  height?: number;

  radius?: number;
  rightOffset?: number;

  semiCircleColor?: string;

  iconName?: MaterialIconName;
  iconSize?: number;
  iconColor?: string;
};

export function TopBox({
  title,
  backgroundColor,
  height = 200,
  radius = 44,
  rightOffset = 16,
  semiCircleColor,
  iconName = "check-circle",
  iconSize = 50,
  iconColor = "#FFFFFF",
}: TopBoxProps) {
  const diameter = radius * 2;
  const circleColor = semiCircleColor ?? backgroundColor;

  return (
    <View style={[styles.topBox, { backgroundColor, height }]}>
      <Text style={[styles.topBoxTitle, { color: "#FFFFFF" }]}>{title}</Text>

      {/* Semicírculo que cuelga hacia abajo */}
      <View
        style={[
          styles.semiCircleWrap,
          {
            right: rightOffset,
            bottom: -radius,
            width: diameter,
            height: radius,
          },
        ]}
      >
        <View
          style={[
            styles.semiCircle,
            {
              top: -radius,
              width: diameter,
              height: diameter,
              borderRadius: radius,
              backgroundColor: circleColor,
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.circleIconOverlay,
          {
            right: rightOffset,
            bottom: -radius,
            width: diameter,
            height: diameter,
          },
        ]}
      >
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBox: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
    position: "relative",
  },

  topBoxTitle: {
    fontFamily: Typography.h1.fontFamily,
    fontSize: Typography.h1.fontSize,
  },

  semiCircleWrap: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  semiCircle: {
    position: "absolute",
    left: 0,
  },

  circleIconOverlay: {
    position: "absolute",
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
