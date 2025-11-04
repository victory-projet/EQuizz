// backend/src/services/classe.service.js

const classeRepository = require('../repositories/classe.repository');
const ecoleRepository = require('../repositories/ecole.repository');
const coursRepository = require('../repositories/cours.repository');

class ClasseService {
  async create(data) {
    const ecole = await ecoleRepository.findById(data.ecole_id);
    if (!ecole) {
      throw new Error('École non trouvée. Impossible de créer la classe.');
    }
    return classeRepository.create(data);
  }

  async findAll() {
    return classeRepository.findAll();
  }

  async findOne(id) {
    const classe = await classeRepository.findById(id);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    return classe;
  }

  async update(id, data) {
    const updatedClasse = await classeRepository.update(id, data);
    if (!updatedClasse) {
      throw new Error('Classe non trouvée.');
    }
    return updatedClasse;
  }

  async delete(id) {
    const result = await classeRepository.delete(id);
    if (result === 0) {
      throw new Error('Classe non trouvée.');
    }
    return { message: 'Classe supprimée avec succès.' };
  }

  // --- Logique pour la relation Plusieurs-à-Plusieurs ---

  async addCoursToClasse(classeId, coursId) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const cours = await coursRepository.findById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé.');
    }
    // La méthode addCours est automatiquement ajoutée par Sequelize
    await classe.addCours(cours);
    return { message: 'Cours ajouté à la classe avec succès.' };
  }

  async removeCoursFromClasse(classeId, coursId) {
    const classe = await classeRepository.findById(classeId);
    if (!classe) {
      throw new Error('Classe non trouvée.');
    }
    const cours = await coursRepository.findById(coursId);
    if (!cours) {
      throw new Error('Cours non trouvé.');
    }
    // La méthode removeCours est aussi ajoutée par Sequelize
    await classe.removeCours(cours);
    return { message: 'Cours retiré de la classe avec succès.' };
  }
}

module.exports = new ClasseService();