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
  etudiantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // Référence à l'évaluation
  evaluationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
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
      hash.update(`${sessionToken.etudiantId}-${sessionToken.evaluationId}-${Date.now()}-${Math.random()}`);
      sessionToken.tokenAnonyme = hash.digest('hex');
    }
  }
});

module.exports = SessionToken;
