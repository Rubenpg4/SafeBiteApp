import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Detectar cuando el teclado se muestra/oculta
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setIsKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    const handleRegister = () => {
        // TODO: Implementar lógica de registro con Firebase
        if (password !== confirmPassword) {
            console.log('Las contraseñas no coinciden');
            return;
        }
        console.log('Register:', { name, email, password });
    };

    const handleGoToLogin = () => {
        router.back();
    };

    const handleGoogleRegister = () => {
        // TODO: Implementar registro con Google
        console.log('Registro con Google');
    };

    const handleAppleRegister = () => {
        // TODO: Implementar registro con Apple
        console.log('Registro con Apple');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Sección superior con imagen de fondo */}
            <View style={styles.imageSection}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1529543544277-750e269a1fc7?w=800&q=80' }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />

                {/* Overlay oscuro para mejor legibilidad */}
                <View style={styles.imageOverlay} />

                {/* Título Safe Bite */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleSafe}>Safe</Text>
                    <Text style={styles.titleBite}>Bite</Text>
                </View>

                {/* Gradiente de transparente a background */}
                <LinearGradient
                    colors={['transparent', 'rgba(244,249,248,0.3)', 'rgba(244,249,248,0.8)', Colors.light.background]}
                    locations={[0, 0.3, 0.7, 1]}
                    style={styles.gradient}
                />
            </View>

            {/* Sección del formulario */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formSection}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.formContent}
                    scrollEnabled={isKeyboardVisible}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Título Registro */}
                    <Text style={styles.registerTitle}>Registro</Text>

                    {/* Input Nombre */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor={Colors.light.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoComplete="name"
                            testID="name-input"
                        />
                    </View>

                    {/* Input Email */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="email@email.com"
                            placeholderTextColor={Colors.light.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            testID="email-input"
                        />
                    </View>

                    {/* Input Password */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor={Colors.light.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
                            testID="password-input"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                            testID="toggle-password"
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={Colors.light.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Input Confirmar Password */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar contraseña"
                            placeholderTextColor={Colors.light.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
                            testID="confirm-password-input"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            testID="toggle-confirm-password"
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={Colors.light.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Botones Registrar y Volver */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRegister}
                            activeOpacity={0.8}
                            testID="register-button"
                        >
                            <Text style={styles.primaryButtonText}>Registrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleGoToLogin}
                            activeOpacity={0.8}
                            testID="back-to-login-button"
                        >
                            <Text style={styles.secondaryButtonText}>Volver</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botones de Registro Social */}
                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleGoogleRegister}
                            activeOpacity={0.7}
                            testID="google-register-button"
                        >
                            <View style={styles.googleIconContainer}>
                                <FontAwesome name="google" size={24} color="#4285F4" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButtonApple}
                            onPress={handleAppleRegister}
                            activeOpacity={0.7}
                            testID="apple-register-button"
                        >
                            <AntDesign name="apple1" size={26} color={Colors.light.white} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    imageSection: {
        height: SCREEN_HEIGHT * 0.28,
        position: 'relative',
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
        top: 50,
        left: Spacing.lg,
        zIndex: 10,
    },
    titleSafe: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: 42,
        color: Colors.light.success,
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    titleBite: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: 42,
        color: Colors.light.white,
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        marginTop: -8,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    formSection: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    formContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    registerTitle: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: FontSize.xl,
        color: Colors.light.success,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: Spacing.sm,
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: Colors.light.background,
        borderWidth: 1.5,
        borderColor: Colors.light.success,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.md,
        color: Colors.light.text,
    },
    eyeIcon: {
        position: 'absolute',
        right: Spacing.md,
        top: 13,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
        width: '100%',
    },
    primaryButton: {
        backgroundColor: Colors.light.success,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        minWidth: 110,
        alignItems: 'center',
        shadowColor: Colors.light.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    primaryButtonText: {
        fontFamily: FontFamily.inter.semibold,
        fontSize: FontSize.md,
        color: Colors.light.white,
    },
    secondaryButton: {
        backgroundColor: Colors.light.textSecondary,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        minWidth: 110,
        alignItems: 'center',
        shadowColor: Colors.light.textSecondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    secondaryButtonText: {
        fontFamily: FontFamily.inter.semibold,
        fontSize: FontSize.md,
        color: Colors.light.white,
    },
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
