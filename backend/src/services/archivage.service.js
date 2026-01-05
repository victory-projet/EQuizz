// backend/src/services/archivage.service.js

const db = require('../models');
const AppError = require('../utils/AppError');

class ArchivageService {
  /**
   * Archive une entité au lieu de la supprimer
   * @param {string} modelName - Nom du modèle (Evaluation, Question, Cours, etc.)
   * @param {string} entityId - ID de l'entité à archiver
   * @param {string} userId - ID de l'utilisateur qui archive
   * @param {object} transaction - Transaction Sequelize optionnelle
   * @returns {object} Entité archivée
   */
  async archiveEntity(modelName, entityId, userId, transaction = null) {
    const Model = db[modelName];
    if (!Model) {
      throw AppError.badRequest(`Modèle ${modelName} non trouvé.`, 'INVALID_MODEL');
    }

    // Vérifier que l'entité existe et n'est pas déjà archivée
    const entity = await Model.findByPk(entityId, {
      transaction,
      paranoid: false // Inclure les entités soft-deleted si applicable
    });

    if (!entity) {
      throw AppError.notFound(`${modelName} non trouvé(e).`, 'ENTITY_NOT_FOUND');
    }

    if (entity.estArchive) {
      throw AppError.badRequest(`${modelName} déjà archivé(e).`, 'ALREADY_ARCHIVED');
    }

    // Vérifications spécifiques selon le type d'entité
    await this.validateArchiving(modelName, entity, transaction);

    // Archiver l'entité
    const archivedEntity = await entity.update({
      estArchive: true,
      dateArchivage: new Date(),
      archivedBy: userId
    }, { transaction });

    // Actions post-archivage spécifiques
    await this.handlePostArchiving(modelName, entity, userId, transaction);

    return archivedEntity;
  }

  /**
   * Restaure une entité archivée
   * @param {string} modelName - Nom du modèle
   * @param {string} entityId - ID de l'entité à restaurer
   * @param {string} userId - ID de l'utilisateur qui restaure
   * @param {object} transaction - Transaction Sequelize optionnelle
   * @returns {object} Entité restaurée
   */
  async restoreEntity(modelName, entityId, userId, transaction = null) {
    const Model = db[modelName];
    if (!Model) {
      throw AppError.badRequest(`Modèle ${modelName} non trouvé.`, 'INVALID_MODEL');
    }

    // Chercher dans les entités archivées
    const entity = await Model.scope('onlyArchived').findByPk(entityId, {
      transaction
    });

    if (!entity) {
      throw AppError.notFound(`${modelName} archivé(e) non trouvé(e).`, 'ARCHIVED_ENTITY_NOT_FOUND');
    }

    // Vérifications spécifiques pour la restauration
    await this.validateRestoration(modelName, entity, transaction);

    // Restaurer l'entité
    const restoredEntity = await entity.update({
      estArchive: false,
      dateArchivage: null,
      archivedBy: null
    }, { transaction });

    return restoredEntity;
  }

  /**
   * Supprime définitivement une entité archivée
   * @param {string} modelName - Nom du modèle
   * @param {string} entityId - ID de l'entité à supprimer définitivement
   * @param {string} userId - ID de l'utilisateur qui supprime
   * @param {object} transaction - Transaction Sequelize optionnelle
   * @returns {boolean} Succès de la suppression
   */
  async permanentDelete(modelName, entityId, userId, transaction = null) {
    const Model = db[modelName];
    if (!Model) {
      throw AppError.badRequest(`Modèle ${modelName} non trouvé.`, 'INVALID_MODEL');
    }

    // Vérifier que l'entité est archivée
    const entity = await Model.scope('onlyArchived').findByPk(entityId, {
      transaction
    });

    if (!entity) {
      throw AppError.notFound(`${modelName} archivé(e) non trouvé(e).`, 'ARCHIVED_ENTITY_NOT_FOUND');
    }

    // Vérifications spécifiques pour la suppression définitive
    await this.validatePermanentDeletion(modelName, entity, transaction);

    // Supprimer définitivement
    await entity.destroy({ transaction, force: true });

    return true;
  }

