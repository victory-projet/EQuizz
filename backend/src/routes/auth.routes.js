const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { claimAccountValidationRules, validate } = require('../middlewares/validation.middleware');

// La route utilise  le middleware pour valider les données AVANT d'atteindre le contrôleur.
router.post('/claim-account', claimAccountValidationRules(), validate, authController.claimAccount);

module.exports = router;