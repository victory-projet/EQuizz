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
      model: 'classes',
      key: 'id'
    }
  },

}, {
  tableName: 'etudiants'
});

module.exports = Etudiant;