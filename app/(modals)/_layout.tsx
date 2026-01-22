import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Aquí se renderizarán automáticamente los archivos 
         que tengas dentro de la carpeta (ej: safe_screen.tsx) 
      */}
    </Stack>
  );
}