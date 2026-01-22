import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Dimensions, Platform, StyleSheet, Text, ToastAndroid, View } from 'react-native';

import { AuthButton, AuthHeader, AuthInput, AuthLayout, SocialButtons } from '@/components/auth';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { useAuth } from '@/contexts/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RegisterScreen() {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Próximamente', message);
        }
    };

    const handleRegister = async () => {
        // Resetear errores
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        let hasError = false;

        if (!name) {
            setNameError('El nombre es obligatorio');
            hasError = true;
        }
        if (!email) {
            setEmailError('El email es obligatorio');
            hasError = true;
        }
        if (!password) {
            setPasswordError('La contraseña es obligatoria');
            hasError = true;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Confirma tu contraseña');
            hasError = true;
        }
        if (password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden');
            hasError = true;
        }

        if (hasError) return;

        setIsLoading(true);
        try {
            await signUp(email, password, name);
            // Redirigir al login con mensaje de verificación
            router.replace({
                pathname: '/login',
                params: {
                    prefillEmail: email,
                    prefillPassword: password,
                    verificationMessage: 'Se ha enviado un correo de verificación. Por favor, verifica tu email antes de iniciar sesión.'
                }
            });
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') setEmailError('El email ya está en uso');
            else if (error.code === 'auth/invalid-email') setEmailError('Email inválido');
            else if (error.code === 'auth/weak-password') setPasswordError('La contraseña es muy débil');
            else setEmailError('Error al registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        router.back();
    };

    const handleGoogleRegister = () => {
        showToast('Próximamente');
    };

    const handleAppleRegister = () => {
        showToast('Próximamente');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <AuthHeader height={SCREEN_HEIGHT * 0.35} />

            <AuthLayout>
                <Text style={styles.title}>Registrarse</Text>

                <AuthInput
                    placeholder="Nombre completo"
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        setNameError('');
                    }}
                    autoCapitalize="words"
                    autoComplete="name"
                    testID="name-input"
                    error={nameError}
                />

                <AuthInput
                    placeholder="email@email.com"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    testID="email-input"
                    error={emailError}
                />

                <AuthInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setPasswordError('');
                    }}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    isPassword
                    testID="password-input"
                    error={passwordError}
                />

                <AuthInput
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setConfirmPasswordError('');
                    }}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    isPassword
                    testID="confirm-password-input"
                    error={confirmPasswordError}
                />

                <View style={styles.buttonRow}>
                    <AuthButton
                        title="Volver"
                        onPress={handleGoToLogin}
                        variant="secondary"
                        testID="back-to-login-button"
                    />
                    <AuthButton title="Registrar" onPress={handleRegister} testID="register-button" loading={isLoading} />
                </View>

                <View style={styles.separator} />

                <SocialButtons onGooglePress={handleGoogleRegister} onApplePress={handleAppleRegister} />
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
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
        width: '100%',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.light.textSecondary,
        width: '40%',
        alignSelf: 'center',
        marginBottom: Spacing.md,
        opacity: 0.5,
    },
});
