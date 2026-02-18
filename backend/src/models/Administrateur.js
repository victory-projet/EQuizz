// backend/src/models/Administrateur.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrateur = sequelize.define('Administrateur', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  
  type: {
    type: DataTypes.ENUM('SUPERADMIN', 'ADMIN'),
    defaultValue: 'ADMIN',
    allowNull: false,
    comment: 'SUPERADMIN: accès à tout le système. ADMIN: accès limité à son école'
  },

  ecole_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'NULL pour SuperAdmin, UUID pour Admin scolaire'
  },
  
  profil: {
    type: DataTypes.STRING,
    allowNull: true, 
    validate: {
      isUrl: true, 
    }
  },

});

module.exports = Administrateur;