// backend/src/models/Superadministrateur.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Superadministrateur = sequelize.define('Superadministrateur', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  
  profil: {
    type: DataTypes.STRING,
    allowNull: true, 
    validate: {
      isUrl: true, 
    }
  },

});

module.exports = Superadministrateur;