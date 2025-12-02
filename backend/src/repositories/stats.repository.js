// src/repositories/stats.repository.js

// Importez vos modèles Sequelize (ajustez le chemin si nécessaire)
const { Evaluation, sequelize, Cours } = require('../models');
const { Op } = require('sequelize'); // Pour utiliser des opérateurs comme Op.gte (>=)

const StatsRepository = {
  /**
   * Compte le nombre total d'évaluations.
   * @returns {Promise<number>}
   */
  countTotalEvaluations: async () => {
    return Evaluation.count();
  },



  /**
   * Récupère les UE triées par score moyen descendant.
   * Utilise une requête aggrégée.
   * @param {number} limit
   * @returns {Promise<Array<object>>}
   */
  findTopUEsByScore: async (limit = 5) => {
    const results = await Evaluation.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('score')), 'scoreMoyen']
      ],
      // Assurez-vous que l'association existe dans vos modèles (Evaluation.belongsTo(UE))
      include: [{ model: Cours, attributes: ['nom'], required: true }],
      group: ['Cours.id', 'Cours.nom'],
      order: [[sequelize.col('scoreMoyen'), 'DESC']],
      limit: limit,
      raw: true
    });
    return results;
  },

  /**
   * Récupère le décompte des évaluations par jour sur une période donnée (7 derniers jours).
   * @param {number} days
   * @returns {Promise<Array<object>>}
   */
  findEvaluationsPerDay: async (days = 7) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - days));

    const results = await Evaluation.findAll({
      attributes: [
        // Utilise GROUP_CONCAT ou DATE_FORMAT spécifique à MySQL via sequelize.literal
        [sequelize.literal(`DATE_FORMAT(dateSoumission, '%Y-%m-%d')`), 'jour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        dateSoumission: {
          [Op.gte]: sevenDaysAgo // Opérateur Sequelize pour >=
        }
      },
      group: ['jour'],
      order: [['jour', 'ASC']],
      raw: true
    });
    return results;
  }
};

module.exports = StatsRepository;
