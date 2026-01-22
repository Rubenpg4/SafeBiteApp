import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_900Black,
  Montserrat_900Black_Italic,
} from '@expo-google-fonts/montserrat';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth';
import { ProductHistoryProvider } from '@/contexts/productHistory';
import { UserPreferencesProvider } from '@/contexts/userPreferences';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading, hasCompletedAllergiesSetup } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inAllergies = segments[0] === 'onboarding' && segments[1] === 'allergies';
    const inAuth = segments[0] === 'login' || segments[0] === 'register';

    // Pantallas sueltas que requieren autenticación
    // Pantallas sueltas que requieren autenticación
    const protectedScreens = ['profile_screen'];
    const isProtectedScreen = protectedScreens.includes(segments[0] as string);

    // Si el usuario está en el onboarding inicial (carrusel), no hacer redirección
    if (inOnboarding && !inAllergies) return;

    if (user) {
      // Usuario logueado
      if (!hasCompletedAllergiesSetup && !inAllergies) {
        // Primera vez: ir a selección de alergias
        router.replace('/onboarding/allergies');
      } else if (hasCompletedAllergiesSetup && (inAuth || inOnboarding)) {
        // Si ya tiene todo listo y está intentar entrar a auth/onboarding -> mandar al home
        // PERO permitir estar en otras pantallas como scan_screen, profile, etc.
        router.replace('/(tabs)');
      }
    } else if (!user && (inTabsGroup || inAllergies || isProtectedScreen)) {
      // No logueado intentando acceder a área protegida
      router.replace('/login');
    }
  }, [user, loading, hasCompletedAllergiesSetup, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="onboarding/allergies" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="safe_screen" options={{ headerShown: false }} />
        <Stack.Screen name="danger_screen" options={{ headerShown: false }} />
        <Stack.Screen name="guest_warning_screen" options={{ headerShown: false }} />
        <Stack.Screen name="search_screen" options={{ headerShown: false }} />

        <Stack.Screen name="profile_screen" options={{ headerShown: false }} />
        <Stack.Screen name="scan_screen" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_900Black,
    Montserrat_900Black_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <ProductHistoryProvider>
          <RootLayoutNav />
        </ProductHistoryProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
}
