import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_completed';

// Cache en mémoire pour éviter des lectures répétées d'AsyncStorage
let cachedValue: boolean | null = null;

/**
 * Marque l'onboarding comme complété et le persiste dans AsyncStorage.
 * À appeler à la fin de la dernière page de l'onboarding.
 */
export const completeOnboarding = async (): Promise<void> => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    cachedValue = true;
    console.log('✅ Onboarding marked as completed');
};

/**
 * Réinitialise l'onboarding (utile pour les tests ou reset du compte).
 */
export const resetOnboarding = async (): Promise<void> => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    cachedValue = false;
    console.log('🔄 Onboarding reset');
};

/**
 * Vérifie si l'onboarding a déjà été complété.
 * Utilise un cache mémoire après le premier appel.
 */
export const checkOnboardingCompleted = async (): Promise<boolean> => {
    if (cachedValue !== null) return cachedValue;
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    cachedValue = value === 'true';
    return cachedValue;
};

/**
 * Version synchrone — uniquement fiable APRÈS un appel préalable
 * à checkOnboardingCompleted() (ex: au démarrage dans _layout.tsx).
 */
export const isOnboardingCompleted = (): boolean => {
    return cachedValue === true;
};