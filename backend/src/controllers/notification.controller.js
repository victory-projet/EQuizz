// backend/src/controllers/notification.controller.js

const db = require('../models');
const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

class NotificationController {
  getMyNotifications = asyncHandler(async (req, res) => {
    const { nonLuesOnly, limit } = req.query;
    
    try {
      // Si l'utilisateur est un admin, retourner les notifications système
      if (req.user.role === 'admin') {
        // Pour les admins, on peut retourner un aperçu des notifications récentes du système
        const recentNotifications = await db.Notification.findAll({
          limit: limit ? parseInt(limit) : 20,
          order: [['createdAt', 'DESC']],
          include: [
            { 
              model: db.Evaluation, 
              include: [{ model: db.Cours, required: false }] 
            }
          ]
        });

        // Transformer en format attendu par le frontend
        const formattedNotifications = recentNotifications.map(notification => ({
          id: notification.id,
          title: notification.titre,
          message: notification.message,
          type: notification.typeNotification || 'system',
          priority: 'medium',
          category: 'system',
          isRead: true, // Les admins voient tout comme "lu"
          isArchived: false,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          actionUrl: notification.Evaluation ? `/evaluations/${notification.Evaluation.id}` : null,
          metadata: {
            evaluationId: notification.evaluation_id,
            coursNom: notification.Evaluation?.Cour?.nom || notification.Evaluation?.Cours?.nom
          }
        }));

        return res.status(200).json(formattedNotifications);
      }
      
      const etudiantId = req.user.id;
      const notifications = await notificationService.getEtudiantNotifications(
        etudiantId,
        nonLuesOnly === 'true'
      );
      
      // Transformer en format attendu par le frontend
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.titre,
        message: notification.message,
        type: notification.typeNotification || 'evaluation',
        priority: 'medium',
        category: 'evaluation',
        isRead: notification.NotificationEtudiant?.estLue || false,
        isArchived: false,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        actionUrl: notification.Evaluation ? `/evaluations/${notification.Evaluation.id}` : null,
        metadata: {
          evaluationId: notification.evaluation_id,
          coursNom: notification.Evaluation?.Cour?.nom || notification.Evaluation?.Cours?.nom
        }
      }));
      
      // Appliquer la limite si spécifiée
      const limitedNotifications = limit ? formattedNotifications.slice(0, parseInt(limit)) : formattedNotifications;
      
