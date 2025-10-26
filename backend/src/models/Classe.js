const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Classe = sequelize.define('Classe', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
 
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ex: "ING4 ISI FR"
  },

  niveau: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "ING4"
  },

});

module.exports = Classe;