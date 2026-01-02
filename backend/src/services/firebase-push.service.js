// backend/src/services/firebase-push.service.js

const { getMessaging, isFirebaseConfigured } = require('../config/firebase');
const db = require('../models');
const { Op } = require('sequelize');

class FirebasePushService {
  constructor() {
    this.messaging = getMessaging();
    this.isConfigured = isFirebaseConfigured();
  }

  /**
   * Envoie une notification push à un utilisateur spécifique
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles (optionnel)
   */
  async sendToUser(utilisateurId, notification, data = {}) {
    if (!this.isConfigured || !this.messaging) {
      console.warn('Firebase non configuré, notification push ignorée');
      return { success: false, reason: 'Firebase non configuré' };
    }

    try {
      // Récupérer les tokens actifs de l'utilisateur
      const deviceTokens = await db.DeviceToken.findAll({
        where: {
          utilisateur_id: utilisateurId,
          isActive: true
        }
      });

      if (deviceTokens.length === 0) {
        console.log(`Aucun token actif trouvé pour l'utilisateur ${utilisateurId}`);
        return { success: false, reason: 'Aucun token actif' };
      }

      // Vérifier les préférences de notification
      const preferences = await this.getUserNotificationPreferences(utilisateurId);
      if (!preferences.pushNotifications) {
        console.log(`Push notifications désactivées pour l'utilisateur ${utilisateurId}`);
        return { success: false, reason: 'Push notifications désactivées' };
      }

      // Vérifier l'heure de notification
      if (!this.isWithinNotificationHours(preferences)) {
        console.log(`Hors des heures de notification pour l'utilisateur ${utilisateurId}`);
        return { success: false, reason: 'Hors des heures de notification' };
      }

      const tokens = deviceTokens.map(dt => dt.token);
      console.log(`📱 Envoi de notification à ${tokens.length} token(s) pour l'utilisateur ${utilisateurId}`);
      console.log(`🔑 Premier token: ${tokens[0]?.substring(0, 30)}...`);
      
      const results = await this.sendMulticast(tokens, notification, data);

      // Mettre à jour les tokens invalides
      await this.handleInvalidTokens(results.invalidTokens);

      return {
        success: true,
        sentCount: results.successCount,
        failedCount: results.failureCount,
        invalidTokens: results.invalidTokens.length
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification push:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Envoie une notification push à plusieurs utilisateurs
   * @param {Array<string>} utilisateurIds - IDs des utilisateurs
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles (optionnel)
   */
  async sendToUsers(utilisateurIds, notification, data = {}) {
    if (!this.isConfigured || !this.messaging) {
      console.warn('Firebase non configuré, notifications push ignorées');
      return { success: false, reason: 'Firebase non configuré' };
    }

    const results = {
      totalUsers: utilisateurIds.length,
      sentUsers: 0,
      failedUsers: 0,
      totalNotifications: 0,
      details: []
    };

    for (const userId of utilisateurIds) {
      const result = await this.sendToUser(userId, notification, data);
      results.details.push({ userId, ...result });
      
      if (result.success) {
        results.sentUsers++;
        results.totalNotifications += result.sentCount || 0;
      } else {
        results.failedUsers++;
      }
    }

    return results;
  }

  /**
   * Envoie une notification à tous les étudiants d'une classe
   * @param {string} classeId - ID de la classe
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles (optionnel)
   */
  async sendToClass(classeId, notification, data = {}) {
    try {
      // Récupérer tous les étudiants de la classe
      const etudiants = await db.Etudiant.findAll({
        where: { classe_id: classeId },
        attributes: ['id']
      });

      const utilisateurIds = etudiants.map(e => e.id);
      return await this.sendToUsers(utilisateurIds, notification, data);

    } catch (error) {
      console.error('Erreur lors de l\'envoi à la classe:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Envoie une notification multicast
   * @param {Array<string>} tokens - Tokens FCM
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles
   */
  async sendMulticast(tokens, notification, data = {}) {
    if (!this.messaging) {
      throw new Error('Firebase Messaging non initialisé');
    }

    // Filtrer les tokens FCM valides (exclure les tokens Expo de test)
    const validFCMTokens = tokens.filter(token => {
      if (token.startsWith('ExponentPushToken')) {
        console.log('⚠️ Token Expo ignoré (non compatible avec Firebase):', token.substring(0, 30) + '...');
        return false;
      }
      return true;
    });

    if (validFCMTokens.length === 0) {
      console.log('⚠️ Aucun token FCM valide trouvé');
      return {
        successCount: 0,
        failureCount: tokens.length,
        invalidTokens: tokens
      };
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
        click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens: validFCMTokens,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#2196F3',
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    try {
      console.log(`🚀 Envoi Firebase à ${validFCMTokens.length} token(s) FCM...`);
      const response = await this.messaging.sendMulticast(message);
      
      // Identifier les tokens invalides
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          console.log(`❌ Erreur pour token ${idx}:`, error.code, error.message);
          if (error.code === 'messaging/invalid-registration-token' || 
              error.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(validFCMTokens[idx]);
          }
        }
      });

      console.log(`✅ Notifications Firebase envoyées: ${response.successCount}/${validFCMTokens.length}`);
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi multicast Firebase:', error.message);
      
      // Si c'est une erreur de réseau/configuration, marquer tous les tokens comme invalides
      if (error.message.includes('404') || error.message.includes('batch')) {
        console.error('🌐 Problème de réseau ou de configuration Firebase détecté');
        return {
          successCount: 0,
          failureCount: validFCMTokens.length,
          invalidTokens: validFCMTokens
        };
      }
      
      throw error;
    }
  }

  /**
   * Enregistre un token de notification pour un utilisateur
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {string} token - Token FCM
   * @param {string} platform - Plateforme (android, ios, web)
   * @param {string} deviceId - ID de l'appareil (optionnel)
   * @param {string} appVersion - Version de l'app (optionnel)
   */
  async registerToken(utilisateurId, token, platform, deviceId = null, appVersion = null) {
    try {
      // Vérifier si le token existe déjà
      const existingToken = await db.DeviceToken.findOne({
        where: {
          utilisateur_id: utilisateurId,
          token: token
        }
      });

      if (existingToken) {
        // Mettre à jour le token existant
        await existingToken.update({
          isActive: true,
          lastUsed: new Date(),
          platform,
          deviceId,
          appVersion
        });
        return existingToken;
      }

      // Créer un nouveau token
      const deviceToken = await db.DeviceToken.create({
        utilisateur_id: utilisateurId,
        token,
        platform,
        deviceId,
        appVersion,
        isActive: true,
        lastUsed: new Date()
      });

      console.log(`Token FCM enregistré pour l'utilisateur ${utilisateurId} (${platform})`);
      return deviceToken;

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
      throw error;
    }
  }

  /**
   * Désactive un token de notification
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {string} token - Token FCM à désactiver
   */
  async unregisterToken(utilisateurId, token) {
    try {
      await db.DeviceToken.update(
        { isActive: false },
        {
          where: {
            utilisateur_id: utilisateurId,
            token: token
          }
        }
      );
      console.log(`Token FCM désactivé pour l'utilisateur ${utilisateurId}`);
    } catch (error) {
      console.error('Erreur lors de la désactivation du token:', error);
      throw error;
    }
  }

  /**
   * Nettoie les tokens invalides
   * @param {Array<string>} invalidTokens - Tokens invalides
   */
  async handleInvalidTokens(invalidTokens) {
    if (invalidTokens.length === 0) return;

    try {
      await db.DeviceToken.update(
        { isActive: false },
        {
          where: {
            token: { [Op.in]: invalidTokens }
          }
        }
      );
      console.log(`${invalidTokens.length} tokens invalides désactivés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des tokens invalides:', error);
    }
  }

  /**
   * Récupère les préférences de notification d'un utilisateur
   * @param {string} utilisateurId - ID de l'utilisateur
   */
  async getUserNotificationPreferences(utilisateurId) {
    try {
      let preferences = await db.NotificationPreference.findOne({
        where: { utilisateur_id: utilisateurId }
      });

      if (!preferences) {
        // Créer des préférences par défaut
        preferences = await db.NotificationPreference.create({
          utilisateur_id: utilisateurId
        });
      }

      return preferences;
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      // Retourner des préférences par défaut en cas d'erreur
      return {
        pushNotifications: true,
        heureDebutNotifications: '08:00:00',
        heureFinNotifications: '22:00:00'
      };
    }
  }

  /**
   * Vérifie si on est dans les heures de notification autorisées
   * @param {object} preferences - Préférences de l'utilisateur
   */
  isWithinNotificationHours(preferences) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    const startTime = preferences.heureDebutNotifications || '08:00:00';
    const endTime = preferences.heureFinNotifications || '22:00:00';

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Nettoie les anciens tokens (plus de 30 jours d'inactivité)
   */
  async cleanupOldTokens() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedCount = await db.DeviceToken.destroy({
        where: {
          lastUsed: { [Op.lt]: thirtyDaysAgo },
          isActive: false
        }
      });

      if (deletedCount > 0) {
        console.log(`${deletedCount} anciens tokens supprimés`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des anciens tokens:', error);
    }
  }
}

module.exports = new FirebasePushService();