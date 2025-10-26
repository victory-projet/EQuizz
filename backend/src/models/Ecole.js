const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ecole = sequelize.define('Ecole', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    // ex: "Saint Jean Ingenieur"
  },

});

module.exports = Ecole;