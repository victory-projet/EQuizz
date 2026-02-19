const db = require('../models');

class EcoleRepository {
  //Crée une nouvelle école en base de données.

  async create(data) {
    return db.Ecole.create(data);
  }

  // Récupère toutes les écoles (non supprimées logiquement).

  async findAll(options = {}) {
    const { search, limit, offset, sort = 'nom', order = 'ASC' } = options;
    const { Op } = require('sequelize');

    const queryOptions = {
      where: {},
      order: [[sort, order]]
    };

    if (search) {
      queryOptions.where.nom = { [Op.like]: `%${search}%` };
    }

    if (limit) {
      queryOptions.limit = parseInt(limit);
    }

    if (offset) {
      queryOptions.offset = parseInt(offset);
    }

    return db.Ecole.findAndCountAll(queryOptions);
  }

  // Récupère une école par son identifiant (clé primaire).
  async findById(id) {
    return db.Ecole.findByPk(id);
  }

  // Met à jour les données d'une école existante.

  async update(id, data) {
    const [updatedCount] = await db.Ecole.update(data, {
      where: { id: id }
    });

    if (updatedCount > 0) {
      return this.findById(id);
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