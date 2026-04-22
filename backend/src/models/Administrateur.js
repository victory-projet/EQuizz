const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrateur = sequelize.define('Administrateur', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'utilisateur',
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
      model: 'ecole',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'École à laquelle l\'administrateur appartient'
  },

  date_nomination: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    comment: 'Date de nomination en tant qu\'administrateur'
  }
}, {
  tableName: 'administrateur',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  paranoid: false,
  comment: 'Table des administrateurs d\'école'
});

module.exports = Administrateur;
