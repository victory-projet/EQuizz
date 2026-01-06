// backend/src/services/notification.service.js

const db = require('../models');
const emailService = require('./email.service');
const webSocketService = require('./websocket.service');

class NotificationService {
  /**
   * Crée une notification pour une évaluation
   * @param {string} evaluationId - L'ID de l'évaluation
   * @param {string} type - Type de notification
   * @param {string} titre - Titre de la notification
   * @param {string} message - Message de la notification
   */
  async createNotification(evaluationId, type, titre, message) {
    return db.Notification.create({
      evaluation_id: evaluationId,
      typeNotification: type,
      titre,
      message
    });
  }

  /**
   * Envoie une notification à des étudiants spécifiques
   * @param {string} notificationId - L'ID de la notification
   * @param {Array<string>} etudiantIds - Liste des IDs d'étudiants
   */
  async sendToEtudiants(notificationId, etudiantIds) {
    const notification = await db.Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    // Associer la notification aux étudiants
    await notification.addEtudiants(etudiantIds);

    // Récupérer les étudiants avec leurs emails
    const etudiants = await db.Etudiant.findAll({
      where: { id: etudiantIds },
      include: [{ model: db.Utilisateur }]
    });

    // Envoyer via WebSocket et push notifications
    try {
      await webSocketService.sendNotification({
        userIds: etudiantIds,
        notification: {
          id: notification.id,
          type: notification.typeNotification,
          titre: notification.titre,
          message: notification.message,
          evaluationId: notification.evaluation_id,
          timestamp: notification.createdAt,
          estLue: false
        },
        pushData: {
          type: notification.typeNotification,
          evaluationId: notification.evaluation_id?.toString(),
          notificationId: notification.id.toString()
        }
      });
    } catch (error) {
      console.error('Erreur envoi WebSocket/Push:', error);
    }

    // Envoyer les emails
    const emailPromises = etudiants.map(async (etudiant) => {
      try {
        await emailService.sendNotificationEmail(
          etudiant.Utilisateur.email,
          notification.titre,
          notification.message
        );
        return { success: true, email: etudiant.Utilisateur.email };
      } catch (error) {
        console.error(`Erreur envoi email à ${etudiant.Utilisateur.email}:`, error);
        return { success: false, email: etudiant.Utilisateur.email, error: error.message };
      }
    });

    const emailResults = await Promise.allSettled(emailPromises);
    const failedEmails = emailResults.filter(result => result.status === 'rejected' || !result.value.success);
    
    if (failedEmails.length > 0) {
      console.warn(`⚠️ ${failedEmails.length} emails n'ont pas pu être envoyés`);
    }

    return {
      sent: etudiants.length,
      failed: failedEmails.length,
      emailsSent: etudiants.length - failedEmails.length
    };
  }

