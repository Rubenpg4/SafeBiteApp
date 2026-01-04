import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // Ocultar completamente el tab bar
                tabBarStyle: { display: 'none' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                }}
            />
        </Tabs>
    );
}
