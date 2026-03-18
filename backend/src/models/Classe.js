const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Classe = sequelize.define('Classe', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
 
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ex: "ING4 ISI FR"
  },

  niveau: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "ING4"
  },

  // Ajout du champ anneeAcademiqueId pour lier une classe à une année académique
  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'annee_academique_id'
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_archive'
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

}, {
  tableName: 'classes',
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  
  // Scopes pour filtrer automatiquement les éléments archivés
  defaultScope: {
    where: { estArchive: false }
  },
  scopes: {
    archived: { 
      where: { estArchive: true } 
    },
    all: { 
      where: {} 
    }
  }
});

module.exports = Classe;