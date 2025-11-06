// backend/src/services/cours.service.js

const coursRepository = require('../repositories/cours.repository');
const semestreRepository = require('../repositories/semestre.repository');
const enseignantRepository = require('../repositories/enseignant.repository'); // Nous allons créer ce repo juste après

class CoursService {
  /**
   * Crée un cours en s'assurant qu'il est lié à des entités valides.
   * @param {object} data - Doit contenir semestre_id et enseignant_id.
   */
  async create(data) {
    const semestre = await semestreRepository.findById(data.semestre_id);
    if (!semestre) {
      throw new Error('Semestre non trouvé. Impossible de créer le cours.');
    }

    const enseignant = await enseignantRepository.findById(data.enseignant_id);
    if (!enseignant) {
      throw new Error('Enseignant non trouvé. Impossible de créer le cours.');
    }
    
    return coursRepository.create(data);
  }

  async findAll() {
    return coursRepository.findAll();
  }

  async findOne(id) {
    const cours = await coursRepository.findById(id);
    if (!cours) {
      throw new Error('Cours non trouvé.');
    }
    return cours;
  }

  async update(id, data) {
    // Note: Pour une mise à jour complète, il faudrait aussi valider
    // les nouveaux semestre_id / enseignant_id s'ils sont modifiés.
    const updatedCours = await coursRepository.update(id, data);
    if (!updatedCours) {
      throw new Error('Cours non trouvé.');
    }
    return updatedCours;
  }

  async delete(id) {
    const result = await coursRepository.delete(id);
    if (result === 0) {
      throw new Error('Cours non trouvé.');
    }
    return { message: 'Cours supprimé avec succès.' };
  }
}

module.exports = new CoursService();