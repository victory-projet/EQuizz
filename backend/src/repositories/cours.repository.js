// backend/src/repositories/cours.repository.js

const db = require('../models');

class CoursRepository {
  async create(data) {
    return db.Cours.create(data);
  }

  /**
   * Trouve tous les cours, en incluant l'enseignant, le semestre et l'année académique associés.
   */
  async findAll() {
    return db.Cours.findAll({
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre },
        { model: db.AnneeAcademique, as: 'AnneeAcademique' }
      ],
      order: [['nom', 'ASC']]
    });
  }

  async findAllWithScope(scope = 'defaultScope') {
    return db.Cours.scope(scope).findAll({
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre },
        { model: db.AnneeAcademique, as: 'AnneeAcademique' }
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
        { model: db.Semestre },
        { model: db.AnneeAcademique, as: 'AnneeAcademique' }
      ]
    });
  }

  async findByIdWithScope(id, scope = 'defaultScope') {
    return db.Cours.scope(scope).findByPk(id, {
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre },
        { model: db.AnneeAcademique, as: 'AnneeAcademique' }
      ]
    });
  }

  async update(id, data) {
    const cours = await db.Cours.scope('all').findByPk(id); // Utiliser scope 'all' pour trouver même les archivés
    if (cours) {
      return cours.update(data);
    }
    return null;
  }

  async findAllByEcole(ecoleId, includeArchived = false) {
    const scope = includeArchived ? 'all' : 'defaultScope';
    return db.Cours.scope(scope).findAll({
      where: { ecole_id: ecoleId },
      include: [
        { model: db.Enseignant, include: [db.Utilisateur] },
        { model: db.Semestre },
        { model: db.AnneeAcademique, as: 'AnneeAcademique' }
      ],
      order: [['nom', 'ASC']]
    });
  }

  async delete(id) {
    return db.Cours.destroy({
      where: { id: id }
    });
  }
}

module.exports = new CoursRepository();