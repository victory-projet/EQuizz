// backend/src/repositories/quizz.repository.js

const db = require('../models');
const { Op } = require('sequelize');

class QuizzRepository {

  /**
   * Trouve toutes les évaluations publiées et actives pour une classe donnée.
   * @param {string} classeId - L'UUID de la classe de l'étudiant.
   * @returns {Promise<db.Evaluation[]>}
   */
  async findAvailableEvaluationsForClass(classeId) {
    const currentDate = new Date();

    return db.Evaluation.findAll({
      where: {
        statut: 'PUBLIEE',
        dateDebut: { [Op.lte]: currentDate }, // La date de début est passée
        dateFin: { [Op.gte]: currentDate }     // La date de fin n'est pas encore passée
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
          through: { attributes: [] } // Exclure les attributs de la table de jonction
        },
        {
          model: db.Quizz,
          attributes: ['id', 'titre', 'instructions']
        }
      ],
      order: [['dateFin', 'ASC']] // Les plus urgentes en premier
    });
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
          attributes: ['id', 'enonce', 'typeQuestion', 'options'] // On ne renvoie que les champs utiles
        }
      ],
      order: [[db.Question, 'createdAt', 'ASC']] // Ordonner les questions
    });
  }
}

module.exports = new QuizzRepository();