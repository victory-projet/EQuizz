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

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

}, {
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

module.exports = Cours;