  /**
   * Récupère toutes les entités archivées d'un type
   * @param {string} modelName - Nom du modèle
   * @param {object} options - Options de requête
   * @returns {Array} Liste des entités archivées
   */
  async getArchivedEntities(modelName, options = {}) {
    const Model = db[modelName];
    if (!Model) {
      throw AppError.badRequest(`Modèle ${modelName} non trouvé.`, 'INVALID_MODEL');
    }

    return await Model.scope('onlyArchived').findAll({
      include: [
        {
          model: db.Utilisateur,
          as: 'ArchivedByUser',
          attributes: ['nom', 'prenom', 'email'],
          required: false
        }
      ],
      order: [['dateArchivage', 'DESC']],
      ...options
    });
  }

  /**
   * Valide si une entité peut être archivée
   * @param {string} modelName - Nom du modèle
   * @param {object} entity - Entité à valider
   * @param {object} transaction - Transaction Sequelize
   */
  async validateArchiving(modelName, entity, transaction) {
    switch (modelName) {
      case 'Evaluation':
        // Vérifier qu'il n'y a pas de soumissions en cours
        if (entity.statut === 'PUBLIEE') {
          const submissionsCount = await db.SessionReponse.count({
            where: { 
              quizz_id: entity.Quizz?.id,
              estTermine: false 
            },
            transaction
          });
          
          if (submissionsCount > 0) {
            throw AppError.badRequest(
              'Impossible d\'archiver une évaluation avec des soumissions en cours.',
              'HAS_ACTIVE_SUBMISSIONS'
            );
          }
        }
        break;

      case 'Cours':
        // Vérifier qu'il n'y a pas d'évaluations actives
        const activeEvaluations = await db.Evaluation.count({
          where: { 
            cours_id: entity.id,
            statut: ['BROUILLON', 'PUBLIEE'],
            estArchive: false
          },
          transaction
        });
        
        if (activeEvaluations > 0) {
          throw AppError.badRequest(
            'Impossible d\'archiver un cours avec des évaluations actives.',
            'HAS_ACTIVE_EVALUATIONS'
          );
        }
        break;

      case 'Etudiant':
        // Vérifier qu'il n'y a pas de soumissions en cours
        const activeSubmissions = await db.SessionReponse.count({
          where: { 
            etudiant_id: entity.id,
            estTermine: false
          },
          transaction
        });
        
        if (activeSubmissions > 0) {
          throw AppError.badRequest(
            'Impossible d\'archiver un étudiant avec des soumissions en cours.',
            'HAS_ACTIVE_SUBMISSIONS'
          );
        }
        break;

      case 'Question':
        // Vérifier que la question n'est pas dans une évaluation publiée
        const quizz = await db.Quizz.findOne({
          where: { id: entity.quizz_id },
          include: [{
            model: db.Evaluation,
            where: { statut: 'PUBLIEE' }
          }],
          transaction
        });
        
        if (quizz) {
          throw AppError.badRequest(
            'Impossible d\'archiver une question d\'une évaluation publiée.',
            'EVALUATION_PUBLISHED'
          );
        }
        break;
    }
  }

  /**
   * Valide si une entité peut être restaurée
   * @param {string} modelName - Nom du modèle
   * @param {object} entity - Entité à valider
   * @param {object} transaction - Transaction Sequelize
   */
  async validateRestoration(modelName, entity, transaction) {
    switch (modelName) {
      case 'Etudiant':
        // Vérifier que la classe n'est pas archivée
        if (entity.classe_id) {
          const classe = await db.Classe.findByPk(entity.classe_id, { transaction });
          if (classe && classe.estArchive) {
            throw AppError.badRequest(
              'Impossible de restaurer un étudiant dans une classe archivée.',
              'CLASSE_ARCHIVED'
            );
          }
        }
        break;

      case 'Question':
        // Vérifier que le quizz parent n'est pas archivé
        const quizz = await db.Quizz.findByPk(entity.quizz_id, {
          include: [{ model: db.Evaluation }],
          transaction
        });
        
        if (quizz && quizz.Evaluation && quizz.Evaluation.estArchive) {
          throw AppError.badRequest(
            'Impossible de restaurer une question d\'une évaluation archivée.',
            'EVALUATION_ARCHIVED'
          );
        }
        break;
    }
  }

