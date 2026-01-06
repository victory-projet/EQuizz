const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cours = sequelize.define('Cours', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Le code unique du cours, ex: "INF305"
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Bases de Données"
  },

  // Clé étrangère vers l'enseignant principal du cours
  enseignant_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'enseignant_id'
  },

  // Clé étrangère vers l'année académique
  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'annee_academique_id'
  },

  // Clé étrangère vers le semestre
  semestreId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'semestre_id'
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    // Permet d'archiver un cours sans le supprimer
  }

}, {
  freezeTableName: true // Empêche la pluralisation automatique
});

module.exports = Cours;