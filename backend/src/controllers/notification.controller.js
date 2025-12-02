// backend/src/controllers/notification.controller.js

const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

class NotificationController {
  getMyNotifications = asyncHandler(async (req, res) => {
    const etudiantId = req.user.id;
    const { nonLuesOnly } = req.query;
    
    const notifications = await notificationService.getEtudiantNotifications(
      etudiantId,
      nonLuesOnly === 'true'
    );
    
    res.status(200).json(notifications);
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const etudiantId = req.user.id;
    
    const result = await notificationService.markAsRead(id, etudiantId);
    res.status(200).json(result);
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    const etudiantId = req.user.id;
    
    const result = await notificationService.markAllAsRead(etudiantId);
    res.status(200).json(result);
  });
}

module.exports = new NotificationController();
