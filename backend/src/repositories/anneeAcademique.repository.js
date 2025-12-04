// backend/src/repositories/anneeAcademique.repository.js

const db = require('../models');

class AnneeAcademiqueRepository {
  async create(data) {
    return db.AnneeAcademique.create(data);
  }

  async findAll() {
    return db.AnneeAcademique.findAll({
      where: { estArchive: false },
      order: [['libelle', 'DESC']]
    });
  }

  async findById(id) {
    return db.AnneeAcademique.findByPk(id);
  }

  async update(id, data) {
    const anneeAcademique = await this.findById(id);
    if (anneeAcademique) {
      return anneeAcademique.update(data);
    }
    return null;
  }

  async delete(id) {
    return db.AnneeAcademique.destroy({
      where: { id: id }
    });
  }
}

module.exports = new AnneeAcademiqueRepository();