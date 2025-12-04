// backend/src/repositories/evaluation.repository.js

const db = require('../models');

class EvaluationRepository {
  async create(data, transaction) {
    return db.Evaluation.create(data, { transaction });
  }

  async findAll() {
    return db.Evaluation.findAll({
      where: { estArchive: false },
      include: [
        { model: db.Cours },
        { model: db.Quizz },
        { model: db.Classe } // Inclure les classes associées
      ],
      order: [['dateDebut', 'DESC']]
    });
  }

  async findById(id) {
    return db.Evaluation.findByPk(id, {
      include: [
        { model: db.Cours },
        {
          model: db.Quizz,
          include: [{
            model: db.Question,
            where: { estArchive: false },
            required: false
          }]
        },
        { model: db.Classe } // Inclure les classes associées
      ]
    });
  }

  async update(id, data) {
    const evaluation = await db.Evaluation.findByPk(id);
    if (evaluation) {
      return evaluation.update(data);
    }
    return null;
  }

  async delete(id) {
    // La suppression en cascade s'occupera de supprimer le Quizz associé
    return db.Evaluation.destroy({
      where: { id: id }
    });
  }
}

module.exports = new EvaluationRepository();