  /**
   * Notifie les étudiants d'une nouvelle évaluation
   * @param {string} evaluationId - L'ID de l'évaluation
   */
  async notifyNewEvaluation(evaluationId) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours, required: false }, // Cours peut être singularisé en "Cour"
        { 
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    // Récupérer tous les étudiants des classes ciblées
    const etudiantIds = [];
    evaluation.Classes.forEach(classe => {
      classe.Etudiants.forEach(etudiant => {
        if (!etudiantIds.includes(etudiant.id)) {
          etudiantIds.push(etudiant.id);
        }
      });
    });

    if (etudiantIds.length === 0) {
      return { sent: 0 };
    }

    // Le backend retourne "Cour" (singulier) à cause de Sequelize singularize
    const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'ce cours';
    
    const notification = await this.createNotification(
      evaluationId,
      'NOUVELLE_EVALUATION',
      'Nouvelle évaluation disponible',
      `L'évaluation "${evaluation.titre}" pour le cours "${coursNom}" est maintenant disponible. Merci de la compléter avant le ${new Date(evaluation.dateFin).toLocaleDateString('fr-FR')}.`
    );

    // Envoyer via WebSocket et push notifications
    try {
      await webSocketService.notifyNewEvaluation(evaluationId, etudiantIds);
    } catch (error) {
      console.error('Erreur envoi WebSocket/Push nouvelle évaluation:', error);
    }

    return this.sendToEtudiants(notification.id, etudiantIds);
  }

  /**
   * Notifie les étudiants qu'une évaluation a été clôturée
   * @param {string} evaluationId - L'ID de l'évaluation
   */
  async notifyEvaluationClosed(evaluationId) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours, required: false },
        { 
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    // Récupérer tous les étudiants des classes ciblées
    const etudiantIds = [];
    evaluation.Classes.forEach(classe => {
      classe.Etudiants.forEach(etudiant => {
        if (!etudiantIds.includes(etudiant.id)) {
          etudiantIds.push(etudiant.id);
        }
      });
    });

    if (etudiantIds.length === 0) {
      return { sent: 0 };
    }

    const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'ce cours';
    
    const notification = await this.createNotification(
      evaluationId,
      'EVALUATION_CLOTUREE',
      'Évaluation clôturée',
      `L'évaluation "${evaluation.titre}" pour le cours "${coursNom}" a été clôturée. Les résultats seront bientôt disponibles.`
    );

    // Envoyer via WebSocket et push notifications
    try {
      await webSocketService.notifyEvaluationClosed(evaluationId, etudiantIds);
    } catch (error) {
      console.error('Erreur envoi WebSocket/Push évaluation clôturée:', error);
    }

    return this.sendToEtudiants(notification.id, etudiantIds);
  }

  /**
   * Récupère les notifications d'un étudiant
   * @param {string} etudiantId - L'ID de l'étudiant
   * @param {boolean} nonLuesOnly - Ne récupérer que les non lues
   */
  async getEtudiantNotifications(etudiantId, nonLuesOnly = false) {
    const etudiant = await db.Etudiant.findByPk(etudiantId);
    if (!etudiant) {
      throw new Error('Étudiant non trouvé');
    }

    const whereClause = nonLuesOnly ? { estLue: false } : {};

    return etudiant.getNotifications({
      through: { where: whereClause },
      order: [['createdAt', 'DESC']],
      include: [{ model: db.Evaluation, include: [{ model: db.Cours, required: false }] }]
    });
  }

  /**
   * Marque une notification comme lue
   * @param {string} notificationId - L'ID de la notification
   * @param {string} etudiantId - L'ID de l'étudiant
   */
  async markAsRead(notificationId, etudiantId) {
    const notificationEtudiant = await db.sequelize.models.NotificationEtudiant.findOne({
      where: {
        NotificationId: notificationId,
        EtudiantId: etudiantId
      }
    });

    if (!notificationEtudiant) {
      throw new Error('Notification non trouvée pour cet étudiant');
    }

    await notificationEtudiant.update({ estLue: true });
    return { success: true };
  }

  /**
   * Marque toutes les notifications d'un étudiant comme lues
   * @param {string} etudiantId - L'ID de l'étudiant
   */
  async markAllAsRead(etudiantId) {
    await db.sequelize.models.NotificationEtudiant.update(
      { estLue: true },
      { where: { EtudiantId: etudiantId, estLue: false } }
    );
    return { success: true };
  }

  /**
   * Met à jour le token FCM d'un utilisateur
   * @param {string} userId - L'ID de l'utilisateur
   * @param {string} fcmToken - Le token FCM
   */
  async updateFCMToken(userId, fcmToken) {
    await db.Utilisateur.update(
      { fcmToken },
      { where: { id: userId } }
    );
    return { success: true };
  }

  /**
   * Supprime le token FCM d'un utilisateur (déconnexion)
   * @param {string} userId - L'ID de l'utilisateur
   */
  async removeFCMToken(userId) {
    await db.Utilisateur.update(
      { fcmToken: null },
      { where: { id: userId } }
    );
    return { success: true };
  }

  /**
   * Notifie les administrateurs d'une nouvelle réponse
   * @param {string} evaluationId - L'ID de l'évaluation
   * @param {string} etudiantNom - Nom de l'étudiant
   */
  async notifyNewResponse(evaluationId, etudiantNom) {
    try {
      await webSocketService.notifyNewResponse(evaluationId, etudiantNom);
      return { success: true };
    } catch (error) {
      console.error('Erreur notification nouvelle réponse:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie une notification système
   * @param {string} message - Message de la notification
   * @param {string} type - Type de notification
   * @param {string} targetRole - Rôle cible (optionnel)
   */
  async sendSystemNotification(message, type = 'SYSTEM', targetRole = null) {
    try {
      await webSocketService.sendSystemNotification(message, type, targetRole);
      return { success: true };
    } catch (error) {
      console.error('Erreur notification système:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtient les statistiques des connexions
   */
  getConnectionStats() {
    return webSocketService.getConnectionStats();
  }
}

module.exports = new NotificationService();