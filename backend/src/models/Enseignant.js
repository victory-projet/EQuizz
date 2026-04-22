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

  ecole_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'ecoles', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'École à laquelle l\'enseignant est rattaché'
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

}, {
  tableName: 'enseignant',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

module.exports = Enseignant;