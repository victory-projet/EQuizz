// backend/src/models/Administrateur.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrateur = sequelize.define('Administrateur', {
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

module.exports = Administrateur;