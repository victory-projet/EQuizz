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

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    // Permet d'archiver un cours sans le supprimer
  },

  // Ajout du champ anneeAcademiqueId pour lier un cours à une année académique
  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'annee_academique_id'
  }

}, {
  tableName: 'cours'
});

module.exports = Cours;