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
    beforeCreate: (sessionToken) => {
      if (!sessionToken.tokenAnonyme) {
        // Générer un token anonyme unique basé sur l'étudiant et l'évaluation
        const hash = crypto.createHash('sha256');
        hash.update(`${sessionToken.etudiantId}-${sessionToken.evaluationId}-${Date.now()}`);
        sessionToken.tokenAnonyme = hash.digest('hex');
      }
    }
  }
});

module.exports = SessionToken;
