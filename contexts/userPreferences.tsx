/**
 * CONTEXTO DE PREFERENCIAS DE USUARIO
 * Gestiona los alérgenos seleccionados por el usuario
 * Sincroniza con Firestore para usuarios autenticados
 */

import { getUserAllergens, updateUserAllergens as updateUserAllergensFirestore } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth';

const USER_ALLERGENS_KEY = 'user_allergens_ids';

interface UserPreferencesContextType {
    userAllergens: string[];
    updateUserAllergens: (allergens: string[]) => Promise<void>;
    isLoadingPreferences: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({} as UserPreferencesContextType);

export const useUserPreferences = () => useContext(UserPreferencesContext);

export const UserPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [userAllergens, setUserAllergens] = useState<string[]>([]);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

    // Cargar alérgenos al iniciar o cuando cambia el usuario
    useEffect(() => {
        loadPreferences();
    }, [user?.uid]);

    const loadPreferences = async () => {
        setIsLoadingPreferences(true);
        try {
            if (user?.uid && !user.isAnonymous) {
                // Usuario autenticado REAL: cargar desde Firestore
                const allergens = await getUserAllergens(user.uid);
                setUserAllergens(allergens);
                // Sincronizar con AsyncStorage como caché local
                await AsyncStorage.setItem(USER_ALLERGENS_KEY, JSON.stringify(allergens));
            } else {
                // Usuario invitado o anónimo: cargar desde AsyncStorage
                const savedAllergens = await AsyncStorage.getItem(USER_ALLERGENS_KEY);
                if (savedAllergens) {
                    setUserAllergens(JSON.parse(savedAllergens));
                }
            }
        } catch (error) {
            console.error('Error loading user allergens:', error);
            // Fallback a AsyncStorage si falla Firestore
            try {
                const savedAllergens = await AsyncStorage.getItem(USER_ALLERGENS_KEY);
                if (savedAllergens) {
                    setUserAllergens(JSON.parse(savedAllergens));
                }
            } catch (fallbackError) {
                console.error('Error loading from fallback:', fallbackError);
            }
        } finally {
            setIsLoadingPreferences(false);
        }
    };

    const updateUserAllergens = async (newAllergens: string[]) => {
        try {
            // Actualizar estado local inmediatamente
            setUserAllergens(newAllergens);

            // Guardar en AsyncStorage (caché local)
            await AsyncStorage.setItem(USER_ALLERGENS_KEY, JSON.stringify(newAllergens));

            // Si hay usuario autenticado REAL, sincronizar con Firestore
            if (user?.uid && !user.isAnonymous) {
                await updateUserAllergensFirestore(user.uid, newAllergens);
            }
        } catch (error) {
            console.error('Error saving user allergens:', error);
            throw error;
        }
    };

    return (
        <UserPreferencesContext.Provider value={{
            userAllergens,
            updateUserAllergens,
            isLoadingPreferences
        }}>
            {children}
        </UserPreferencesContext.Provider>
    );
};
