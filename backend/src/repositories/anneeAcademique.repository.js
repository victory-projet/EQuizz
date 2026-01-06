const { AnneeAcademique, Semestre, Cours } = require('../models');

class AnneeAcademiqueRepository {
  async findAll(options = {}) {
    return await AnneeAcademique.findAll({
      include: options.include || [],
      where: options.where || {},
      order: options.order || [['dateDebut', 'DESC']],
      ...options
    });
  }

  async findById(id, options = {}) {
    return await AnneeAcademique.findByPk(id, {
      include: options.include || [],
      ...options
    });
  }

  async findOne(where, options = {}) {
    return await AnneeAcademique.findOne({
      where,
      include: options.include || [],
      ...options
    });
  }

  async create(data) {
    return await AnneeAcademique.create(data);
  }

  async update(id, data) {
    const [updatedRowsCount] = await AnneeAcademique.update(data, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  async delete(id) {
    const deletedRowsCount = await AnneeAcademique.destroy({
      where: { id }
    });
    
    return deletedRowsCount > 0;
  }

  async findActive() {
    return await AnneeAcademique.findOne({
      where: { estActive: true }
    });
  }

  async setActive(id) {
    // Désactiver toutes les années académiques
    await AnneeAcademique.update(
      { estActive: false },
      { where: {} }
    );
    
    // Activer l'année spécifiée seulement si un ID est fourni
    if (id) {
      return await this.update(id, { estActive: true });
    }
    
    return null;
  }
}

module.exports = new AnneeAcademiqueRepository();