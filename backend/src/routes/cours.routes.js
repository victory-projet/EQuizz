const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const coursController = require('../controllers/cours.controller');

// Sécuriser toutes les routes
router.use(authenticate, isAdmin);

// GET /api/cours - Obtenir tous les cours (avec pagination)
router.get('/', coursController.findAll);

// GET /api/cours/:id - Obtenir un cours par ID
router.get('/:id', coursController.findOne);

// POST /api/cours - Créer un nouveau cours
router.post('/', coursController.create);

// PUT /api/cours/:id - Mettre à jour un cours
router.put('/:id', coursController.update);

// DELETE /api/cours/:id - Supprimer un cours
router.delete('/:id', coursController.delete);

// POST /api/cours/:id/enseignants - Ajouter un enseignant à un cours
router.post('/:id/enseignants', coursController.addEnseignant);

// DELETE /api/cours/:id/enseignants/:enseignantId - Retirer un enseignant d'un cours
router.delete('/:id/enseignants/:enseignantId', coursController.removeEnseignant);

module.exports = router;