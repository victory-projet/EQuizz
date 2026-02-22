// backend/src/repositories/classe.repository.js

const db = require('../models');

class ClasseRepository {
  async create(data) {
    return db.Classe.create(data);
  }

  async findAll() {
    return db.Classe.findAll({
      include: [
        { model: db.Ecole }, // Inclure l'école à laquelle la classe appartient
        { model: db.AnneeAcademique }, // Inclure l'année académique
        { model: db.Cours },  // Inclure les cours associés à cette classe
        { model: db.Etudiant } // Inclure les étudiants de la classe
      ],
      order: [['nom', 'ASC']]
    });
  }

  async findAllWithScope(scope = 'defaultScope') {
    return db.Classe.scope(scope).findAll({
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique },
        { model: db.Cours },
        { model: db.Etudiant }
      ],
      order: [['nom', 'ASC']]
    });
  }

  async findById(id) {
    return db.Classe.findByPk(id, {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique },
        { model: db.Cours },
        { model: db.Etudiant }
      ]
    });
  }

  async findByIdWithScope(id, scope = 'defaultScope') {
    return db.Classe.scope(scope).findByPk(id, {
      include: [
        { model: db.Ecole },
        { model: db.AnneeAcademique },
        { model: db.Cours },
        { model: db.Etudiant }
      ]
    });
  }

  async update(id, data) {
    const classe = await db.Classe.scope('all').findByPk(id); // Utiliser scope 'all' pour trouver même les archivés
    if (classe) {
      return classe.update(data);
    }
    return null;
  }

  async delete(id) {
    return db.Classe.destroy({
      where: { id: id }
    });
  }
}

module.exports = new ClasseRepository();