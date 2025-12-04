const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyseReponse = sequelize.define('AnalyseReponse', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Le score numérique est la donnée brute fournie par l'API d'IA.
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: -1.0,
      max: 1.0,
    }
  },

  sentiment: {
    type: DataTypes.ENUM('POSITIF', 'NEUTRE', 'NEGATIF'),
    allowNull: false,
  },

}, {
  tableName: 'analysereponse'
});

module.exports = AnalyseReponse;