const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enseignant = sequelize.define('Enseignant', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  
  specialite: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

});

module.exports = Enseignant;