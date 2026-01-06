const anneeAcademiqueRepository = require('../repositories/anneeAcademique.repository');
const AppError = require('../utils/AppError');

class AnneeAcademiqueService {
  async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, search, estActive, estArchive } = options;
      
      const where = {};
      
      if (search) {
        where.libelle = { [require('sequelize').Op.like]: `%${search}%` };
      }
      
      if (estActive !== undefined) {
        where.estActive = estActive;
      }
      
      if (estArchive !== undefined) {
        where.estArchive = estArchive;
      }

      return await anneeAcademiqueRepository.findAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['dateDebut', 'DESC']]
      });
    } catch (error) {
      throw new AppError(`Erreur lors de la récupération des années académiques: ${error.message}`, 500);
    }
  }

  async findById(id) {
    try {
      const anneeAcademique = await anneeAcademiqueRepository.findById(id, {
        include: ['Semestres', 'Cours']
      });
      
      if (!anneeAcademique) {
        throw new AppError('Année académique non trouvée', 404);
      }
      
      return anneeAcademique;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erreur lors de la récupération de l'année académique: ${error.message}`, 500);
    }
  }

  async create(data) {
    try {
      // Vérifier si une année avec le même libellé existe déjà
      const existingAnnee = await anneeAcademiqueRepository.findOne({
        libelle: data.libelle
      });
      
      if (existingAnnee) {
        throw new AppError('Une année académique avec ce libellé existe déjà', 400);
      }

      // Si c'est la première année ou si estActive est true, désactiver les autres
      if (data.estActive) {
        await this.setActive(null); // Désactiver toutes
      }

      return await anneeAcademiqueRepository.create(data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erreur lors de la création de l'année académique: ${error.message}`, 500);
    }
  }

  async update(id, data) {
    try {
      const anneeAcademique = await anneeAcademiqueRepository.findById(id);
      
      if (!anneeAcademique) {
        throw new AppError('Année académique non trouvée', 404);
      }

      // Si on active cette année, désactiver les autres
      if (data.estActive && !anneeAcademique.estActive) {
        await this.setActive(id);
        delete data.estActive; // Éviter la double mise à jour
      }

      return await anneeAcademiqueRepository.update(id, data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erreur lors de la mise à jour de l'année académique: ${error.message}`, 500);
    }
  }

  async delete(id) {
    try {
      const anneeAcademique = await anneeAcademiqueRepository.findById(id);
      
      if (!anneeAcademique) {
        throw new AppError('Année académique non trouvée', 404);
      }

      if (anneeAcademique.estActive) {
        throw new AppError('Impossible de supprimer l\'année académique active', 400);
      }

      const deleted = await anneeAcademiqueRepository.delete(id);
      
      if (!deleted) {
        throw new AppError('Erreur lors de la suppression', 500);
      }
      
      return { message: 'Année académique supprimée avec succès' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erreur lors de la suppression de l'année académique: ${error.message}`, 500);
    }
  }

  async setActive(id) {
    try {
      if (id) {
        const anneeAcademique = await anneeAcademiqueRepository.findById(id);
        if (!anneeAcademique) {
          throw new AppError('Année académique non trouvée', 404);
        }
      }

      return await anneeAcademiqueRepository.setActive(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Erreur lors de l'activation de l'année académique: ${error.message}`, 500);
    }
  }

  async getActive() {
    try {
      return await anneeAcademiqueRepository.findActive();
    } catch (error) {
      throw new AppError(`Erreur lors de la récupération de l'année académique active: ${error.message}`, 500);
    }
  }
}

module.exports = new AnneeAcademiqueService();