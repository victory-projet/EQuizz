const db = require('../models');

class EcoleRepository {
  //Crée une nouvelle école en base de données.

  async create(data) {
    return db.Ecole.create(data);
  }

  // Récupère toutes les écoles (non supprimées logiquement).

  async findAll() {
    return db.Ecole.findAll();
  }

  // Récupère une école par son identifiant (clé primaire).
  async findById(id) {
    return db.Ecole.findByPk(id);
  }

  // Met à jour les données d'une école existante.

  async update(id, data) {
    const ecole = await this.findById(id);
    if (ecole) {
      return ecole.update(data);
    }
    return null; 
  }

  // Supprime logiquement une école .
  
  async delete(id) {
    return db.Ecole.destroy({
      where: { id: id }
    });
  }
}

module.exports = new EcoleRepository();