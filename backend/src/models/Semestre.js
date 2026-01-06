const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Semestre = sequelize.define('Semestre', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Nom du semestre, ex: "Semestre 1", "Semestre 2"
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Semestre 1", "Semestre 2"
  },

  // Numéro du semestre (1, 2, etc.)
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4 // Maximum 4 semestres par année
    }
  },

  // Date de début du semestre
  dateDebut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_debut'
  },

  // Date de fin du semestre
  dateFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_fin'
  },

  // Clé étrangère vers l'année académique
  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'annee_academique_id'
  },

  // Indique si c'est le semestre actif
  estActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_actif'
  },

  // Permet d'archiver un semestre
  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_archive'
  }

}, {
  freezeTableName: true,
  tableName: 'semestre'
});

module.exports = Semestre;