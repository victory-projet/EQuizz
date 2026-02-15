// backend/src/models/HistoriqueEtudiant.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriqueEtudiant = sequelize.define('HistoriqueEtudiant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  etudiant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Etudiant',
      key: 'id'
    },
    comment: 'UUID permanent de l\'étudiant'
  },

  matricule: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Matricule utilisé pendant cette période'
  },

  ecole_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Ecole',
      key: 'id'
    },
    comment: 'École fréquentée pendant cette période'
  },

  classe_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Classe',
      key: 'id'
    },
    comment: 'Classe fréquentée pendant cette période'
  },

  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date de début dans cette école/classe'
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de fin (null si période actuelle)'
  },

  estPeriodeActuelle: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Indique si c\'est la période actuelle de l\'étudiant'
  }

}, {
  tableName: 'HistoriqueEtudiant',
  timestamps: true,
  paranoid: false,
  indexes: [
    {
      fields: ['etudiant_id']
    },
    {
      fields: ['matricule']
    },
    {
      fields: ['estPeriodeActuelle']
    }
  ]
});

module.exports = HistoriqueEtudiant;
