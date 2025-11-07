const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enseignant = sequelize.define('Enseignant', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  
  specialite: {
    type: DataTypes.STRING,
    allowNull: true,
  },

});

module.exports = Enseignant;