const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const classeController = require('../controllers/classe.controller');

// Sécuriser toutes les routes
router.use(authenticate, isAdmin);

// GET /api/classes - Obtenir toutes les classes
router.get('/', classeController.findAll);

// GET /api/classes/:id - Obtenir une classe par ID
router.get('/:id', classeController.findOne);

// POST /api/classes - Créer une nouvelle classe
router.post('/', classeController.create);

// PUT /api/classes/:id - Mettre à jour une classe
router.put('/:id', classeController.update);

// DELETE /api/classes/:id - Supprimer une classe
router.delete('/:id', classeController.delete);

module.exports = router;