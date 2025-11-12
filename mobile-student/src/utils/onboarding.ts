// Stocker l'état de l'onboarding en mémoire
let onboardingCompleted = false;

export const completeOnboarding = (): void => {
    onboardingCompleted = true;
    console.log('✅ Onboarding marked as completed');
};

export const resetOnboarding = (): void => {
    onboardingCompleted = false;
    console.log('🔄 Onboarding reset');
};

export const isOnboardingCompleted = (): boolean => {
    return onboardingCompleted;
};