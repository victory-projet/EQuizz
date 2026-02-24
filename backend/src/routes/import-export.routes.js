// backend/src/routes/import-export.routes.js

const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Toutes les routes nécessitent une authentification admin
router.use(authenticate);
router.use(authorize(['SUPER-ADMIN', 'ADMIN', 'administrateur']));

// Routes de téléchargement de templates
router.get('/templates/:entityType', importController.downloadTemplate);

// Routes d'export
router.get('/export/ecoles', importController.exportEcoles);
router.get('/export/classes', importController.exportClasses);
router.get('/export/etudiants', importController.exportEtudiants);
router.get('/export/enseignants', importController.exportEnseignants);
router.get('/export/cours', importController.exportCours);

// Routes d'import
router.post('/import/ecoles', upload.single('file'), importController.importEcoles);
router.post('/import/classes', upload.single('file'), importController.importClasses);
router.post('/import/etudiants', upload.single('file'), importController.importEtudiants);
router.post('/import/enseignants', upload.single('file'), importController.importEnseignants);
router.post('/import/cours', upload.single('file'), importController.importCours);

module.exports = router;
