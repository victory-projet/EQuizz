// mobile-student/src/core/services/push-notification.service.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api';
import { STORAGE_KEYS } from '../constants';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  nouvelleEvaluation: boolean;
  rappelEvaluation: boolean;
  evaluationFermee: boolean;
  resultatsDisponibles: boolean;
  confirmationSoumission: boolean;
  securite: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  heureDebutNotifications: string;
  heureFinNotifications: string;
  frequenceRappels: 'JAMAIS' | 'UNE_FOIS' | 'QUOTIDIEN' | 'DEUX_FOIS_PAR_JOUR';
}

export interface DeviceToken {
  id: string;
  platform: 'android' | 'ios' | 'web';
  deviceId?: string;
  appVersion?: string;
  lastUsed: string;
  registeredAt: string;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialise le service de notifications push
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Initialisation des notifications push (Expo)...');

      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        console.warn('⚠️  Les notifications push ne fonctionnent que sur des appareils physiques');
        return false;
      }

      // Demander les permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️  Permissions de notification refusées');
        return false;
      }

      // Obtenir le token Expo Push
      const token = await this.getExpoPushToken();
      if (!token) {
        console.error('❌ Impossible d\'obtenir le token Expo Push');
        return false;
      }

      this.expoPushToken = token;

      // Enregistrer le token sur le serveur
      await this.registerTokenOnServer(token);

      // Configurer les listeners
      this.setupNotificationListeners();

      console.log('✅ Notifications push initialisées avec succès');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
      return false;
    }
  }

  /**
   * Demande les permissions de notification
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      // Demander les permissions Expo
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission Expo refusée');
        return false;
      }

      // Configuration Android spécifique
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'EQuizz Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2196F3',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  /**
   * Obtient le token Expo Push
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      console.log('🔄 Récupération du token Expo Push...');
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('🔑 Token Expo obtenu:', tokenData.data.substring(0, 20) + '...');
      return tokenData.data;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Expo:', error);
      return null;
    }
  }

  /**
   * Enregistre le token sur le serveur backend
   */
  private async registerTokenOnServer(token: string): Promise<void> {
    try {
      const platform = Platform.OS as 'android' | 'ios';
      const deviceId = Constants.deviceId || Constants.installationId;
      const appVersion = Constants.expoConfig?.version || '1.0.0';

      console.log('🔄 Tentative d\'enregistrement du token sur le serveur...');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('Platform:', platform);
      console.log('Device ID:', deviceId);

      await apiClient.post('/push-notifications/register', {
        token,
        platform,
        deviceId,
        appVersion,
        tokenType: 'expo', // Changé de 'fcm' à 'expo'
      });

      // Sauvegarder le token localement
      await SecureStore.setItemAsync(STORAGE_KEYS.PUSH_TOKEN, token);
      
      // Logger le succès dans le stockage local pour debug
      await SecureStore.setItemAsync('PUSH_DEBUG_LOG', JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        token: token.substring(0, 20) + '...',
        platform,
        deviceId,
        tokenType: 'expo'
      }));

      console.log('✅ Token Expo enregistré sur le serveur');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du token:', error);
      
      // Logger l'erreur dans le stockage local pour debug
      await SecureStore.setItemAsync('PUSH_DEBUG_LOG', JSON.stringify({
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token ? token.substring(0, 20) + '...' : 'No token'
      }));
      
      // Ne pas throw l'erreur pour ne pas bloquer l'initialisation
    }
  }

  /**
   * Configure les listeners de notifications
   */
  private setupNotificationListeners(): void {
    // Listener pour les notifications reçues quand l'app est au premier plan
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification reçue:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener pour les interactions avec les notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Gère les notifications reçues
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    console.log(`📬 Notification: ${title} - ${body}`);
    
    if (data?.type) {
      console.log(`🏷️  Type: ${data.type}`);
    }
  }

  /**
   * Gère les réponses aux notifications (clics)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    // Navigation basée sur le type de notification
    if (data?.action && typeof data.action === 'string') {
      this.handleNotificationAction(data.action, data);
    }
  }

  /**
   * Gère les actions de notification
   */
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'open_evaluation':
        console.log(`🎯 Ouvrir évaluation: ${data.evaluationId}`);
        // TODO: Implémenter la navigation
        break;
        
      case 'view_results':
        console.log(`📊 Voir résultats: ${data.evaluationId}`);
        // TODO: Implémenter la navigation
        break;
        
      case 'view_submission':
        console.log(`📝 Voir soumission: ${data.evaluationId}`);
        // TODO: Implémenter la navigation
        break;
        
      case 'security_notification':
        console.log(`🔒 Notification de sécurité: ${data.securityAction}`);
        // TODO: Implémenter la navigation
        break;
        
      default:
        console.log(`❓ Action inconnue: ${action}`);
    }
  }

  /**
   * Désactive les notifications push
   */
  async unregister(): Promise<void> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.PUSH_TOKEN);
      
      if (token) {
        await apiClient.post('/push-notifications/unregister', { token });
        await SecureStore.deleteItemAsync(STORAGE_KEYS.PUSH_TOKEN);
      }

      // Supprimer les listeners
      if (this.notificationListener) {
        this.notificationListener.remove();
        this.notificationListener = null;
      }

      if (this.responseListener) {
        this.responseListener.remove();
        this.responseListener = null;
      }

      this.expoPushToken = null;
      console.log('✅ Notifications désactivées');
    } catch (error) {
      console.error('❌ Erreur lors de la désactivation:', error);
      throw error;
    }
  }

  /**
   * Récupère les préférences de notification
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get('/push-notifications/preferences');
      return response.data.preferences;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  /**
   * Met à jour les préférences de notification
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.put('/push-notifications/preferences', preferences);
      return response.data.preferences;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  /**
   * Récupère les tokens actifs
   */
  async getActiveTokens(): Promise<DeviceToken[]> {
    try {
      const response = await apiClient.get('/push-notifications/tokens');
      return response.data.tokens;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      throw error;
    }
  }

  /**
   * Teste l'envoi d'une notification
   */
  async testNotification(title?: string, body?: string): Promise<void> {
    try {
      await apiClient.post('/push-notifications/test', {
        title: title || 'Test Notification',
        body: body || 'Ceci est un test de notification push'
      });
      console.log('✅ Test de notification envoyé');
    } catch (error) {
      console.error('❌ Erreur lors du test de notification:', error);
      throw error;
    }
  }

  /**
   * Obtient le token actuel
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Vérifie si les notifications sont activées
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export default new PushNotificationService();