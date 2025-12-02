const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { claimAccountValidationRules,loginValidationRules, validate } = require('../middlewares/validation.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Routes publiques
router.post('/claim-account', claimAccountValidationRules(), validate, authController.claimAccount);
router.post('/login', loginValidationRules(), validate, authController.login);
router.post('/link-card', authController.linkCard);

// Routes protégées (nécessitent authentification)
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refreshToken);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;