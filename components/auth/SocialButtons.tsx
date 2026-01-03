import { BorderRadius, Colors, Spacing } from '@/constants';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SocialButtonsProps {
    onGooglePress: () => void;
    onApplePress: () => void;
}

export function SocialButtons({ onGooglePress, onApplePress }: SocialButtonsProps) {
    return (
        <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
                style={styles.socialButton}
                onPress={onGooglePress}
                activeOpacity={0.7}
                testID="google-login-button"
            >
                <Image
                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                    style={styles.socialIconImage}
                />
                <View style={styles.googleIconContainer}>
                    <FontAwesome name="google" size={24} color="#4285F4" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.socialButtonApple}
                onPress={onApplePress}
                activeOpacity={0.7}
                testID="apple-login-button"
            >
                <AntDesign name="apple" size={26} color={Colors.light.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
        marginBottom: Spacing.md,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.textSecondary,
        shadowColor: Colors.light.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    socialIconImage: {
        width: 24,
        height: 24,
        display: 'none',
    },
    googleIconContainer: {
        position: 'absolute',
    },
    socialButtonApple: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.text,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.light.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
});
