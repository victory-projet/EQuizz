// backend/src/models/NotificationPreference.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Types de notifications
  nouvelleEvaluation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Notifications pour nouvelles évaluations
  },

  rappelEvaluation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Rappels avant fermeture d'évaluation
  },

  evaluationFermee: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Notifications quand évaluation se ferme
  },

  resultatsDisponibles: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Notifications pour résultats disponibles
  },

  confirmationSoumission: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Confirmations de soumission de quiz
  },

  securite: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Notifications de sécurité (changement mot de passe, etc.)
  },

  // Canaux de notification
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Activer les push notifications
  },

  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Activer les notifications par email
  },

  // Horaires de notification
  heureDebutNotifications: {
    type: DataTypes.TIME,
    defaultValue: '08:00:00',
    allowNull: false,
    // Heure de début pour recevoir des notifications
  },

  heureFinNotifications: {
    type: DataTypes.TIME,
    defaultValue: '22:00:00',
    allowNull: false,
    // Heure de fin pour recevoir des notifications
  },

  // Fréquence des rappels
  frequenceRappels: {
    type: DataTypes.ENUM('JAMAIS', 'UNE_FOIS', 'QUOTIDIEN', 'DEUX_FOIS_PAR_JOUR'),
    defaultValue: 'UNE_FOIS',
    allowNull: false,
    // Fréquence des rappels d'évaluation
  },

}, {
  freezeTableName: true
});

module.exports = NotificationPreference;