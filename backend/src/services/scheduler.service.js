// backend/src/services/scheduler.service.js

const cron = require('node-cron');
const db = require('../models');
const notificationService = require('./notification.service');
const firebasePushService = require('./firebase-push.service');
const { Op } = require('sequelize');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Démarre tous les jobs programmés
   */
  startAllJobs() {
    console.log('🕐 Démarrage des tâches programmées...');

    // Vérifier les évaluations qui ferment bientôt (toutes les heures)
    this.scheduleJob('evaluation-deadline-check', '0 * * * *', () => {
      this.checkEvaluationDeadlines();
    });

    // Nettoyer les anciens tokens (tous les jours à 2h du matin)
    this.scheduleJob('cleanup-tokens', '0 2 * * *', () => {
      firebasePushService.cleanupOldTokens();
    });

    // Vérifier les évaluations qui doivent être fermées automatiquement (toutes les 10 minutes)
    this.scheduleJob('auto-close-evaluations', '*/10 * * * *', () => {
      this.autoCloseExpiredEvaluations();
    });

    console.log(`✅ ${this.jobs.size} tâches programmées démarrées`);
  }

  /**
   * Arrête tous les jobs programmés
   */
  stopAllJobs() {
    console.log('🛑 Arrêt des tâches programmées...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`   - ${name} arrêtée`);
    });
    this.jobs.clear();
  }

  /**
   * Programme une tâche cron
   * @param {string} name - Nom de la tâche
   * @param {string} schedule - Expression cron
   * @param {Function} task - Fonction à exécuter
   */
  scheduleJob(name, schedule, task) {
    if (this.jobs.has(name)) {
      console.warn(`⚠️  Tâche ${name} déjà programmée, remplacement...`);
      this.jobs.get(name).stop();
    }

    const job = cron.schedule(schedule, async () => {
      try {
        console.log(`🔄 Exécution de la tâche: ${name}`);
        await task();
        console.log(`✅ Tâche ${name} terminée`);
      } catch (error) {
        console.error(`❌ Erreur dans la tâche ${name}:`, error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    job.start();
    this.jobs.set(name, job);
    console.log(`📅 Tâche ${name} programmée: ${schedule}`);
  }

  /**
   * Vérifie les évaluations qui ferment bientôt et envoie des rappels
   */
  async checkEvaluationDeadlines() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Évaluations qui ferment dans 24h
      const evaluations24h = await db.Evaluation.findAll({
        where: {
          statut: 'EN_COURS',
          dateFin: {
            [Op.between]: [now, in24Hours]
          }
        },
        include: [
          { model: db.Cours, required: false },
          { model: db.Quizz, required: false }
        ]
      });

      // Évaluations qui ferment dans 2h
      const evaluations2h = await db.Evaluation.findAll({
        where: {
          statut: 'EN_COURS',
          dateFin: {
            [Op.between]: [now, in2Hours]
          }
        },
        include: [
          { model: db.Cours, required: false },
          { model: db.Quizz, required: false }
        ]
      });

      // Envoyer les rappels 24h
      for (const evaluation of evaluations24h) {
        const heuresRestantes = Math.ceil((new Date(evaluation.dateFin) - now) / (1000 * 60 * 60));
        if (heuresRestantes <= 24 && heuresRestantes > 2) {
          console.log(`📢 Rappel 24h pour l'évaluation: ${evaluation.titre}`);
          await notificationService.notifyEvaluationDeadline(evaluation.id, heuresRestantes);
        }
      }

      // Envoyer les rappels 2h (plus urgents)
      for (const evaluation of evaluations2h) {
        const heuresRestantes = Math.ceil((new Date(evaluation.dateFin) - now) / (1000 * 60 * 60));
        if (heuresRestantes <= 2) {
          console.log(`🚨 Rappel urgent 2h pour l'évaluation: ${evaluation.titre}`);
          await notificationService.notifyEvaluationDeadline(evaluation.id, heuresRestantes);
        }
      }

      console.log(`✅ Vérification des deadlines terminée: ${evaluations24h.length + evaluations2h.length} évaluations vérifiées`);

    } catch (error) {
      console.error('Erreur lors de la vérification des deadlines:', error);
    }
  }

  /**
   * Ferme automatiquement les évaluations expirées
   */
  async autoCloseExpiredEvaluations() {
    try {
      const now = new Date();

      const expiredEvaluations = await db.Evaluation.findAll({
        where: {
          statut: 'EN_COURS',
          dateFin: {
            [Op.lt]: now
          }
        }
      });

      for (const evaluation of expiredEvaluations) {
        console.log(`🔒 Fermeture automatique de l'évaluation: ${evaluation.titre}`);
        
        // Mettre à jour le statut
        await evaluation.update({ statut: 'CLOTUREE' });
        
        // Envoyer la notification de fermeture
        await notificationService.notifyEvaluationClosed(evaluation.id);
      }

      if (expiredEvaluations.length > 0) {
        console.log(`✅ ${expiredEvaluations.length} évaluations fermées automatiquement`);
      }

    } catch (error) {
      console.error('Erreur lors de la fermeture automatique:', error);
    }
  }

  /**
   * Programme un rappel personnalisé pour une évaluation
   * @param {string} evaluationId - ID de l'évaluation
   * @param {Date} reminderDate - Date du rappel
   * @param {number} heuresRestantes - Heures restantes
   */
  scheduleEvaluationReminder(evaluationId, reminderDate, heuresRestantes) {
    const jobName = `reminder-${evaluationId}-${heuresRestantes}h`;
    
    // Calculer l'expression cron pour la date spécifique
    const cronExpression = `${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} ${reminderDate.getMonth() + 1} *`;
    
    this.scheduleJob(jobName, cronExpression, async () => {
      await notificationService.notifyEvaluationDeadline(evaluationId, heuresRestantes);
      // Supprimer le job après exécution
      this.jobs.delete(jobName);
    });

    console.log(`⏰ Rappel programmé pour l'évaluation ${evaluationId} dans ${heuresRestantes}h`);
  }

  /**
   * Annule un rappel programmé
   * @param {string} evaluationId - ID de l'évaluation
   * @param {number} heuresRestantes - Heures restantes
   */
  cancelEvaluationReminder(evaluationId, heuresRestantes) {
    const jobName = `reminder-${evaluationId}-${heuresRestantes}h`;
    
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName).stop();
      this.jobs.delete(jobName);
      console.log(`❌ Rappel annulé pour l'évaluation ${evaluationId}`);
    }
  }

  /**
   * Obtient le statut de tous les jobs
   */
  getJobsStatus() {
    const status = [];
    this.jobs.forEach((job, name) => {
      status.push({
        name,
        running: job.running,
        scheduled: job.scheduled
      });
    });
    return status;
  }
}

module.exports = new SchedulerService();