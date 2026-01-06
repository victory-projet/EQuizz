const express = require('express');
const router = express.Router();
const anneeAcademiqueController = require('../controllers/anneeAcademique.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification admin
router.use(authenticate, isAdmin);

// Routes CRUD
router.get('/', anneeAcademiqueController.findAll);
router.get('/active', anneeAcademiqueController.getActive);
router.get('/:id', anneeAcademiqueController.findById);
router.post('/', anneeAcademiqueController.create);
router.put('/:id', anneeAcademiqueController.update);
router.delete('/:id', anneeAcademiqueController.delete);

// Route spéciale pour activer une année académique
router.put('/:id/activate', anneeAcademiqueController.setActive);

module.exports = router;