const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const coursEnseignantController = require('../controllers/cours-enseignant.controller');

// Sécuriser toutes les routes
router.use(authenticate, isAdmin);

// Routes pour gérer les associations cours-enseignant

// Assigner un enseignant à un cours
router.post('/cours/:coursId/enseignants', coursEnseignantController.assignerEnseignant);

// Assigner plusieurs enseignants à un cours
router.post('/cours/:coursId/enseignants/bulk', coursEnseignantController.assignerPlusieursEnseignants);

// Obtenir tous les enseignants d'un cours
router.get('/cours/:coursId/enseignants', coursEnseignantController.getEnseignantsByCours);

// Modifier le rôle d'un enseignant dans un cours
router.put('/cours/:coursId/enseignants/:enseignantId', coursEnseignantController.modifierRole);

// Retirer un enseignant d'un cours
router.delete('/cours/:coursId/enseignants/:enseignantId', coursEnseignantController.retirerEnseignant);

// Obtenir tous les cours d'un enseignant
router.get('/enseignants/:enseignantId/cours', coursEnseignantController.getCoursByEnseignant);

module.exports = router;