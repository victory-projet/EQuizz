import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../presentation/hooks/useAuth';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 Navigation useEffect triggered:', { isAuthenticated, isLoading, segments: segments[0] });
    
    if (isLoading) {
      console.log('⏳ Still loading, skipping navigation...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    console.log('Navigation check:', { isAuthenticated, inAuthGroup, segments: segments[0] });

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers la page de connexion si non authentifié
      console.log('Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger vers l'app si déjà authentifié
      console.log('Redirecting to accueil...');
      router.replace('/(tabs)/accueil');
    } else {
      console.log('✅ No navigation needed');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
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
