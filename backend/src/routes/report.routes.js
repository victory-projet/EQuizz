// backend/src/routes/report.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const reportController = require('../controllers/report.controller');
const exportController = require('../controllers/export.controller');

// Toutes les routes nécessitent l'authentification admin
router.use(authenticate, isAdmin);

// =========================================================
// --- Routes pour les Rapports ---
// =========================================================

// GET /api/reports/:id - Récupérer le rapport d'une évaluation
router.get('/:id', reportController.getReport);

// GET /api/reports/:id/pdf - Exporter le rapport en PDF
router.get('/:id/pdf', reportController.exportPDF);

// =========================================================
// --- Routes pour les Exports Excel ---
// =========================================================

// GET /api/reports/:id/excel - Exporter une évaluation en Excel
router.get('/:id/excel', exportController.exportEvaluationExcel);

// GET /api/reports/export/students - Exporter la liste des étudiants
router.get('/export/students', exportController.exportStudentsExcel);

// GET /api/reports/export/courses - Exporter la liste des cours
router.get('/export/courses', exportController.exportCoursesExcel);

// GET /api/reports/export/stats - Exporter les statistiques globales
router.get('/export/stats', exportController.exportGlobalStatsExcel);

module.exports = router;
