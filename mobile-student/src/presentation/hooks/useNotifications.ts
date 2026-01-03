// mobile-student/src/presentation/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import pushNotificationService, { NotificationPreferences, DeviceToken } from '../../core/services/push-notification.service';

interface UseNotificationsReturn {
  isInitialized: boolean;
  isEnabled: boolean;
  preferences: NotificationPreferences | null;
  activeTokens: DeviceToken[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<boolean>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  testNotification: (title?: string, body?: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  unregister: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [activeTokens, setActiveTokens] = useState<DeviceToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialise les notifications push
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await pushNotificationService.initialize();
      setIsInitialized(success);

      if (success) {
        const enabled = await pushNotificationService.areNotificationsEnabled();
        setIsEnabled(enabled);

        // Charger les préférences et tokens
        await Promise.all([
          loadPreferences(),
          loadActiveTokens()
        ]);
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation';
      setError(errorMessage);
      console.error('Erreur lors de l\'initialisation des notifications:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Charge les préférences de notification
   */
  const loadPreferences = useCallback(async (): Promise<void> => {
    try {
      const prefs = await pushNotificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error('Erreur lors du chargement des préférences:', err);
    }
  }, []);

  /**
   * Charge les tokens actifs
   */
  const loadActiveTokens = useCallback(async (): Promise<void> => {
    try {
      const tokens = await pushNotificationService.getActiveTokens();
      setActiveTokens(tokens);
    } catch (err) {
      console.error('Erreur lors du chargement des tokens:', err);
    }
  }, []);

  /**
   * Met à jour les préférences de notification
   */
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const updatedPrefs = await pushNotificationService.updatePreferences(prefs);
      setPreferences(updatedPrefs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Teste l'envoi d'une notification
   */
  const testNotification = useCallback(async (title?: string, body?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await pushNotificationService.testNotification(title, body);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du test';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualise la liste des tokens
   */
  const refreshTokens = useCallback(async (): Promise<void> => {
    await loadActiveTokens();
  }, [loadActiveTokens]);

  /**
   * Désactive les notifications
   */
  const unregister = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await pushNotificationService.unregister();
      setIsInitialized(false);
      setIsEnabled(false);
      setPreferences(null);
      setActiveTokens([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Vérifie le statut des notifications au montage
   */
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        const enabled = await pushNotificationService.areNotificationsEnabled();
        setIsEnabled(enabled);

        const currentToken = pushNotificationService.getCurrentToken();
        const hasToken = !!currentToken;
        setIsInitialized(hasToken);

        if (enabled) {
          if (hasToken) {
            // Service déjà initialisé, charger les préférences
            await Promise.all([
              loadPreferences(),
              loadActiveTokens()
            ]);
          } else {
            // Notifications activées mais service pas initialisé, l'initialiser
            console.log('🔄 Notifications enabled but not initialized, initializing...');
            const success = await pushNotificationService.initialize();
            setIsInitialized(success);
            
            if (success) {
              await Promise.all([
                loadPreferences(),
                loadActiveTokens()
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du statut:', err);
      }
    };

    checkNotificationStatus();
  }, [loadPreferences, loadActiveTokens]);

  /**
   * Nettoyage au démontage
   */
  useEffect(() => {
    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  return {
    isInitialized,
    isEnabled,
    preferences,
    activeTokens,
    loading,
    error,
    initialize,
    updatePreferences,
    testNotification,
    refreshTokens,
    unregister,
  };
};