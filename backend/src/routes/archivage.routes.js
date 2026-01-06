// backend/src/routes/archivage.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const archivageController = require('../controllers/archivage.controller');

// Sécuriser toutes les routes
router.use(authenticate, isAdmin);

// Route générale pour lister tous les archivages
router.get('/', archivageController.getAll);

// =========================================================
// --- Routes générales d'archivage ---
// =========================================================

// POST /api/archivage/:modelName/:entityId/archive - Archiver une entité
router.post('/:modelName/:entityId/archive', archivageController.archive);

// POST /api/archivage/:modelName/:entityId/restore - Restaurer une entité
router.post('/:modelName/:entityId/restore', archivageController.restore);

// GET /api/archivage/:modelName/archived - Récupérer les entités archivées d'un type
router.get('/:modelName/archived', archivageController.getArchived);

// DELETE /api/archivage/:modelName/:entityId/permanent - Suppression définitive
router.delete('/:modelName/:entityId/permanent', archivageController.permanentDelete);

// =========================================================
// --- Routes d'administration ---
// =========================================================

// GET /api/archivage/stats - Statistiques d'archivage
router.get('/stats', archivageController.getStats);

// GET /api/archivage/activity - Activité récente d'archivage
router.get('/activity', archivageController.getRecentActivity);

// POST /api/archivage/cleanup - Nettoyage des entités anciennes
// Query params: daysOld (défaut: 365)
router.post('/cleanup', archivageController.cleanup);

// POST /api/archivage/:modelName/cleanup - Nettoyage d'un type spécifique
router.post('/:modelName/cleanup', archivageController.cleanup);

module.exports = router;