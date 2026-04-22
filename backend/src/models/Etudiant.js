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

  classe_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'classe',
      key: 'id'
    }
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }

}, {
  tableName: 'etudiant',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  paranoid: true,
  deletedAt: 'deleted_at'
});

module.exports = Etudiant;