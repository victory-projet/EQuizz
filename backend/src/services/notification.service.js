// backend/src/services/notification.service.js

const db = require('../models');
const emailService = require('./email.service');
const firebasePushService = require('./firebase-push.service');

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
   * Envoie une notification complète (push + email + in-app)
   * @param {Array<string>} etudiantIds - Liste des IDs d'étudiants
   * @param {object} notificationData - Données de notification
   */
  async sendCompleteNotification(etudiantIds, notificationData) {
    const { 
      titre, 
      message, 
      type, 
      evaluationId = null,
      pushData = {},
      emailSubject = null 
    } = notificationData;

    const results = {
      inApp: { success: false, count: 0 },
      push: { success: false, sent: 0, failed: 0 },
      email: { success: false, sent: 0, failed: 0 }
    };

    try {
      // 1. Créer la notification in-app si liée à une évaluation
      let notification = null;
      if (evaluationId) {
        notification = await this.createNotification(evaluationId, type, titre, message);
        await notification.addEtudiants(etudiantIds);
        results.inApp = { success: true, count: etudiantIds.length };
      }

      // 2. Envoyer les push notifications
      const pushNotification = {
        title: titre,
        body: message
      };

      const pushResult = await firebasePushService.sendToUsers(
        etudiantIds, 
        pushNotification, 
        {
          type,
          evaluationId: evaluationId || '',
          notificationId: notification?.id || '',
          ...pushData
        }
      );

      results.push = {
        success: pushResult.success !== false,
        sent: pushResult.sentUsers || 0,
        failed: pushResult.failedUsers || 0,
        totalNotifications: pushResult.totalNotifications || 0
      };

      // 3. Envoyer les emails
      const etudiants = await db.Etudiant.findAll({
        where: { id: etudiantIds },
        include: [{ model: db.Utilisateur }]
      });

      const emailPromises = etudiants.map(async (etudiant) => {
        try {
          // Vérifier les préférences email
          const preferences = await firebasePushService.getUserNotificationPreferences(etudiant.id);
          if (!preferences.emailNotifications) {
            return { success: false, reason: 'Email désactivé' };
          }

          await emailService.sendNotificationEmail(
            etudiant.Utilisateur.email,
            emailSubject || titre,
            message
          );
          return { success: true };
        } catch (error) {
          console.error(`Erreur envoi email à ${etudiant.Utilisateur.email}:`, error);
          return { success: false, error: error.message };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const emailSent = emailResults.filter(r => r.success).length;
      const emailFailed = emailResults.filter(r => !r.success).length;

      results.email = {
        success: emailSent > 0,
        sent: emailSent,
        failed: emailFailed
      };

      console.log(`📧 Notification envoyée: ${titre}`);
      console.log(`   - In-app: ${results.inApp.count}`);
      console.log(`   - Push: ${results.push.sent}/${results.push.sent + results.push.failed}`);
      console.log(`   - Email: ${results.email.sent}/${results.email.sent + results.email.failed}`);

      return results;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification complète:', error);
      throw error;
    }
  }

  /**
   * Notifie les étudiants d'une nouvelle évaluation
   * @param {string} evaluationId - L'ID de l'évaluation
   */
  async notifyNewEvaluation(evaluationId) {
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
      console.log('Aucun étudiant trouvé pour cette évaluation');
      return { sent: 0 };
    }

    // Préparer les données de notification
    const coursNom = evaluation.Cours?.nom || 'Cours non spécifié';
    const titre = '📚 Nouvelle évaluation disponible';
    const message = `L'évaluation "${evaluation.titre}" pour le cours ${coursNom} est maintenant ouverte. Date limite: ${new Date(evaluation.dateFin).toLocaleDateString('fr-FR')}`;

    // Envoyer la notification complète
    return await this.sendCompleteNotification(etudiantIds, {
      titre,
      message,
      type: 'NOUVELLE_EVALUATION',
      evaluationId: evaluation.id,
      pushData: {
        action: 'open_evaluation',
        evaluationId: evaluation.id,
        coursNom
      },
      emailSubject: `Nouvelle évaluation: ${evaluation.titre}`
    });
  }

  /**
   * Notifie les étudiants qu'une évaluation va bientôt fermer
   * @param {string} evaluationId - L'ID de l'évaluation
   * @param {number} heuresRestantes - Nombre d'heures restantes
   */
  async notifyEvaluationDeadline(evaluationId, heuresRestantes = 24) {
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

    // Récupérer les étudiants qui n'ont pas encore soumis
    const etudiantIds = [];
    evaluation.Classes.forEach(classe => {
      classe.Etudiants.forEach(etudiant => {
        if (!etudiantIds.includes(etudiant.id)) {
          etudiantIds.push(etudiant.id);
        }
      });
    });

    // Filtrer les étudiants qui ont déjà soumis
    const sessionsTerminees = await db.SessionReponse.findAll({
      where: {
        quizz_id: evaluation.Quizz?.id,
        statut: 'TERMINE'
      },
      attributes: ['etudiant_id']
    });

    const etudiantsAyantSoumis = sessionsTerminees.map(s => s.etudiant_id);
    const etudiantsNonSoumis = etudiantIds.filter(id => !etudiantsAyantSoumis.includes(id));

    if (etudiantsNonSoumis.length === 0) {
      console.log('Tous les étudiants ont déjà soumis leur évaluation');
      return { sent: 0 };
    }

    const coursNom = evaluation.Cours?.nom || 'Cours non spécifié';
    const titre = '⏰ Rappel: Évaluation bientôt fermée';
    const message = `L'évaluation "${evaluation.titre}" pour le cours ${coursNom} ferme dans ${heuresRestantes}h. N'oubliez pas de la compléter !`;

    return await this.sendCompleteNotification(etudiantsNonSoumis, {
      titre,
      message,
      type: 'RAPPEL_EVALUATION',
      evaluationId: evaluation.id,
      pushData: {
        action: 'open_evaluation',
        evaluationId: evaluation.id,
        coursNom,
        heuresRestantes: heuresRestantes.toString()
      },
      emailSubject: `Rappel: ${evaluation.titre} - ${heuresRestantes}h restantes`
    });
  }

  /**
   * Notifie les étudiants qu'une évaluation est fermée
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

    const etudiantIds = [];
    evaluation.Classes.forEach(classe => {
      classe.Etudiants.forEach(etudiant => {
        if (!etudiantIds.includes(etudiant.id)) {
          etudiantIds.push(etudiant.id);
        }
      });
    });

    const coursNom = evaluation.Cours?.nom || 'Cours non spécifié';
    const titre = '🔒 Évaluation fermée';
    const message = `L'évaluation "${evaluation.titre}" pour le cours ${coursNom} est maintenant fermée. Les résultats seront bientôt disponibles.`;

    return await this.sendCompleteNotification(etudiantIds, {
      titre,
      message,
      type: 'EVALUATION_BIENTOT_FERMEE',
      evaluationId: evaluation.id,
      pushData: {
        action: 'view_results',
        evaluationId: evaluation.id,
        coursNom
      },
      emailSubject: `Évaluation fermée: ${evaluation.titre}`
    });
  }

  /**
   * Notifie un étudiant de la confirmation de soumission
   * @param {string} etudiantId - ID de l'étudiant
   * @param {string} evaluationId - ID de l'évaluation
   */
  async notifySubmissionConfirmation(etudiantId, evaluationId) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [{ model: db.Cours, required: false }]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const coursNom = evaluation.Cours?.nom || 'Cours non spécifié';
    const titre = '✅ Soumission confirmée';
    const message = `Votre réponse à l'évaluation "${evaluation.titre}" pour le cours ${coursNom} a été enregistrée avec succès.`;

    return await this.sendCompleteNotification([etudiantId], {
      titre,
      message,
      type: 'CONFIRMATION_SOUMISSION',
      evaluationId: evaluation.id,
      pushData: {
        action: 'view_submission',
        evaluationId: evaluation.id,
        coursNom
      },
      emailSubject: `Confirmation: ${evaluation.titre}`
    });
  }

  /**
   * Notifie un utilisateur d'un changement de sécurité
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {string} action - Action effectuée (password_changed, card_linked, etc.)
   */
  async notifySecurityAction(utilisateurId, action) {
    const utilisateur = await db.Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    let titre, message;
    switch (action) {
    case 'password_changed':
      titre = '🔐 Mot de passe modifié';
      message = 'Votre mot de passe a été modifié avec succès. Si ce n\'était pas vous, contactez l\'administration.';
      break;
    case 'card_linked':
      titre = '💳 Carte étudiante associée';
      message = 'Votre carte étudiante a été associée à votre compte avec succès.';
      break;
    case 'profile_updated':
      titre = '👤 Profil mis à jour';
      message = 'Vos informations de profil ont été mises à jour avec succès.';
      break;
    default:
      titre = '🔒 Action de sécurité';
      message = 'Une action de sécurité a été effectuée sur votre compte.';
    }

    return await this.sendCompleteNotification([utilisateurId], {
      titre,
      message,
      type: 'SECURITE',
      pushData: {
        action: 'security_notification',
        securityAction: action
      },
      emailSubject: titre
    });
  }

  /**
   * Récupère les notifications d'un étudiant
   * @param {string} etudiantId - L'ID de l'étudiant
   * @param {number} limit - Limite de résultats
   * @param {number} offset - Décalage pour la pagination
   */
  async getEtudiantNotifications(etudiantId, limit = 20, offset = 0) {
    const notifications = await db.Notification.findAndCountAll({
      include: [
        {
          model: db.Etudiant,
          where: { id: etudiantId },
          through: { 
            attributes: ['lu', 'dateCreation'] 
          }
        },
        {
          model: db.Evaluation,
          include: [{ model: db.Cours, required: false }],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      notifications: notifications.rows.map(notif => ({
        id: notif.id,
        titre: notif.titre,
        message: notif.message,
        type: notif.typeNotification,
        lu: notif.Etudiants[0]?.NotificationEtudiant?.lu || false,
        dateCreation: notif.Etudiants[0]?.NotificationEtudiant?.dateCreation || notif.createdAt,
        evaluation: notif.Evaluation ? {
          id: notif.Evaluation.id,
          titre: notif.Evaluation.titre,
          cours: notif.Evaluation.Cours?.nom
        } : null
      })),
      total: notifications.count,
      hasMore: offset + limit < notifications.count
    };
  }

  /**
   * Marque une notification comme lue
   * @param {string} notificationId - L'ID de la notification
   * @param {string} etudiantId - L'ID de l'étudiant
   */
  async markAsRead(notificationId, etudiantId) {
    const notificationEtudiant = await db.NotificationEtudiant.findOne({
      where: {
        notification_id: notificationId,
        etudiant_id: etudiantId
      }
    });

    if (notificationEtudiant) {
      await notificationEtudiant.update({ lu: true });
    }
  }

  /**
   * Marque toutes les notifications comme lues pour un étudiant
   * @param {string} etudiantId - L'ID de l'étudiant
   */
  async markAllAsRead(etudiantId) {
    await db.NotificationEtudiant.update(
      { lu: true },
      {
        where: {
          etudiant_id: etudiantId,
          lu: false
        }
      }
    );
  }

  /**
   * Récupère le résumé des notifications pour un étudiant
   * @param {string} etudiantId - L'ID de l'étudiant
   */
  async getNotificationSummary(etudiantId) {
    const totalCount = await db.NotificationEtudiant.count({
      where: { etudiant_id: etudiantId }
    });

    const unreadCount = await db.NotificationEtudiant.count({
      where: { 
        etudiant_id: etudiantId,
        lu: false 
      }
    });

    const recentNotifications = await this.getEtudiantNotifications(etudiantId, 5, 0);

    return {
      total: totalCount,
      unread: unreadCount,
      recent: recentNotifications.notifications
    };
  }
}

module.exports = new NotificationService();