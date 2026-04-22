const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etudiant = sequelize.define('Etudiant', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },

  matriculeUniv: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Identifiant unique permanent au niveau de l\'université'
  },
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Matricule spécifique à l\'école (saisie manuelle)'
  },
  idCarte: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

}, {
  tableName: 'etudiant',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

module.exports = Etudiant;