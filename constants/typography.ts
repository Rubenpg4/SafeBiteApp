import { TextStyle } from "react-native";
import { FontFamily } from "./fonts";

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: FontFamily.montserrat.bold,
    fontSize: FontSize.xxxl,
    lineHeight: 48,
  },
  h2: {
    fontFamily: FontFamily.montserrat.bold,
    fontSize: FontSize.xxl,
    lineHeight: 40,
  },
  h3: {
    fontFamily: FontFamily.montserrat.semibold,
    fontSize: FontSize.xl,
    lineHeight: 32,
  },
  body: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.inter.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  button: {
    fontFamily: FontFamily.inter.semibold,
    fontSize: FontSize.md,
    lineHeight: 24,
  },
};
