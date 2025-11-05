// backend/src/repositories/quizz.repository.js

const db = require('../models');
const { Op } = require('sequelize');

class QuizzRepository {

  /**
   * Trouve toutes les évaluations publiées et actives pour une classe donnée avec le statut pour l'étudiant.
   * @param {string} classeId - L'UUID de la classe de l'étudiant.
   * @param {string} etudiantId - L'UUID de l'étudiant.
   * @returns {Promise<Array>}
   */
  async findAvailableEvaluationsForClass(classeId, etudiantId) {
    const currentDate = new Date();

    const evaluations = await db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateDebut: { [Op.lte]: currentDate },
        dateFin: { [Op.gte]: currentDate }
      },
      include: [
        {
          model: db.Cours,
          attributes: ['nom', 'code']
        },
        {
          model: db.Classe,
          where: { id: classeId },
          attributes: ['id', 'nom', 'niveau'],
          through: { attributes: [] }
        },
        {
          model: db.Quizz,
          attributes: ['id', 'titre', 'instructions']
        }
      ],
      order: [['dateFin', 'ASC']]
    });

    // Pour chaque évaluation, chercher le token et la session de l'étudiant
    const evaluationsWithStatus = await Promise.all(evaluations.map(async (evaluation) => {
      const evalData = evaluation.toJSON();

      // Chercher le token de l'étudiant pour cette évaluation
      const sessionToken = await db.SessionToken.findOne({
        where: {
          etudiantId: etudiantId,
          evaluationId: evaluation.id
        }
      });

      if (sessionToken) {
        // Chercher la session avec ce token
        const session = await db.SessionReponse.findOne({
          where: { tokenAnonyme: sessionToken.tokenAnonyme },
          attributes: ['id', 'statut', 'dateDebut', 'dateFin', 'tokenAnonyme']
        });

        if (session) {
          evalData.statutEtudiant = session.statut === 'TERMINE' ? 'TERMINE' : 'EN_COURS';
          evalData.tokenAnonyme = session.tokenAnonyme;
          evalData.dateDebutSession = session.dateDebut;
          evalData.dateFinSession = session.dateFin;
        } else {
          evalData.statutEtudiant = 'NOUVEAU';
          evalData.tokenAnonyme = null;
        }
      } else {
        evalData.statutEtudiant = 'NOUVEAU';
        evalData.tokenAnonyme = null;
      }

      return evalData;
    }));

    return evaluationsWithStatus;
  }

  /**
   * Récupère le détail complet d'un quizz avec ses questions pour un étudiant.
   * @param {string} quizzId - L'UUID du quizz.
   * @returns {Promise<db.Quizz|null>}
   */
  async findQuizzWithQuestionsById(quizzId) {
    return db.Quizz.findByPk(quizzId, {
      include: [
        {
          model: db.Question,
          attributes: ['id', 'enonce', 'typeQuestion', 'options']
        }
      ],
      order: [[db.Question, 'createdAt', 'ASC']]
    });
  }
}

module.exports = new QuizzRepository();
