const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrateur = sequelize.define('Administrateur', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'Utilisateurs',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Clé primaire et étrangère vers Utilisateur'
  },
  
  ecoleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'ecole_id',
    references: {
      model: 'Ecoles',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'École à laquelle l\'administrateur appartient'
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
  underscored: true,
  paranoid: false,
  comment: 'Table des administrateurs d\'école'
});

module.exports = Administrateur;
