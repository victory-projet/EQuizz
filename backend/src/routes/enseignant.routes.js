const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignant.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les enseignants
router.get('/', authorize(['ADMIN']), enseignantController.getAllEnseignants);
router.get('/:id', authorize(['ADMIN', 'ENSEIGNANT']), enseignantController.getEnseignantById);
router.post('/', authorize(['ADMIN']), enseignantController.createEnseignant);
router.put('/:id', authorize(['ADMIN']), enseignantController.updateEnseignant);
router.delete('/:id', authorize(['ADMIN']), enseignantController.deleteEnseignant);

// Routes pour les cours d'un enseignant
router.get('/:id/cours', authorize(['ADMIN', 'ENSEIGNANT']), enseignantController.getCoursEnseignant);

module.exports = router;