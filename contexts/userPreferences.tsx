
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const USER_ALLERGENS_KEY = 'user_allergens_ids';

interface UserPreferencesContextType {
    userAllergens: string[];
    updateUserAllergens: (allergens: string[]) => Promise<void>;
    isLoadingPreferences: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({} as UserPreferencesContextType);

export const useUserPreferences = () => useContext(UserPreferencesContext);

export const UserPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
    const [userAllergens, setUserAllergens] = useState<string[]>([]);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

    // Cargar alérgenos al iniciar
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const savedAllergens = await AsyncStorage.getItem(USER_ALLERGENS_KEY);
            if (savedAllergens) {
                setUserAllergens(JSON.parse(savedAllergens));
            }
        } catch (error) {
            console.error('Error loading user allergens:', error);
        } finally {
            setIsLoadingPreferences(false);
        }
    };

    const updateUserAllergens = async (newAllergens: string[]) => {
        try {
            await AsyncStorage.setItem(USER_ALLERGENS_KEY, JSON.stringify(newAllergens));
            setUserAllergens(newAllergens);
        } catch (error) {
            console.error('Error saving user allergens:', error);
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
