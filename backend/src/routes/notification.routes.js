// backend/src/routes/notification.routes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// GET /api/notifications - Récupérer les notifications de l'étudiant
router.get('/', notificationController.getMyNotifications);

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
