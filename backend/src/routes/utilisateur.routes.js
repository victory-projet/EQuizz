const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { authenticate, authorize, isSuperAdmin, isSchoolAdmin } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification et le rôle ADMIN ou SUPER-ADMIN
router.use(authenticate);
router.use(authorize(['SUPER-ADMIN', 'ADMIN']));

// Routes CRUD standards (accessibles par tout admin)
router.get('/', utilisateurController.getAllUtilisateurs);
router.post('/', utilisateurController.createUtilisateur);
// Routes statiques AVANT les routes paramétrées (:id)
router.post('/import', utilisateurController.importUtilisateurs);
router.get('/:id', utilisateurController.getUtilisateurById);
router.put('/:id', utilisateurController.updateUtilisateur);
router.delete('/:id', utilisateurController.deleteUtilisateur);
router.post('/:id/reset-password', utilisateurController.resetPassword);

module.exports = router;
