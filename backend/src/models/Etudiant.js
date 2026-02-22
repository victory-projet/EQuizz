const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etudiant = sequelize.define('Etudiant', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  
  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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

});

module.exports = Etudiant;