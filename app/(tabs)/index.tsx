import { StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '@/constants';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors['light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, { color: colors.text }]}>Funciona</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});