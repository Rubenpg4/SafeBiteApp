
import { auth } from '@/config/firebase';
import { createUserDocument } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendEmailVerification,
    signInAnonymously,
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
    signInAsGuest: () => Promise<void>;
    logout: () => Promise<void>;
    setAllergiesSetupComplete: () => Promise<void>;
    checkAllergiesSetup: (userId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasCompletedAllergiesSetup, setHasCompletedAllergiesSetup] = useState(false);
    const isRegisteringRef = useRef(false);

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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (isRegisteringRef.current) {
                setLoading(false);
                return;
            }

            if (firebaseUser) {
                if (firebaseUser.emailVerified || firebaseUser.isAnonymous) {
                    setUser(firebaseUser);
                    if (!firebaseUser.isAnonymous) {
                        await checkAllergiesSetup(firebaseUser.uid);
                    } else {
                        setHasCompletedAllergiesSetup(true);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, pass: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);

        if (!userCredential.user.emailVerified) {
            await firebaseSignOut(auth);
            const error = new Error('Email no verificado');
            (error as any).code = 'auth/email-not-verified';
            throw error;
        }

        await checkAllergiesSetup(userCredential.user.uid);
    };

    const signUp = async (email: string, pass: string, name: string) => {
        isRegisteringRef.current = true;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });

                try {
                    console.log('[SafeBite] Creating Firestore document for user:', userCredential.user.uid);
                    await createUserDocument(userCredential.user.uid, []);
                    console.log('[SafeBite] Firestore document created successfully');
                } catch (firestoreError) {
                    console.error('[SafeBite] Error creating Firestore document:', firestoreError);
                }

                await sendEmailVerification(userCredential.user);
                await firebaseSignOut(auth);
            }
        } finally {
            isRegisteringRef.current = false;
        }
    };

    const signInAsGuest = async () => {
        try {
            console.log('[SafeBite] Signing in anonymously...');
            await signInAnonymously(auth);
            console.log('[SafeBite] Signed in anonymously');
        } catch (error) {
            console.error('Error signing in anonymously:', error);
            throw error;
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
        signInAsGuest,
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
