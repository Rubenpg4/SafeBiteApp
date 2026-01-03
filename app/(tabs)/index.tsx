import { Button, StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '@/constants';
import { useAuth } from '@/contexts/auth';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const colors = Colors['light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>
        Hola {user?.displayName || 'Usuario'}
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Cerrar sesión" onPress={logout} color={Colors.light.error} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});