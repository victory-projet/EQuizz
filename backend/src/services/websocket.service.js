// backend/src/services/websocket.service.js

const socketManager = require('../config/socket');
const firebaseService = require('./firebase.service');
const db = require('../models');

class WebSocketService {
  /**
   * Envoie une notification en temps réel via WebSocket et push
   * @param {Object} options - Options de notification
   */
  async sendNotification(options) {
    const {
      userIds = [],
      role = null,
      evaluationId = null,
      notification,
      pushData = {},
      socketEvent = 'new-notification'
    } = options;

    const results = {
      websocket: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0, invalidTokens: [] }
    };

    try {
      // 1. Envoyer via WebSocket
      if (userIds.length > 0) {
        // Envoyer à des utilisateurs spécifiques
        for (const userId of userIds) {
          const sent = socketManager.sendToUser(userId, socketEvent, notification);
          if (sent) {
            results.websocket.sent++;
          } else {
            results.websocket.failed++;
          }
        }
      } else if (role) {
        // Envoyer à tous les utilisateurs d'un rôle
        socketManager.sendToRole(role, socketEvent, notification);
        results.websocket.sent = 1; // Approximation
      } else if (evaluationId) {
        // Envoyer aux utilisateurs connectés à une évaluation
        socketManager.sendToEvaluation(evaluationId, socketEvent, notification);
        results.websocket.sent = 1; // Approximation
      }

      // 2. Envoyer les notifications push si Firebase est configuré
      if (firebaseService.isInitialized() && userIds.length > 0) {
        const pushResults = await this.sendPushNotifications(userIds, notification, pushData);
        results.push = pushResults;
      }

      console.log(`📡 Notification envoyée - WebSocket: ${results.websocket.sent}, Push: ${results.push.sent}`);
      return results;

    } catch (error) {
      console.error('❌ Erreur envoi notification WebSocket:', error);
      throw error;
    }
  }

  /**
   * Envoie des notifications push aux utilisateurs
   * @param {Array<string>} userIds - IDs des utilisateurs
   * @param {Object} notification - Données de notification
   * @param {Object} data - Données personnalisées
   */
  async sendPushNotifications(userIds, notification, data = {}) {
    try {
      // Récupérer les tokens FCM des utilisateurs
      const users = await db.Utilisateur.findAll({
        where: { id: userIds },
        attributes: ['id', 'fcmToken'],
        raw: true
      });

      const validTokens = users
        .filter(user => user.fcmToken)
        .map(user => user.fcmToken);

      if (validTokens.length === 0) {
        console.log('ℹ️ Aucun token FCM trouvé pour les utilisateurs');
        return { sent: 0, failed: 0, invalidTokens: [] };
      }

      // Envoyer les notifications push
      const pushResult = await firebaseService.sendToMultipleTokens(
        validTokens,
        {
          title: notification.titre || notification.title,
          body: notification.message || notification.body
        },
        data
      );

      // Nettoyer les tokens invalides
      if (pushResult.invalidTokens && pushResult.invalidTokens.length > 0) {
        await this.cleanupInvalidTokens(pushResult.invalidTokens);
      }

      return {
        sent: pushResult.successCount || 0,
        failed: pushResult.failureCount || 0,
        invalidTokens: pushResult.invalidTokens || []
      };

    } catch (error) {
      console.error('❌ Erreur envoi notifications push:', error);
      return { sent: 0, failed: 1, invalidTokens: [] };
    }
  }

  /**
   * Nettoie les tokens FCM invalides
   * @param {Array<string>} invalidTokens - Tokens invalides
   */
  async cleanupInvalidTokens(invalidTokens) {
    try {
      await db.Utilisateur.update(
        { fcmToken: null },
        { where: { fcmToken: invalidTokens } }
      );
      console.log(`🧹 ${invalidTokens.length} tokens FCM invalides supprimés`);
    } catch (error) {
      console.error('❌ Erreur nettoyage tokens invalides:', error);
    }
  }

  /**
   * Notifie une nouvelle évaluation
   * @param {string} evaluationId - ID de l'évaluation
   * @param {Array<string>} etudiantIds - IDs des étudiants
   */
  async notifyNewEvaluation(evaluationId, etudiantIds) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [{ model: db.Cours, required: false }]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'ce cours';
    
    const notification = {
      id: Date.now(),
      type: 'NOUVELLE_EVALUATION',
      titre: 'Nouvelle évaluation disponible',
      message: `L'évaluation "${evaluation.titre}" pour le cours "${coursNom}" est maintenant disponible.`,
      evaluationId,
      timestamp: new Date().toISOString(),
      estLue: false
    };

    return this.sendNotification({
      userIds: etudiantIds,
      notification,
      pushData: {
        type: 'NOUVELLE_EVALUATION',
        evaluationId: evaluationId.toString(),
        action: 'open_evaluation'
      },
      socketEvent: 'new-evaluation'
    });
  }

  /**
   * Notifie la clôture d'une évaluation
   * @param {string} evaluationId - ID de l'évaluation
   * @param {Array<string>} etudiantIds - IDs des étudiants
   */
  async notifyEvaluationClosed(evaluationId, etudiantIds) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [{ model: db.Cours, required: false }]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'ce cours';
    
    const notification = {
      id: Date.now(),
      type: 'EVALUATION_CLOTUREE',
      titre: 'Évaluation clôturée',
      message: `L'évaluation "${evaluation.titre}" pour le cours "${coursNom}" a été clôturée.`,
      evaluationId,
      timestamp: new Date().toISOString(),
      estLue: false
    };

    return this.sendNotification({
      userIds: etudiantIds,
      notification,
      pushData: {
        type: 'EVALUATION_CLOTUREE',
        evaluationId: evaluationId.toString(),
        action: 'view_results'
      },
      socketEvent: 'evaluation-closed'
    });
  }

  /**
   * Notifie les administrateurs d'une nouvelle réponse
   * @param {string} evaluationId - ID de l'évaluation
   * @param {string} etudiantNom - Nom de l'étudiant
   */
  async notifyNewResponse(evaluationId, etudiantNom) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [{ model: db.Cours, required: false }]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'ce cours';
    
    const notification = {
      id: Date.now(),
      type: 'NOUVELLE_REPONSE',
      titre: 'Nouvelle réponse reçue',
      message: `${etudiantNom} a répondu à l'évaluation "${evaluation.titre}" (${coursNom}).`,
      evaluationId,
      timestamp: new Date().toISOString(),
      estLue: false
    };

    return this.sendNotification({
      role: 'administrateur',
      notification,
      pushData: {
        type: 'NOUVELLE_REPONSE',
        evaluationId: evaluationId.toString(),
        action: 'view_responses'
      },
      socketEvent: 'new-response'
    });
  }

  /**
   * Envoie une notification système
   * @param {string} message - Message de la notification
   * @param {string} type - Type de notification
   * @param {string} targetRole - Rôle cible (optionnel)
   */
  async sendSystemNotification(message, type = 'SYSTEM', targetRole = null) {
    const notification = {
      id: Date.now(),
      type,
      titre: 'Notification système',
      message,
      timestamp: new Date().toISOString(),
      estLue: false
    };

    if (targetRole) {
      return this.sendNotification({
        role: targetRole,
        notification,
        socketEvent: 'system-notification'
      });
    } else {
      socketManager.sendToAll('system-notification', notification);
      return { websocket: { sent: 1, failed: 0 }, push: { sent: 0, failed: 0 } };
    }
  }

  /**
   * Obtient les statistiques des connexions WebSocket
   */
  getConnectionStats() {
    return {
      connectedUsers: socketManager.getConnectedUserCount(),
      userIds: socketManager.getConnectedUsers()
    };
  }

  /**
   * Vérifie si un utilisateur est connecté
   * @param {string} userId - ID de l'utilisateur
   */
  isUserConnected(userId) {
    return socketManager.isUserConnected(userId);
  }
}

// Instance singleton
const webSocketService = new WebSocketService();

module.exports = webSocketService;