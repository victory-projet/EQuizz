const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const etudiantController = require('../controllers/etudiant.controller');

// Sécuriser toutes les routes (seuls les admins peuvent gérer les étudiants)
router.use(authenticate, isAdmin);

// Routes CRUD pour les étudiants

// Créer un nouvel étudiant
router.post('/', etudiantController.create);

// Obtenir tous les étudiants avec pagination et filtres
router.get('/', etudiantController.findAll);

// Routes liées aux classes (avant les routes avec :id)

// Obtenir les étudiants d'une classe
router.get('/classe/:classeId', etudiantController.findByClasse);

// Obtenir un étudiant par ID
router.get('/:id', etudiantController.findOne);

// Mettre à jour un étudiant
router.put('/:id', etudiantController.update);

// Supprimer un étudiant
router.delete('/:id', etudiantController.delete);

// Actions spécifiques

// Activer/Désactiver un étudiant
router.patch('/:id/toggle-status', etudiantController.toggleStatus);

// Changer la classe d'un étudiant
router.patch('/:id/change-classe', etudiantController.changeClasse);

module.exports = router;