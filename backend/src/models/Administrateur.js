const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrateur = sequelize.define('Administrateur', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'utilisateurs',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Clé primaire et étrangère vers Utilisateur'
  },
  
  ecole_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ecoles',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'École à laquelle l\'administrateur appartient'
  },

  profil: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    }
  },

  dateNomination: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'date_nomination',
    comment: 'Date de nomination en tant qu\'administrateur'
  }
}, {
  tableName: 'administrateurs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false,
  comment: 'Table des administrateurs d\'école'
});

module.exports = Administrateur;
