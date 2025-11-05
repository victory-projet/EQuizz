// backend/src/models/SessionReponse.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionReponse = sequelize.define('SessionReponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Token anonyme - ne révèle pas l'identité de l'étudiant
  tokenAnonyme: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
  },

  statut: {
    type: DataTypes.ENUM('EN_COURS', 'TERMINE'),
    allowNull: false,
    defaultValue: 'EN_COURS',
  },

  dateDebut: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  underscored: true
});

module.exports = SessionReponse;