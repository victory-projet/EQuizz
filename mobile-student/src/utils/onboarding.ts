import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_completed';

// Stocker l'état de l'onboarding dans AsyncStorage
export const completeOnboarding = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        console.log('✅ Onboarding marked as completed in AsyncStorage');
    } catch (error) {
        console.error('❌ Error saving onboarding state:', error);
    }
};

export const resetOnboarding = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ONBOARDING_KEY);
        console.log('🔄 Onboarding reset in AsyncStorage');
    } catch (error) {
        console.error('❌ Error resetting onboarding state:', error);
    }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        const completed = value === 'true';
        console.log('🔍 Onboarding completed status:', completed);
        return completed;
    } catch (error) {
        console.error('❌ Error reading onboarding state:', error);
        return false;
    }
};