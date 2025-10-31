// backend/src/repositories/cours.repository.js

const db = require('../models');

class CoursRepository {
  async create(data) {
    return db.Cours.create(data);
  }

  /**
   * Trouve tous les cours, en incluant l'enseignant et le semestre associés.
   */
  async findAll() {
    return db.Cours.findAll({
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre }
      ],
      order: [['nom', 'ASC']]
    });
  }

  /**
   * Trouve un cours par son ID, en incluant les informations associées.
   */
  async findById(id) {
    return db.Cours.findByPk(id, {
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre }
      ]
    });
  }

  async update(id, data) {
    const cours = await this.findById(id);
    if (cours) {
      return cours.update(data);
    }
    return null;
  }

  async delete(id) {
    return db.Cours.destroy({
      where: { id: id }
    });
  }
}

module.exports = new CoursRepository();