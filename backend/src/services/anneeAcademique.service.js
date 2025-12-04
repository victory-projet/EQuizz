// backend/src/services/anneeAcademique.service.js

const anneeAcademiqueRepository = require('../repositories/anneeAcademique.repository');
const db = require('../models');
const { Op } = require('sequelize');

class AnneeAcademiqueService {
  /**
   * Logique métier pour s'assurer qu'une seule année est courante.
   */
  async _ensureSingleCurrentYear(currentYearId) {
    await db.AnneeAcademique.update(
      { estCourante: false },
      { where: { id: { [Op.ne]: currentYearId } } } // Met à jour toutes les autres années
    );
  }

  async create(data) {
    const annee = await anneeAcademiqueRepository.create(data);
    if (data.estCourante) {
      await this._ensureSingleCurrentYear(annee.id);
    }
    return annee;
  }

  async findAll() {
    return anneeAcademiqueRepository.findAll();
  }

  async findOne(id) {
    const annee = await anneeAcademiqueRepository.findById(id);
    if (!annee) {
      throw new Error('Année académique non trouvée.');
    }
    return annee;
  }

  async update(id, data) {
    if (data.estCourante === true) {
      await this._ensureSingleCurrentYear(id);
    }
    const updatedAnnee = await anneeAcademiqueRepository.update(id, data);
    if (!updatedAnnee) {
      throw new Error('Année académique non trouvée.');
    }
    return updatedAnnee;
  }

  async delete(id) {
    const result = await anneeAcademiqueRepository.update(id, { estArchive: true });
    if (!result) {
      throw new Error('Année académique non trouvée.');
    }
    return { message: 'Année académique archivée avec succès.' };
  }
}

module.exports = new AnneeAcademiqueService();