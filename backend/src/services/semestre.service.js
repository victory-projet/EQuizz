// backend/src/services/semestre.service.js

const semestreRepository = require('../repositories/semestre.repository');
const anneeAcademiqueRepository = require('../repositories/anneeAcademique.repository');

class SemestreService {
  /**
   * Crée un semestre en s'assurant qu'il est lié à une année académique valide.
   * @param {object} data - Doit contenir annee_academique_id.
   */
  async create(data) {
    const annee = await anneeAcademiqueRepository.findById(data.annee_academique_id);
    if (!annee) {
      throw new Error('Année académique non trouvée. Impossible de créer le semestre.');
    }
    return semestreRepository.create(data);
  }

  async findAllByAnnee(anneeAcademiqueId) {
    return semestreRepository.findAllByAnnee(anneeAcademiqueId);
  }

  async findOne(id) {
    const semestre = await semestreRepository.findById(id);
    if (!semestre) {
      throw new Error('Semestre non trouvé.');
    }
    return semestre;
  }

  async update(id, data) {
    const updatedSemestre = await semestreRepository.update(id, data);
    if (!updatedSemestre) {
      throw new Error('Semestre non trouvé.');
    }
    return updatedSemestre;
  }

  async delete(id) {
    const result = await semestreRepository.delete(id);
    if (result === 0) {
      throw new Error('Semestre non trouvé.');
    }
    return { message: 'Semestre supprimé avec succès.' };
  }
}

module.exports = new SemestreService();