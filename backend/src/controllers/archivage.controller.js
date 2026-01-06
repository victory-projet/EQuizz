// backend/src/controllers/archivage.controller.js

const archivageService = require('../services/archivage.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

class ArchivageController {
  /**
   * Archive une entité
   */
  archive = asyncHandler(async (req, res) => {
    const { modelName, entityId } = req.params;
    const userId = req.user.id;

    const archivedEntity = await archivageService.archiveEntity(modelName, entityId, userId);
    
    res.status(200).json({
      message: `${modelName} archivé(e) avec succès.`,
      entity: archivedEntity
    });
  });

  /**
   * Restaure une entité archivée
   */
  restore = asyncHandler(async (req, res) => {
    const { modelName, entityId } = req.params;
    const userId = req.user.id;

    const restoredEntity = await archivageService.restoreEntity(modelName, entityId, userId);
    
    res.status(200).json({
      message: `${modelName} restauré(e) avec succès.`,
      entity: restoredEntity
    });
  });

  /**
   * Récupère toutes les entités archivées d'un type
   */
  getArchived = asyncHandler(async (req, res) => {
    const { modelName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const archivedEntities = await archivageService.getArchivedEntities(modelName, options);
    
    res.status(200).json({
      entities: archivedEntities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: archivedEntities.length
      }
    });
  });

  /**
   * Supprime définitivement une entité archivée
   */
  permanentDelete = asyncHandler(async (req, res) => {
    const { modelName, entityId } = req.params;
    const userId = req.user.id;

    await archivageService.permanentDelete(modelName, entityId, userId);
    
    res.status(200).json({
      message: `${modelName} supprimé(e) définitivement avec succès.`
    });
  });

  /**
   * Nettoie les entités archivées anciennes
   */
  cleanup = asyncHandler(async (req, res) => {
    const { modelName } = req.params;
    const { daysOld = 365 } = req.query;

    // Vérifier que l'utilisateur a les droits d'administration
    if (!req.user.isAdmin) {
      throw AppError.forbidden('Seuls les administrateurs peuvent effectuer le nettoyage.', 'ADMIN_REQUIRED');
    }

    const results = await archivageService.cleanupOldArchivedEntities(
      parseInt(daysOld),
      modelName || null
    );
    
    res.status(200).json({
      message: 'Nettoyage effectué avec succès.',
      results
    });
  });

  /**
   * Récupère les statistiques d'archivage
   */
  getStats = asyncHandler(async (req, res) => {
    const db = require('../models');
    const models = ['Evaluation', 'Question', 'Cours', 'Etudiant', 'Classe', 'CoursEnseignant'];
    
    const stats = {};
    
    for (const modelName of models) {
      if (db[modelName]) {
        try {
          const total = await db[modelName].scope('withArchived').count();
          const archived = await db[modelName].scope('onlyArchived').count();
          const active = total - archived;
          
          stats[modelName] = {
            total,
            active,
            archived,
            archiveRate: total > 0 ? Math.round((archived / total) * 100) : 0
          };
        } catch (error) {
          stats[modelName] = {
            error: 'Impossible de récupérer les statistiques'
          };
        }
      }
    }
    
    res.status(200).json({
      stats,
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Récupère l'historique d'archivage récent
   */
  getRecentActivity = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    const db = require('../models');
    
    const models = ['Evaluation', 'Question', 'Cours', 'Etudiant', 'Classe'];
    const recentActivity = [];
    
    for (const modelName of models) {
      if (db[modelName]) {
        try {
          const recentArchived = await db[modelName].scope('onlyArchived').findAll({
            limit: parseInt(limit),
            order: [['dateArchivage', 'DESC']],
            include: [
              {
                model: db.Utilisateur,
                as: 'ArchivedByUser',
                attributes: ['nom', 'prenom', 'email'],
                required: false
              }
            ]
          });
          
          recentArchived.forEach(entity => {
            recentActivity.push({
              type: modelName,
              id: entity.id,
              title: entity.titre || entity.nom || entity.enonce || `${modelName} ${entity.id}`,
              dateArchivage: entity.dateArchivage,
              archivedBy: entity.ArchivedByUser ? {
                nom: entity.ArchivedByUser.nom,
                prenom: entity.ArchivedByUser.prenom,
                email: entity.ArchivedByUser.email
              } : null
            });
          });
        } catch (error) {
          console.warn(`Erreur lors de la récupération de l'activité pour ${modelName}:`, error.message);
        }
      }
    }
    
    // Trier par date d'archivage décroissante
    recentActivity.sort((a, b) => new Date(b.dateArchivage) - new Date(a.dateArchivage));
    
    res.status(200).json({
      activity: recentActivity.slice(0, parseInt(limit)),
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Récupère tous les archivages disponibles
   */
  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, modelName } = req.query;
    
    try {
      // Pour le moment, retourner des données simulées
      const archivages = [];
      
      // Simuler quelques archivages
      for (let i = 1; i <= 5; i++) {
        archivages.push({
          id: i,
          modelName: modelName || 'Evaluation',
          entityId: `entity-${i}`,
          entityName: `Entité archivée ${i}`,
          dateArchivage: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          archivedBy: 'admin',
          statut: 'Archivé'
        });
      }

      res.json({
        archivages,
        pagination: {
          total: archivages.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(archivages.length / limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des archivages:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
}

module.exports = new ArchivageController();