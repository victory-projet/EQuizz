// backend/src/services/notification.service.js

const db = require('../models');
const emailService = require('./email.service');

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

    // Envoyer les emails
    const emailPromises = etudiants.map(etudiant => 
      emailService.sendNotificationEmail(
        etudiant.Utilisateur.email,
        notification.titre,
        notification.message
      ).catch(err => console.error(`Erreur envoi email à ${etudiant.Utilisateur.email}:`, err))
    );

    await Promise.all(emailPromises);

    return { sent: etudiants.length };
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
}

module.exports = new NotificationService();