  /**
   * Valide si une entité peut être supprimée définitivement
   * @param {string} modelName - Nom du modèle
   * @param {object} entity - Entité à valider
   * @param {object} transaction - Transaction Sequelize
   */
  async validatePermanentDeletion(modelName, entity, transaction) {
    switch (modelName) {
      case 'Evaluation':
        // Vérifier qu'il n'y a aucune soumission
        if (entity.Quizz) {
          const submissionsCount = await db.SessionReponse.count({
            where: { quizz_id: entity.Quizz.id },
            transaction
          });
          
          if (submissionsCount > 0) {
            throw AppError.badRequest(
              'Impossible de supprimer définitivement une évaluation avec des soumissions.',
              'HAS_SUBMISSIONS'
            );
          }
        }
        break;

      case 'Etudiant':
        // Vérifier qu'il n'y a aucune soumission
        const submissionsCount = await db.SessionReponse.count({
          where: { etudiant_id: entity.id },
          transaction
        });
        
        if (submissionsCount > 0) {
          throw AppError.badRequest(
            'Impossible de supprimer définitivement un étudiant avec des soumissions.',
            'HAS_SUBMISSIONS'
          );
        }
        break;
    }
  }

  /**
   * Actions à effectuer après l'archivage
   * @param {string} modelName - Nom du modèle
   * @param {object} entity - Entité archivée
   * @param {string} userId - ID de l'utilisateur
   * @param {object} transaction - Transaction Sequelize
   */
  async handlePostArchiving(modelName, entity, userId, transaction) {
    switch (modelName) {
      case 'Evaluation':
        // Archiver automatiquement les questions associées
        if (entity.Quizz) {
          await db.Question.update(
            {
              estArchive: true,
              dateArchivage: new Date(),
              archivedBy: userId
            },
            {
              where: { 
                quizz_id: entity.Quizz.id,
                estArchive: false
              },
              transaction
            }
          );
        }
        break;

      case 'Cours':
        // Archiver automatiquement les évaluations associées
        const evaluations = await db.Evaluation.findAll({
          where: { 
            cours_id: entity.id,
            estArchive: false
          },
          transaction
        });

        for (const evaluation of evaluations) {
          await this.archiveEntity('Evaluation', evaluation.id, userId, transaction);
        }
        break;

      case 'Classe':
        // Archiver automatiquement les étudiants associés
        await db.Etudiant.update(
          {
            estArchive: true,
            dateArchivage: new Date(),
            archivedBy: userId
          },
          {
            where: { 
              classe_id: entity.id,
              estArchive: false
            },
            transaction
          }
        );
        break;
    }
  }

  /**
   * Nettoie les entités archivées anciennes (plus de X jours)
   * @param {number} daysOld - Nombre de jours
   * @param {string} modelName - Nom du modèle (optionnel, tous si non spécifié)
   * @returns {object} Statistiques de nettoyage
   */
  async cleanupOldArchivedEntities(daysOld = 365, modelName = null) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const modelsToClean = modelName ? [modelName] : ['Evaluation', 'Question', 'Cours', 'Etudiant', 'Classe'];
    const results = {};

    for (const model of modelsToClean) {
      if (!db[model]) continue;

      const oldArchivedEntities = await db[model].scope('onlyArchived').findAll({
        where: {
          dateArchivage: {
            [db.Sequelize.Op.lt]: cutoffDate
          }
        }
      });

      let deletedCount = 0;
      for (const entity of oldArchivedEntities) {
        try {
          await this.permanentDelete(model, entity.id, 'system-cleanup');
          deletedCount++;
        } catch (error) {
          console.warn(`Impossible de supprimer ${model} ${entity.id}:`, error.message);
        }
      }

      results[model] = {
        found: oldArchivedEntities.length,
        deleted: deletedCount
      };
    }

    return results;
  }
}

module.exports = new ArchivageService();