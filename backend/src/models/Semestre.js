// backend/src/models/Semestre.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Semestre = sequelize.define('Semestre', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Semestre 1"
  },

  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2]], // Typiquement, un semestre est soit 1, soit 2
    }
  },

  dateDebut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  dateFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

}, {
  freezeTableName: true // Empêche la pluralisation automatique
});

module.exports = Semestre;