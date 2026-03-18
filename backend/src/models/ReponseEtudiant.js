// backend/src/models/ReponseEtudiant.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReponseEtudiant = sequelize.define('ReponseEtudiant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

}, {
  tableName: 'reponse_etudiants',
  freezeTableName: true,
  underscored: true,
  timestamps: true
});

module.exports = ReponseEtudiant;