// backend/src/routes/report.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const reportController = require('../controllers/report.controller');

// Toutes les routes nécessitent l'authentification admin
router.use(authenticate, isAdmin);

// GET /api/reports/:id - Récupérer le rapport d'une évaluation
router.get('/:id', reportController.getReport);

// GET /api/reports/:id/pdf - Exporter le rapport en PDF
router.get('/:id/pdf', reportController.exportPDF);

module.exports = router;
