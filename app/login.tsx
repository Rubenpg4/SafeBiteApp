import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { AuthButton, AuthHeader, AuthInput, AuthLayout, SocialButtons } from '@/components/auth';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { useAuth } from '@/contexts/auth';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const params = useLocalSearchParams<{
        prefillEmail?: string;
        prefillPassword?: string;
        verificationMessage?: string;
    }>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    // Leer parámetros si vienen del registro
    useEffect(() => {
        if (params.prefillEmail) {
            setEmail(params.prefillEmail);
        }
        if (params.prefillPassword) {
            setPassword(params.prefillPassword);
        }
        if (params.verificationMessage) {
            setInfoMessage(params.verificationMessage);
        }
    }, [params.prefillEmail, params.prefillPassword, params.verificationMessage]);

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Próximamente', message);
        }
    };

    const handleLogin = async () => {
        // Resetear errores e info
        setEmailError('');
        setPasswordError('');
        setInfoMessage('');

        let hasError = false;

        if (!email) {
            setEmailError('El email es obligatorio');
            hasError = true;
        }
        if (!password) {
            setPasswordError('La contraseña es obligatoria');
            hasError = true;
        }

        if (hasError) return;

        try {
            await signIn(email, password);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/invalid-email') setEmailError('Email inválido');
            else if (error.code === 'auth/user-not-found') setEmailError('Usuario no encontrado');
            else if (error.code === 'auth/wrong-password') setPasswordError('Contraseña incorrecta');
            else if (error.code === 'auth/invalid-credential') setPasswordError('Credenciales inválidas');
            else if (error.code === 'auth/email-not-verified') setInfoMessage('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
            else setEmailError('Error al iniciar sesión');
        }
    };

    const handleRegister = () => {
        router.push('/register');
    };

    const handleGoogleLogin = () => {
        showToast('Próximamente');
    };

    const handleAppleLogin = () => {
        showToast('Próximamente');
    };

    const handleScanBarcode = () => {
        router.push('/scan_screen');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <AuthHeader />

            <AuthLayout>
                <Text style={styles.title}>Iniciar sesión</Text>

                {infoMessage ? (
                    <View style={styles.infoContainer}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.light.success} />
                        <Text style={styles.infoText}>{infoMessage}</Text>
                    </View>
                ) : null}

                <AuthInput
                    placeholder="email@email.com"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError('');
                        setInfoMessage('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="email-input"
                    error={emailError}
                />

                <AuthInput
                    placeholder="••••••••••••"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordError('');
                        setInfoMessage('');
                    }}
                    autoCapitalize="none"
                    autoComplete="password"
                    isPassword
                    testID="password-input"
                    error={passwordError}
                />

                <View style={styles.buttonRow}>
                    <AuthButton title="Entrar" onPress={handleLogin} testID="login-button" />
                    <AuthButton title="Registrar" onPress={handleRegister} testID="register-button" />
                </View>

                <View style={styles.separator} />

                <SocialButtons onGooglePress={handleGoogleLogin} onApplePress={handleAppleLogin} />

                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={handleScanBarcode}
                    activeOpacity={0.8}
                    testID="scan-button"
                >
                    <Ionicons name="barcode-outline" size={28} color={Colors.light.textSecondary} />
                </TouchableOpacity>
            </AuthLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    title: {
        fontFamily: FontFamily.montserrat.bold,
        fontSize: FontSize.xl,
        color: Colors.light.success,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.light.successLight,
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.md,
        width: '100%',
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.sm,
        color: Colors.light.success,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: Spacing.lg,
        width: '100%',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.light.textSecondary,
        width: '40%',
        alignSelf: 'center',
        marginBottom: Spacing.lg,
        opacity: 0.5,
    },
    scanButton: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.light.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        marginTop: Spacing.sm,
    },
});
