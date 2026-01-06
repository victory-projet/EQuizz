// backend/src/repositories/semestre.repository.js

const db = require('../models');

class SemestreRepository {
  async create(data) {
    return db.Semestre.create(data);
  }

  /**
   * Trouve tous les semestres liés à une année académique spécifique.
   * @param {string} anneeAcademiqueId - L'UUID de l'année académique.
   */
  async findAllByAnnee(anneeAcademiqueId) {
    return db.Semestre.findAll({
      where: { annee_academique_id: anneeAcademiqueId },
      order: [['numero', 'ASC']]
    });
  }

  async findById(id) {
    return db.Semestre.findByPk(id);
  }

  async update(id, data) {
    const semestre = await this.findById(id);
    if (semestre) {
      return semestre.update(data);
    }
    return null;
  }

  async delete(id) {
    return db.Semestre.destroy({
      where: { id: id }
    });
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Semestre.findAndCountAll({
      include: [{
        model: db.AnneeAcademique,
        attributes: ['id', 'nom', 'dateDebut', 'dateFin']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      semestres: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }
}

module.exports = new SemestreRepository();