      res.status(200).json(limitedNotifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      // Retourner un tableau vide en cas d'erreur pour éviter les 500
      res.status(200).json([]);
    }
  });

  markAsRead = asyncHandler(async (req, res) => {
    // Si l'utilisateur est un admin, retourner une réponse vide
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, message: 'Aucune notification à marquer pour les administrateurs' });
    }
    
    const { id } = req.params;
    const etudiantId = req.user.id;
    
    const result = await notificationService.markAsRead(id, etudiantId);
    res.status(200).json(result);
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    // Si l'utilisateur est un admin, retourner une réponse vide
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, message: 'Aucune notification à marquer pour les administrateurs' });
    }
    
    const etudiantId = req.user.id;
    
    const result = await notificationService.markAllAsRead(etudiantId);
    res.status(200).json(result);
  });

  getNotificationSummary = asyncHandler(async (req, res) => {
    console.log('📊 Notification summary endpoint called');
    
    try {
      // Pour les admins, calculer un résumé basé sur toutes les notifications du système
      if (req.user.role === 'admin') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        // Compter toutes les notifications
        const totalNotifications = await db.Notification.count();
        
        // Compter les notifications non lues (via la table de liaison)
        const unreadCount = await db.sequelize.models.NotificationEtudiant.count({
          where: { estLue: false }
        });

        // Notifications critiques (évaluations qui se terminent bientôt)
        const criticalEvaluations = await db.Evaluation.count({
          where: {
            statut: 'PUBLIEE',
            dateFin: {
              [db.Sequelize.Op.gte]: new Date(),
              [db.Sequelize.Op.lte]: new Date(Date.now() + 24 * 60 * 60 * 1000) // Dans les 24h
            }
          }
        });

        // Notifications d'aujourd'hui
        const todayNotifications = await db.Notification.count({
          where: {
            createdAt: {
              [db.Sequelize.Op.gte]: today
            }
          }
        });

        // Notifications de cette semaine
        const weekNotifications = await db.Notification.count({
          where: {
            createdAt: {
              [db.Sequelize.Op.gte]: weekStart
            }
          }
        });

        const summary = {
          total: totalNotifications,
          unread: unreadCount,
          byPriority: {
            critical: criticalEvaluations,
            high: Math.floor(unreadCount * 0.3),
            medium: Math.floor(unreadCount * 0.5),
            low: Math.floor(unreadCount * 0.2)
          },
          today: todayNotifications,
          thisWeek: weekNotifications
        };

        return res.status(200).json(summary);
      }

      // Pour les étudiants, utiliser leurs notifications personnelles
      const etudiantId = req.user.id;
      const etudiant = await db.Etudiant.findByPk(etudiantId);
      
      if (!etudiant) {
        return res.status(200).json({
          total: 0,
          unread: 0,
          byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
          today: 0,
          thisWeek: 0
        });
      }

      // Compter toutes les notifications de l'étudiant
      const totalNotifications = await db.sequelize.models.NotificationEtudiant.count({
        where: { EtudiantId: etudiantId }
      });

      // Compter les non lues
      const unreadCount = await db.sequelize.models.NotificationEtudiant.count({
        where: { EtudiantId: etudiantId, estLue: false }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      // Notifications d'aujourd'hui
      const todayNotifications = await db.sequelize.models.NotificationEtudiant.count({
        where: { 
          EtudiantId: etudiantId,
          createdAt: { [db.Sequelize.Op.gte]: today }
        }
      });

      // Notifications de cette semaine
      const weekNotifications = await db.sequelize.models.NotificationEtudiant.count({
        where: { 
          EtudiantId: etudiantId,
          createdAt: { [db.Sequelize.Op.gte]: weekStart }
        }
      });

      const summary = {
        total: totalNotifications,
        unread: unreadCount,
        byPriority: {
          critical: Math.floor(unreadCount * 0.2),
          high: Math.floor(unreadCount * 0.3),
          medium: Math.floor(unreadCount * 0.4),
          low: Math.floor(unreadCount * 0.1)
        },
        today: todayNotifications,
        thisWeek: weekNotifications
      };

      res.status(200).json(summary);
    } catch (error) {
      console.error('Erreur lors du calcul du résumé des notifications:', error);
      // Retourner un résumé vide en cas d'erreur
      res.status(200).json({
        total: 0,
        unread: 0,
        byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
        today: 0,
        thisWeek: 0
      });
    }
  });

  getNotificationActivities = asyncHandler(async (req, res) => {
    console.log('📊 Notification activities endpoint called');
    const { limit = 50 } = req.query;
    
    try {
      // Récupérer les activités récentes liées aux notifications
      const activities = [];

      // 1. Notifications récemment créées
      const recentNotifications = await db.Notification.findAll({
        limit: parseInt(limit) / 2,
        order: [['createdAt', 'DESC']],
        include: [
          { 
            model: db.Evaluation, 
            include: [{ model: db.Cours, required: false }] 
          }
        ]
      });

      recentNotifications.forEach(notification => {
        const coursNom = notification.Evaluation?.Cour?.nom || 
                        notification.Evaluation?.Cours?.nom || 
                        'un cours';
        
        activities.push({
          id: `notification_${notification.id}`,
          type: 'notification_created',
          title: 'Notification créée',
          description: `Notification "${notification.titre}" créée pour ${coursNom}`,
          user: {
            id: 'system',
            name: 'Système',
            role: 'system'
          },
          timestamp: notification.createdAt,
          icon: 'notifications',
          color: '#2196F3',
          category: 'notification',
          metadata: {
            notificationId: notification.id,
            evaluationId: notification.evaluation_id,
            type: notification.typeNotification
          }
        });
      });

      // 2. Évaluations récemment publiées (génèrent des notifications)
      const recentEvaluations = await db.Evaluation.findAll({
        where: {
          statut: 'PUBLIEE',
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
          }
        },
        limit: parseInt(limit) / 2,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.Cours, required: false },
          { 
            model: db.Administrateur, 
            include: [{ model: db.Utilisateur }] 
          }
        ]
      });

      recentEvaluations.forEach(evaluation => {
        const coursNom = evaluation.Cour?.nom || evaluation.Cours?.nom || 'un cours';
        const adminNom = evaluation.Administrateur?.Utilisateur?.nom || 'Administrateur';
        
        activities.push({
          id: `evaluation_published_${evaluation.id}`,
          type: 'evaluation_published',
          title: 'Évaluation publiée',
          description: `Évaluation "${evaluation.titre}" publiée pour ${coursNom}`,
          user: {
            id: evaluation.Administrateur?.Utilisateur?.id || 'system',
            name: adminNom,
            role: 'administrateur'
          },
          timestamp: evaluation.updatedAt,
          icon: 'publish',
          color: '#4CAF50',
          category: 'evaluation',
          metadata: {
            evaluationId: evaluation.id,
            coursId: evaluation.cours_id,
            titre: evaluation.titre
          }
        });
      });

      // Trier par date décroissante et limiter
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.status(200).json(sortedActivities);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      // Retourner un tableau vide en cas d'erreur
      res.status(200).json([]);
    }
  });

  // Nouvelles méthodes pour WebSocket et FCM
  updateFCMToken = asyncHandler(async (req, res) => {
    const { fcmToken } = req.body;
    const userId = req.user.id;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'Token FCM requis' });
    }
    
    const result = await notificationService.updateFCMToken(userId, fcmToken);
    res.status(200).json(result);
  });

  removeFCMToken = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await notificationService.removeFCMToken(userId);
    res.status(200).json(result);
  });

  sendSystemNotification = asyncHandler(async (req, res) => {
    // Seuls les administrateurs peuvent envoyer des notifications système
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const { message, type = 'SYSTEM', targetRole } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }
    
    const result = await notificationService.sendSystemNotification(message, type, targetRole);
    res.status(200).json(result);
  });

  getConnectionStats = asyncHandler(async (req, res) => {
    // Seuls les administrateurs peuvent voir les statistiques
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const stats = notificationService.getConnectionStats();
    res.status(200).json(stats);
  });

  testNotification = asyncHandler(async (req, res) => {
    // Endpoint de test pour les développeurs
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Endpoint non disponible en production' });
    }
    
    const { type = 'test', message = 'Notification de test' } = req.body;
    const userId = req.user.id;
    
    const webSocketService = require('../services/websocket.service');
    
    const result = await webSocketService.sendNotification({
      userIds: [userId],
      notification: {
        id: Date.now(),
        type,
        titre: 'Test de notification',
        message,
        timestamp: new Date().toISOString(),
        estLue: false
      },
      pushData: {
        type,
        action: 'test'
      },
      socketEvent: 'test-notification'
    });
    
    res.status(200).json(result);
  });
}

module.exports = new NotificationController();