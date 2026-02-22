const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ecole = sequelize.define('Ecole', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    // ex: "Saint Jean Ingenieur"
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

});

module.exports = Ecole;