import {
    Stack,
    useNavigationContainerRef,
    useRouter,
    useSegments,
} from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SQLiteDatabase } from "../data/database/SQLiteDatabase";
import { SyncService } from "../data/services/SyncService";
import { QuizzSyncService } from "../data/services/QuizzSyncService";
import { AuthProvider, useAuth } from "../presentation/hooks/useAuth";
import { isOnboardingCompleted, checkOnboardingCompleted } from "../utils/onboarding";

/**
 * Composant d'initialisation de l'application
 * Initialise la base de données avant le démarrage de l'app
 */
interface AppInitializerProps {
  children: React.ReactNode;
}

function AppInitializer({ children }: AppInitializerProps) {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>("Initialisation...");

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log("🔧 Initialisation de l'application...");

      setStep("Initialisation de la base de données...");
      const db = SQLiteDatabase.getInstance();
      await db.init();

      setStep("Vérification du schéma...");
      await db.migrateUserTable();
      await db.migrateEvaluationsTable();

      setStep("Nettoyage des anciennes données...");
      const syncService = SyncService.getInstance();
      await syncService.cleanOldData();

      // Précharger l'état de l'onboarding depuis AsyncStorage
      await checkOnboardingCompleted();

      // Démarrer le service de synchronisation des quiz hors ligne
      QuizzSyncService.getInstance().start();

      if (__DEV__) {
        await db.debugSchema();
      }

      console.log("✅ Application initialisée avec succès");
      setDbReady(true);
    } catch (err: any) {
      console.error("❌ Erreur d'initialisation:", err);
      setError(err.message || "Erreur d'initialisation");
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Erreur d&apos;initialisation</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorHint}>
          Veuillez redémarrer l&apos;application
        </Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3A5689" />
        <Text style={styles.loadingText}>{step}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Attendre que la navigation soit prête
  useEffect(() => {
    const unsubscribe = navigationRef?.addListener("state", () => {
      setIsNavigationReady(true);
    });
    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    // Ne rien faire si la navigation n'est pas prête
    if (!isNavigationReady) {
      console.log("⏳ Navigation not ready yet...");
      return;
    }

    console.log("🔄 Navigation useEffect:", {
      isAuthenticated,
      isLoading,
      onboardingCompleted: isOnboardingCompleted(),
      segments: segments[0],
    });

    const inOnboardingGroup = segments[0] === "on_boarding";
    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const onboardingDone = isOnboardingCompleted();

    // PRIORITÉ 1 : Si l'onboarding n'est pas complété, toujours rediriger vers onboarding
    if (!onboardingDone) {
      if (!inOnboardingGroup) {
        console.log("➡️ Redirecting to onboarding (not completed)...");
        router.replace("/on_boarding");
      }
      return;
    }

    // PRIORITÉ 2 : Si onboarding complété, attendre le chargement de l'auth
    if (isLoading) {
      console.log("⏳ Onboarding done, waiting for auth...");
      return;
    }

    // PRIORITÉ 3 : Gérer l'authentification après l'onboarding
    if (!isAuthenticated && !inAuthGroup) {
      console.log("➡️ Redirecting to login...");
      router.replace("/(auth)");
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      console.log("➡️ Redirecting to accueil...");
      router.replace("/(tabs)/accueil");
    } else {
      console.log("✅ No navigation needed");
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
    <AppInitializer>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppInitializer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
  },
});