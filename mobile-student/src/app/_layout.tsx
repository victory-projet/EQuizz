import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { AuthProvider, useAuth } from '../presentation/hooks/useAuth';
import { isOnboardingCompleted } from '../utils/onboarding';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Attendre que la navigation soit prête
  useEffect(() => {
    const unsubscribe = navigationRef?.addListener('state', () => {
      setIsNavigationReady(true);
    });
    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    // Ne rien faire si la navigation n'est pas prête
    if (!isNavigationReady) {
      console.log('⏳ Navigation not ready yet...');
      return;
    }

    console.log('🔄 Navigation useEffect:', { 
      isAuthenticated, 
      isLoading, 
      onboardingCompleted: isOnboardingCompleted(),
      segments: segments[0] 
    });
    
    const inOnboardingGroup = segments[0] === 'on_boarding';
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const onboardingDone = isOnboardingCompleted();

    // PRIORITÉ 1 : Si l'onboarding n'est pas complété, toujours rediriger vers onboarding
    if (!onboardingDone) {
      if (!inOnboardingGroup) {
        console.log('➡️ Redirecting to onboarding (not completed)...');
        router.replace('/on_boarding');
      }
      return;
    }

    // PRIORITÉ 2 : Si onboarding complété, attendre le chargement de l'auth
    if (isLoading) {
      console.log('⏳ Onboarding done, waiting for auth...');
      return;
    }

    // PRIORITÉ 3 : Gérer l'authentification après l'onboarding
    if (!isAuthenticated && !inAuthGroup) {
      console.log('➡️ Redirecting to login...');
      router.replace('/(auth)');
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      console.log('➡️ Redirecting to accueil...');
      router.replace('/(tabs)/accueil');
    } else {
      console.log('✅ No navigation needed');
    }
  }, [isAuthenticated, isLoading, segments, isNavigationReady]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="on_boarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}