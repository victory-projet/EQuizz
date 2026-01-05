// backend/src/routes/push-notification.routes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const pushNotificationController = require('../controllers/push-notification.controller');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// POST /api/push-notifications/register - Enregistrer un token FCM
router.post('/register', pushNotificationController.registerToken);

// POST /api/push-notifications/unregister - Désactiver un token FCM
router.post('/unregister', pushNotificationController.unregisterToken);

// GET /api/push-notifications/tokens - Récupérer les tokens actifs
router.get('/tokens', pushNotificationController.getMyTokens);

// PUT /api/push-notifications/preferences - Mettre à jour les préférences
router.put('/preferences', pushNotificationController.updatePreferences);

// GET /api/push-notifications/preferences - Récupérer les préférences
router.get('/preferences', pushNotificationController.getPreferences);

// POST /api/push-notifications/test - Tester une notification (développement)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', pushNotificationController.testNotification);
}

module.exports = router;