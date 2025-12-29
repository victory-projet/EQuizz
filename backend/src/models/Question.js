const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  enonce: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  typeQuestion: {
    type: DataTypes.ENUM('CHOIX_MULTIPLE', 'REPONSE_OUVERTE'),
    allowNull: false,
  },

  options: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },

  ordre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },

}, {
  freezeTableName: true // Empêche la pluralisation automatique
});

module.exports = Question;