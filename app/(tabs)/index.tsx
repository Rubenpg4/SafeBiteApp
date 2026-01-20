import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Typography } from "@/constants";
import { useColorScheme } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors["light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, { color: colors.text }]}>Funciona</Text>

      <Pressable
        style={[styles.button, { backgroundColor: colors.danger }]}
        onPress={() => router.push("../warning_screen")}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Ir a warning Screen
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: colors.success }]}
        onPress={() => router.push("../profile_screen")}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Ir a perfil
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: colors.success }]}
        onPress={() => router.push("../safe_screen")}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Ir a safe Screen
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: colors.danger }]}
        onPress={() => router.push("../danger_screen")}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          Ir a danger Screen
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
