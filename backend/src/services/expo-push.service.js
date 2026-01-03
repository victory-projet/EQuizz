// backend/src/services/expo-push.service.js
// Service alternatif pour les notifications push via Expo

const axios = require('axios');
const db = require('../models');

class ExpoPushService {
  constructor() {
    this.expoApiUrl = 'https://exp.host/--/api/v2/push/send';
  }

  /**
   * Envoie une notification push via Expo
   * @param {Array<string>} tokens - Tokens Expo
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles
   */
  async sendToExpoTokens(tokens, notification, data = {}) {
    try {
      // Filtrer les tokens Expo valides
      const expoTokens = tokens.filter(token => 
        token.startsWith('ExponentPushToken')
      );

      if (expoTokens.length === 0) {
        return {
          success: false,
          reason: 'Aucun token Expo valide'
        };
      }

      const messages = expoTokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        sound: 'default',
        priority: 'high'
      }));

      console.log(`🚀 Envoi Expo à ${expoTokens.length} token(s)...`);

      const response = await axios.post(this.expoApiUrl, messages, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const results = response.data.data || [];
      const successCount = results.filter(r => r.status === 'ok').length;
      const failureCount = results.length - successCount;

      console.log(`✅ Notifications Expo envoyées: ${successCount}/${expoTokens.length}`);

      return {
        success: true,
        successCount,
        failureCount,
        invalidTokens: []
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi Expo:', error.message);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * Envoie une notification à un utilisateur via Expo
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {object} notification - Données de notification
   * @param {object} data - Données additionnelles
   */
  async sendToUser(utilisateurId, notification, data = {}) {
    try {
      // Récupérer les tokens de l'utilisateur
      const deviceTokens = await db.DeviceToken.findAll({
        where: {
          utilisateur_id: utilisateurId,
          isActive: true
        }
      });

      if (deviceTokens.length === 0) {
        return { success: false, reason: 'Aucun token actif' };
      }

      const tokens = deviceTokens.map(dt => dt.token);
      return await this.sendToExpoTokens(tokens, notification, data);

    } catch (error) {
      console.error('Erreur lors de l\'envoi Expo:', error);
      return { success: false, reason: error.message };
    }
  }
}

module.exports = new ExpoPushService();