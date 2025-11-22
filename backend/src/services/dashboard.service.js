// backend/src/services/dashboard.service.js

const db = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  /**
   * Récupère les statistiques globales pour l'administrateur
   */
  async getAdminDashboard() {
    const [
      totalEtudiants,
      totalEnseignants,
      totalCours,
      totalEvaluations,
      evaluationsActives,
      evaluationsTerminees,
      tauxParticipationMoyen
    ] = await Promise.all([
      db.Etudiant.count(),
      db.Enseignant.count(),
      db.Cours.count(),
      db.Evaluation.count(),
      db.Evaluation.count({ where: { statut: 'PUBLIEE' } }),
      db.Evaluation.count({ where: { statut: 'CLOTUREE' } }),
      this.calculateAverageParticipation()
    ]);

    // Évaluations récentes
    const evaluationsRecentes = await db.Evaluation.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.Cours },
        { model: db.Classe }
      ]
    });

    // Statistiques par cours
    const statsParCours = await this.getStatsByCours();

    return {
      overview: {
        totalEtudiants,
        totalEnseignants,
        totalCours,
        totalEvaluations,
        evaluationsActives,
        evaluationsTerminees,
        tauxParticipationMoyen
      },
      evaluationsRecentes: evaluationsRecentes.map(e => ({
        id: e.id,
        titre: e.titre,
        cours: e.Cours.nom,
        statut: e.statut,
        dateDebut: e.dateDebut,
        dateFin: e.dateFin,
        nombreClasses: e.Classes.length
      })),
      statsParCours
    };
  }

  /**
   * Calcule le taux de participation moyen
   */
  async calculateAverageParticipation() {
    const evaluations = await db.Evaluation.findAll({
      where: { statut: { [Op.in]: ['PUBLIEE', 'CLOTUREE'] } },
      include: [
        {
          model: db.Quizz,
          include: [{ model: db.SessionReponse }]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (evaluations.length === 0) return 0;

    let totalTaux = 0;
    let count = 0;

    for (const evaluation of evaluations) {
      const totalEtudiants = evaluation.Classes.reduce(
        (sum, classe) => sum + classe.Etudiants.length,
        0
      );

      if (totalEtudiants > 0) {
        const repondants = new Set(
          evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
        ).size;

        const taux = (repondants / totalEtudiants) * 100;
        totalTaux += taux;
        count++;
      }
    }

    return count > 0 ? (totalTaux / count).toFixed(2) : 0;
  }

  /**
   * Récupère les statistiques par cours
   */
  async getStatsByCours() {
    const cours = await db.Cours.findAll({
      include: [
        {
          model: db.Evaluation,
          include: [
            {
              model: db.Quizz,
              include: [{ model: db.SessionReponse }]
            },
            {
              model: db.Classe,
              include: [{ model: db.Etudiant }]
            }
          ]
        },
        { model: db.Enseignant, include: [{ model: db.Utilisateur }] }
      ]
    });

    return cours.map(c => {
      const nombreEvaluations = c.Evaluations.length;
      let totalReponses = 0;
      let totalEtudiants = 0;

      c.Evaluations.forEach(evaluation => {
        const repondants = new Set(
          evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
        ).size;
        totalReponses += repondants;

        const etudiants = evaluation.Classes.reduce(
          (sum, classe) => sum + classe.Etudiants.length,
          0
        );
        totalEtudiants += etudiants;
      });

      const tauxParticipation = totalEtudiants > 0
        ? ((totalReponses / totalEtudiants) * 100).toFixed(2)
        : 0;

      return {
        id: c.id,
        code: c.code,
        nom: c.nom,
        enseignant: c.Enseignant ? c.Enseignant.Utilisateur.nom : 'Non assigné',
        nombreEvaluations,
        tauxParticipation: parseFloat(tauxParticipation)
      };
    });
  }

  /**
   * Récupère le dashboard pour un étudiant
   */
  async getStudentDashboard(etudiantId) {
    const etudiant = await db.Etudiant.findByPk(etudiantId, {
      include: [
        { model: db.Utilisateur },
        { model: db.Classe }
      ]
    });

    if (!etudiant) {
      throw new Error('Étudiant non trouvé');
    }

    // Quizz disponibles
    const quizzDisponibles = await db.Quizz.findAll({
      include: [
        {
          model: db.Evaluation,
          where: {
            statut: 'PUBLIEE',
            dateDebut: { [Op.lte]: new Date() },
            dateFin: { [Op.gte]: new Date() }
          },
          include: [
            {
              model: db.Classe,
              where: { id: etudiant.classe_id }
            },
            { model: db.Cours }
          ]
        }
      ]
    });

    // Vérifier lesquels sont complétés
    const quizzAvecStatut = await Promise.all(
      quizzDisponibles.map(async quizz => {
        const session = await db.SessionReponse.findOne({
          where: {
            quizz_id: quizz.id,
            etudiant_id: etudiantId
          }
        });

        return {
          id: quizz.id,
          titre: quizz.titre,
          cours: quizz.Evaluation.Cours.nom,
          dateFin: quizz.Evaluation.dateFin,
          statut: session ? 'COMPLETE' : 'A_FAIRE'
        };
      })
    );

    // Statistiques personnelles
    const totalQuizzCompletes = await db.SessionReponse.count({
      where: { etudiant_id: etudiantId }
    });

    // Notifications non lues
    const notificationsNonLues = await db.sequelize.models.NotificationEtudiant.count({
      where: {
        EtudiantId: etudiantId,
        estLue: false
      }
    });

    return {
      etudiant: {
        nom: etudiant.Utilisateur.nom,
        prenom: etudiant.Utilisateur.prenom,
        matricule: etudiant.matricule,
        classe: etudiant.Classe.nom
      },
      quizz: {
        disponibles: quizzAvecStatut.filter(q => q.statut === 'A_FAIRE'),
        completes: quizzAvecStatut.filter(q => q.statut === 'COMPLETE'),
        total: quizzAvecStatut.length
      },
      statistiques: {
        totalQuizzCompletes,
        notificationsNonLues
      }
    };
  }

  /**
   * Récupère les statistiques d'une évaluation spécifique
   */
  async getEvaluationStats(evaluationId) {
    const evaluation = await db.Evaluation.findByPk(evaluationId, {
      include: [
        { model: db.Cours },
        {
          model: db.Quizz,
          include: [
            { model: db.Question },
            { model: db.SessionReponse }
          ]
        },
        {
          model: db.Classe,
          include: [{ model: db.Etudiant }]
        }
      ]
    });

    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    const totalEtudiants = evaluation.Classes.reduce(
      (sum, classe) => sum + classe.Etudiants.length,
      0
    );

    const repondants = new Set(
      evaluation.Quizz.SessionReponses.map(s => s.etudiant_id)
    ).size;

    const tauxParticipation = totalEtudiants > 0
      ? ((repondants / totalEtudiants) * 100).toFixed(2)
      : 0;

    return {
      id: evaluation.id,
      titre: evaluation.titre,
      cours: evaluation.Cours.nom,
      statut: evaluation.statut,
      dateDebut: evaluation.dateDebut,
      dateFin: evaluation.dateFin,
      nombreQuestions: evaluation.Quizz.Questions.length,
      totalEtudiants,
      nombreRepondants: repondants,
      tauxParticipation: parseFloat(tauxParticipation),
      classes: evaluation.Classes.map(c => ({
        id: c.id,
        nom: c.nom,
        nombreEtudiants: c.Etudiants.length
      }))
    };
  }
}

module.exports = new DashboardService();
