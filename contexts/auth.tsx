
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    updateProfile,
    User
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ALLERGIES_SETUP_KEY = 'allergies_setup_complete';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    hasCompletedAllergiesSetup: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    setAllergiesSetupComplete: () => Promise<void>;
    checkAllergiesSetup: (userId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedAllergiesSetup, setHasCompletedAllergiesSetup] = useState(false);
    // Flag para evitar redirección durante el proceso de registro
    const isRegisteringRef = useRef(false);

    // Verificar si el usuario ya completó la configuración de alergias
    const checkAllergiesSetup = async (userId?: string): Promise<boolean> => {
        try {
            const uid = userId || user?.uid;
            if (!uid) return false;

            const key = `${ALLERGIES_SETUP_KEY}_${uid}`;
            const value = await AsyncStorage.getItem(key);
            const isComplete = value === 'true';
            setHasCompletedAllergiesSetup(isComplete);
            return isComplete;
        } catch (error) {
            console.error('Error checking allergies setup:', error);
            return false;
        }
    };

    // Marcar la configuración de alergias como completada
    const setAllergiesSetupComplete = async (): Promise<void> => {
        try {
            if (!user?.uid) return;
            const key = `${ALLERGIES_SETUP_KEY}_${user.uid}`;
            await AsyncStorage.setItem(key, 'true');
            setHasCompletedAllergiesSetup(true);
        } catch (error) {
            console.error('Error saving allergies setup:', error);
        }
    };

    useEffect(() => {
        // Escuchar cambios en la autenticación
        // Solo considerar como usuario logueado si el email está verificado
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Si estamos en proceso de registro, ignorar este evento
            if (isRegisteringRef.current) {
                setLoading(false);
                return;
            }

            if (firebaseUser && firebaseUser.emailVerified) {
                setUser(firebaseUser);
                // Verificar si ya completó la configuración de alergias
                await checkAllergiesSetup(firebaseUser.uid);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, pass: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);

        // Verificar si el email está verificado
        if (!userCredential.user.emailVerified) {
            // Cerrar sesión inmediatamente
            await firebaseSignOut(auth);
            // Lanzar error personalizado
            const error = new Error('Email no verificado');
            (error as any).code = 'auth/email-not-verified';
            throw error;
        }

        // Verificar configuración de alergias después del login
        await checkAllergiesSetup(userCredential.user.uid);
    };

    const signUp = async (email: string, pass: string, name: string) => {
        // Activar flag para evitar redirección
        isRegisteringRef.current = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                // Cerrar sesión inmediatamente después del registro
                await firebaseSignOut(auth);
            }
        } finally {
            // Desactivar flag después de completar todo
            isRegisteringRef.current = false;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    const value = {
        user,
        loading,
        hasCompletedAllergiesSetup,
        signIn,
        signUp,
        logout,
        setAllergiesSetupComplete,
        checkAllergiesSetup
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
