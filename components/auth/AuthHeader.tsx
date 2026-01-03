import { Colors, FontFamily, Spacing } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthHeaderProps {
    height?: number | string;
}

export function AuthHeader({ height = SCREEN_HEIGHT * 0.35 }: AuthHeaderProps) {
    return (
        <View style={[styles.imageSection, { height: typeof height === 'number' ? height : undefined }]}>
            <Image
                source={require('@/assets/images/auth-background.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
                blurRadius={1}
            />

            <View style={styles.imageOverlay} />

            <View style={styles.titleContainer}>
                <Text style={styles.titleSafe}>Safe</Text>
                <Text style={styles.titleBite}>Bite</Text>
            </View>

            <LinearGradient
                colors={['transparent', 'rgba(244,249,248,0.3)', 'rgba(244,249,248,0.8)', Colors.light.background]}
                locations={[0, 0.3, 0.7, 1]}
                style={styles.gradient}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    imageSection: {
        position: 'relative',
        width: '100%',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    titleContainer: {
        position: 'absolute',
        top: 70,
        left: Spacing.lg,
        zIndex: 10,
    },
    titleSafe: {
        fontFamily: FontFamily.montserrat.blackItalic,
        fontSize: 64,
        color: Colors.light.success,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    titleBite: {
        fontFamily: FontFamily.montserrat.blackItalic,
        fontSize: 64,
        color: Colors.light.white,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        marginTop: -15,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
});
