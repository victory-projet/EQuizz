// backend/src/repositories/enseignant.repository.js
const db = require('../models');

class EnseignantRepository {
  async findById(id) {
    return db.Enseignant.findByPk(id);
  }
  // Nous ajouterons les autres méthodes CRUD plus tard si nécessaire
}
module.exports = new EnseignantRepository();