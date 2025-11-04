import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../presentation/hooks/useAuth';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0]?.includes('auth');

    if (!isAuthenticated && !inAuthGroup) {
      // Rediriger vers la page de connexion si non authentifié
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger vers l'app si déjà authentifié
      router.replace('/accueil' as any);
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
