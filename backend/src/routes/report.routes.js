const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Route générale pour les rapports
router.get('/', authorize(['ADMIN', 'ENSEIGNANT']), reportController.getAllReports);

// Obtenir le rapport complet d'une évaluation
router.get('/evaluations/:id', reportController.getEvaluationReport);

// Obtenir les options de filtrage (classes, enseignants)
router.get('/filter-options', reportController.getFilterOptions);

// Exporter un rapport en PDF
router.post('/evaluations/:id/export-pdf', reportController.exportToPDF);

module.exports = router;