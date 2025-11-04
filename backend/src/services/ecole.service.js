const ecoleRepository = require('../repositories/ecole.repository');

class EcoleService {
  // Appelle le repository pour créer une école.

  async create(data) {
    return ecoleRepository.create(data);
  }

  // Appelle le repository pour récupérer toutes les écoles.

  async findAll() {
    return ecoleRepository.findAll();
  }

  // Récupère une école par son ID.
  async findOne(id) {
    const ecole = await ecoleRepository.findById(id);
    if (!ecole) {
      throw new Error('École non trouvée.');
    }
    return ecole;
  }

  // Met à jour une école.
  async update(id, data) {
    const updatedEcole = await ecoleRepository.update(id, data);
    if (!updatedEcole) {
      throw new Error('École non trouvée.');
    }
    return updatedEcole;
  }

  // Supprime une école. Gère le cas où l'école n'est pas trouvée.
  
  async delete(id) {
    const result = await ecoleRepository.delete(id);
    if (result === 0) { // destroy retourne le nombre de lignes supprimées
      throw new Error('École non trouvée.');
    }
    return { message: 'École supprimée avec succès.' };
  }
}

module.exports = new EcoleService();