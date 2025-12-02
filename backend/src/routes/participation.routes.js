const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participation.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Route protégée par authentification (optionnel)
router.get(
  '/taux-par-jour',
  authMiddleware, // Décommenter si vous voulez protéger la route
  participationController.getParticipationRateByDay.bind(participationController)
);

router.get(
  '/taux-global',
  authMiddleware, // Décommenter si vous voulez protéger la route
  participationController.getGlobalParticipationRate.bind(participationController)
);

module.exports = router;