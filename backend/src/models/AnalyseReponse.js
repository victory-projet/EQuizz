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

  explication: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explication du sentiment'
  },

  motsCles: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'mots_cles'
  },

  categorie: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Catégorie de la réponse (Pédagogie, Infrastructure, etc.)'
  },

  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 1.0
  }

}, {
  tableName: 'analyse_reponses',
  freezeTableName: true,
  underscored: true,
  timestamps: true
});

module.exports = AnalyseReponse;