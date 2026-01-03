
import { auth } from '@/config/firebase';
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

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Flag para evitar redirección durante el proceso de registro
    const isRegisteringRef = useRef(false);

    useEffect(() => {
        // Escuchar cambios en la autenticación
        // Solo considerar como usuario logueado si el email está verificado
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            // Si estamos en proceso de registro, ignorar este evento
            if (isRegisteringRef.current) {
                setLoading(false);
                return;
            }

            if (firebaseUser && firebaseUser.emailVerified) {
                setUser(firebaseUser);
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
        signIn,
        signUp,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
