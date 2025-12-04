// backend/src/models/SessionToken.js
// Table de mapping pour garder l'anonymat dans SessionReponse

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const SessionToken = sequelize.define('SessionToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // Token anonyme qui sera stocké dans SessionReponse
  tokenAnonyme: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    defaultValue: () => {
      // Générer un token anonyme unique
      const hash = crypto.createHash('sha256');
      hash.update(`${Date.now()}-${Math.random()}-${Math.random()}`);
      return hash.digest('hex');
    }
  },

  // Référence à l'étudiant (dans cette table séparée uniquement)
  etudiant_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Référence à l'évaluation
  evaluation_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'sessiontoken',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['etudiant_id', 'evaluation_id']
    }
  ],
  hooks: {
    beforeValidate: (sessionToken) => {
      // Toujours régénérer le token avec les IDs pour plus de sécurité
      const hash = crypto.createHash('sha256');
      hash.update(`${sessionToken.etudiant_id}-${sessionToken.evaluation_id}-${Date.now()}-${Math.random()}`);
      sessionToken.tokenAnonyme = hash.digest('hex');
    }
  }
});

module.exports = SessionToken;
