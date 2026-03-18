// backend/src/services/stats.service.js

const db = require('../models');
const { Op } = require('sequelize');

class StatsService {
  /**
   * Statistiques par UE (Cours)
   */
  async getUEStats(filters = {}) {
    const where = {};
    if (filters.ecoleId) where['$Evaluation.Classes.ecole_id$'] = filters.ecoleId;

    const cours = await db.Cours.findAll({
      include: [
        {
          model: db.Evaluation,
          include: [
            {
              model: db.Quizz,
              include: [{ model: db.SessionReponse }]
            },
            { model: db.Classe }
          ]
        }
      ]
    });

    return cours.map(c => {
      let totalReponses = 0;
      let totalEvaluations = c.Evaluations.length;
      
      c.Evaluations.forEach(eval_ => {
        totalReponses += eval_.Quizz?.SessionReponses?.length || 0;
      });

      return {
        id: c.id,
        code: c.code,
        nom: c.nom,
        totalEvaluations,
        totalReponses,
        participationMoyenne: totalEvaluations > 0 ? (totalReponses / totalEvaluations).toFixed(2) : 0
      };
    });
  }

  /**
   * Statistiques par École
   */
  async getSchoolStats() {
    const ecoles = await db.Ecole.findAll({
      include: [
        {
          model: db.Classe,
          include: [
            {
              model: db.Evaluation,
              include: [
                {
                  model: db.Quizz,
                  include: [{ model: db.SessionReponse }]
                }
              ]
            },
            { model: db.Etudiant }
          ]
        }
      ]
    });

    return ecoles.map(ecole => {
      let totalEtudiants = 0;
      let totalReponses = 0;
      let evaluationsSeen = new Set();

      ecole.Classes.forEach(classe => {
        totalEtudiants += classe.Etudiants.length;
        classe.Evaluations.forEach(eval_ => {
          evaluationsSeen.add(eval_.id);
          totalReponses += eval_.Quizz?.SessionReponses?.length || 0;
        });
      });

      return {
        id: ecole.id,
        nom: ecole.nom,
        totalClasses: ecole.Classes.length,
        totalEtudiants,
        totalEvaluations: evaluationsSeen.size,
        totalReponses,
        tauxParticipation: totalEtudiants > 0 ? ((totalReponses / (totalEtudiants * evaluationsSeen.size || 1)) * 100).toFixed(2) : 0
      };
    });
  }

  /**
   * Détail des réponses par question et option
   */
  async getQuestionDetailedStats(quizzId) {
    const quizz = await db.Quizz.findByPk(quizzId, {
      include: [
        {
          model: db.Question,
          include: [{ model: db.ReponseEtudiant }]
        }
      ]
    });

    if (!quizz) throw new Error('Quizz non trouvé');

    return quizz.Questions.map(q => {
      const stats = {
        id: q.id,
        enonce: q.enonce,
        type: q.typeQuestion,
        totalReponses: q.ReponseEtudiants.length,
        distribution: {}
      };

      if (q.typeQuestion === 'CHOIX_MULTIPLE') {
        const options = q.options || [];
        options.forEach(opt => stats.distribution[opt] = 0);
        q.ReponseEtudiants.forEach(rep => {
          if (stats.distribution[rep.contenu] !== undefined) {
            stats.distribution[rep.contenu]++;
          }
        });
      }

      return stats;
    });
  }

  /**
   * Historique global d'un étudiant (tous les quizz)
   */
  async getStudentHistory(etudiantId) {
    const sessions = await db.SessionReponse.findAll({
      where: { etudiant_id: etudiantId },
      include: [
        {
          model: db.Quizz,
          include: [
            {
              model: db.Evaluation,
              include: [{ model: db.Cours }]
            }
          ]
        },
        {
            model: db.Etudiant,
            include: [{ model: db.Classe, include: [{ model: db.Ecole }] }]
        }
      ],
      order: [['dateDebut', 'DESC']]
    });

    return sessions.map(s => ({
      sessionId: s.id,
      quizzId: s.quizz_id,
      titre: s.Quizz.Evaluation.titre,
      cours: s.Quizz.Evaluation.Cours.nom,
      date: s.dateFin || s.dateDebut,
      statut: s.statut,
      ecole: s.Etudiant.Classe?.Ecole?.nom || 'N/A',
      classe: s.Etudiant.Classe?.nom || 'N/A'
    }));
  }
}

module.exports = new StatsService();
