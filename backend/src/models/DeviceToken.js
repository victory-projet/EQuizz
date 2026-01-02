// backend/src/models/DeviceToken.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceToken = sequelize.define('DeviceToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  token: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    // Token FCM pour les push notifications
  },

  platform: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false,
    // Plateforme de l'appareil
  },

  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
    // Identifiant unique de l'appareil (optionnel)
  },

  appVersion: {
    type: DataTypes.STRING,
    allowNull: true,
    // Version de l'application
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Token actif ou non
  },

  lastUsed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    // Dernière utilisation du token
  },

}, {
  freezeTableName: true
});

module.exports = DeviceToken;