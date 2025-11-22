const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { claimAccountValidationRules,loginValidationRules, validate } = require('../middlewares/validation.middleware');

// La route utilise  le middleware pour valider les données AVANT d'atteindre le contrôleur.
router.post('/claim-account', claimAccountValidationRules(), validate, authController.claimAccount);

router.post('/login', loginValidationRules(), validate, authController.login);

// Route pour lier une carte à un compte
router.post('/link-card', authController.linkCard);

module.exports = router;