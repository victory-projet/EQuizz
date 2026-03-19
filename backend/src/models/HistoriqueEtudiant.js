// backend/src/models/HistoriqueEtudiant.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriqueEtudiant = sequelize.define('HistoriqueEtudiant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  etudiant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'UUID permanent de l\'étudiant'
  },

  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Matricule utilisé pendant cette période'
  },

  ecole_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'École fréquentée pendant cette période'
  },

  classe_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Classe fréquentée pendant cette période'
  },

  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date de début dans cette école/classe'
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de fin (null si période actuelle)'
  },

  estPeriodeActuelle: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Indique si c\'est la période actuelle de l\'étudiant'
  }

}, {
  tableName: 'HistoriqueEtudiant',
  timestamps: true,
  paranoid: false
});

module.exports = HistoriqueEtudiant;
