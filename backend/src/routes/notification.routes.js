// backend/src/routes/notification.routes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// GET /api/notifications - Récupérer les notifications de l'étudiant
router.get('/', notificationController.getMyNotifications);

// GET /api/notifications/summary - Récupérer le résumé des notifications
router.get('/summary', notificationController.getNotificationSummary);

// GET /api/notifications/activities - Récupérer les activités de notifications
router.get('/activities', notificationController.getNotificationActivities);

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
router.put('/read-all', notificationController.markAllAsRead);

// PATCH /api/notifications/mark-all-read - Marquer toutes les notifications comme lues (alternative)
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
