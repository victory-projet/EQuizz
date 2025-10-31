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
        { model: db.Cours }  // Inclure les cours associés à cette classe
      ],
      order: [['nom', 'ASC']]
    });
  }

  async findById(id) {
    return db.Classe.findByPk(id, {
      include: [
        { model: db.Ecole },
        { model: db.Cours }
      ]
    });
  }

  async update(id, data) {
    const classe = await db.Classe.findByPk(id); // On ne veut pas les relations pour un simple update
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