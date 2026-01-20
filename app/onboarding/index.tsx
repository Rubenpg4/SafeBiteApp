import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import OnBoarding1 from '../../assets/images/OnBoarding/OnBoarding1.png';
import OnBoarding2 from '../../assets/images/OnBoarding/OnBoarding2.png';
import OnBoarding3 from '../../assets/images/OnBoarding/OnBoarding3.png';
import { Colors } from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';

// 1. DATA: Definimos el contenido aquí para no "hardcodear" las vistas.
const slides = [
    {
        id: '1',
        title: 'Bienvenido a SafeBite',
        description: 'Tu compañero para identificar alérgenos en productos alimentarios',
        image: Image.resolveAssetSource(OnBoarding1).uri,
        isFirstScreen: true,
    },
    {
        id: '2',
        title: '¡Usa la cámara!',
        description: 'Escanea códigos de barras para verificar alérgenos al instante',
        image: Image.resolveAssetSource(OnBoarding2).uri,
    },
    {
        id: '3',
        title: 'Detección inmediata',
        description: 'Alertas personalizadas para los 14 alérgenos de declaración obligatoria en la UE',
        image: Image.resolveAssetSource(OnBoarding3).uri,
    },
];

export default function OnboardingScreen() {
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

    const slidesRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        // Navegar a la pantalla de selección de alergias
        router.replace('/onboarding/allergies');
    };

    const scrollToNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleNext();
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.itemContainer, { width }]}>
            {/* Zona de Imagen (Flex 0.6) */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={[styles.image, { resizeMode: 'contain' }]}
                />
            </View>

            {/* Zona de Texto (Flex 0.4) */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Botón Saltar */}
            <View style={styles.header}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.skipButton} onPress={handleNext}>
                    <Text style={styles.skipText}>Saltar</Text>
                </TouchableOpacity>
            </View>

            {/* Carrusel Principal */}
            <FlatList
                data={slides}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />

            {/* Footer: Paginador y Botón */}
            <View style={styles.footer}>
                {/* Indicadores (Puntos) */}
                <View style={styles.paginatorContainer}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                style={[styles.dot, { width: dotWidth, opacity }]}
                                key={i.toString()}
                            />
                        );
                    })}
                </View>

                {/* Botón Siguiente */}
                <TouchableOpacity style={styles.nextButton} onPress={scrollToNext}>
                    <Text style={styles.nextButtonText}>
                        {currentIndex === slides.length - 1 ? 'Empezar' : 'Siguiente'}
                    </Text>
                </TouchableOpacity>

                {/* Indicador visual de barra inferior */}
                <View style={styles.homeIndicator} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background, // Usando constante
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 50,
        alignItems: 'center',
    },
    skipButton: {
        backgroundColor: Colors.light.success, // Usando constante (verde)
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    skipText: {
        color: Colors.light.white,
        fontFamily: FontFamily.inter.semibold, // Usando fuente
        fontSize: 14,
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 0, // Removed padding for full width
    },
    image: {
        width: '100%', // Full width
        height: '100%',
    },
    textContainer: {
        flex: 0.4,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: FontFamily.montserrat.bold, // Usando fuente para títulos
        marginBottom: 15,
        color: Colors.light.text,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: Colors.light.textSecondary, // Usando constante
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: FontFamily.inter.regular, // Usando fuente cuerpo
    },
    footer: {
        height: 150,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    paginatorContainer: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 5,
        backgroundColor: Colors.light.text, // Punto activo
        marginHorizontal: 5,
    },
    nextButton: {
        backgroundColor: Colors.light.success, // Usando constante
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 20,
        shadowColor: Colors.light.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    nextButtonText: {
        color: Colors.light.white,
        fontSize: 18,
        fontFamily: FontFamily.inter.semibold,
    },
    homeIndicator: {
        width: 134,
        height: 5,
        backgroundColor: Colors.light.text,
        borderRadius: 100,
        marginBottom: 10,
        opacity: 0.2 // Reducido opacidad para que no sea tan fuerte
    }
});
