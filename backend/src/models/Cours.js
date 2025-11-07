const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cours = sequelize.define('Cours', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Le code unique du cours, ex: "INF305"
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Bases de Données"
  },

});

module.exports = Cours;