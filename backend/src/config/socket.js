// backend/src/config/socket.js

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../models');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*", // À restreindre en production
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('✅ Socket.IO initialisé avec succès');
    return this.io;
  }

  setupMiddleware() {
    // Middleware d'authentification pour Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.Utilisateur.findByPk(decoded.id);
        
        if (!user) {
          return next(new Error('Utilisateur non trouvé'));
        }

        socket.userId = user.id;
        socket.userRole = decoded.role;
        socket.userEmail = user.email;
        
        next();
      } catch (error) {
        console.error('Erreur authentification Socket.IO:', error.message);
        next(new Error('Token invalide'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`👤 Utilisateur connecté: ${socket.userEmail} (${socket.id})`);
      
      // Enregistrer la connexion
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Rejoindre des rooms basées sur le rôle
      this.joinUserRooms(socket);

      // Événements personnalisés
      socket.on('join-evaluation', (evaluationId) => {
        socket.join(`evaluation-${evaluationId}`);
        console.log(`📝 ${socket.userEmail} a rejoint l'évaluation ${evaluationId}`);
      });

      socket.on('leave-evaluation', (evaluationId) => {
        socket.leave(`evaluation-${evaluationId}`);
        console.log(`📝 ${socket.userEmail} a quitté l'évaluation ${evaluationId}`);
      });

      // Marquer les notifications comme lues
      socket.on('mark-notification-read', async (notificationId) => {
        try {
          if (socket.userRole === 'etudiant') {
            const notificationService = require('../services/notification.service');
            await notificationService.markAsRead(notificationId, socket.userId);
            socket.emit('notification-marked-read', { notificationId });
          }
        } catch (error) {
          console.error('Erreur marquage notification:', error);
          socket.emit('error', { message: 'Erreur lors du marquage de la notification' });
        }
      });

      // Demander le statut des notifications
      socket.on('get-notification-count', async () => {
        try {
          if (socket.userRole === 'etudiant') {
            const notificationService = require('../services/notification.service');
            const notifications = await notificationService.getEtudiantNotifications(socket.userId, true);
            socket.emit('notification-count', { count: notifications.length });
          }
        } catch (error) {
          console.error('Erreur récupération notifications:', error);
        }
      });

      // Déconnexion
      socket.on('disconnect', () => {
        console.log(`👋 Utilisateur déconnecté: ${socket.userEmail} (${socket.id})`);
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
      });
    });
  }

  joinUserRooms(socket) {
    // Rejoindre la room générale de l'utilisateur
    socket.join(`user-${socket.userId}`);
    
    // Rejoindre la room basée sur le rôle
    socket.join(`role-${socket.userRole}`);
    
    console.log(`🏠 ${socket.userEmail} a rejoint les rooms: user-${socket.userId}, role-${socket.userRole}`);
  }

  // Méthodes pour envoyer des notifications
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user-${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  sendToRole(role, event, data) {
    this.io.to(`role-${role}`).emit(event, data);
  }

  sendToEvaluation(evaluationId, event, data) {
    this.io.to(`evaluation-${evaluationId}`).emit(event, data);
  }

  sendToAll(event, data) {
    this.io.emit(event, data);
  }

  // Obtenir les utilisateurs connectés
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  getConnectedUserCount() {
    return this.connectedUsers.size;
  }
}

// Instance singleton
const socketManager = new SocketManager();

module.exports = socketManager;