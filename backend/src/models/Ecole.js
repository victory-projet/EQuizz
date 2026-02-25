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
  },

  estActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'est_active',
    comment: 'Indique si l\'école est active dans le système'
  }

}, {
  tableName: 'ecoles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Ecole;