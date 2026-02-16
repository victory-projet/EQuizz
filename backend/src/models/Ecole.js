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

  domaine: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "saintjeaningenieur.org", "cpge.org", "prepavogt.org", etc.
    comment: 'Domaine email de l\'école (ex: saintjeaningenieur.org)'
  },

});

module.exports = Ecole;