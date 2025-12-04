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

  // Ajout du champ anneeAcademiqueId pour lier une classe à une année académique
  anneeAcademiqueId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'annee_academique_id'
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }

});

module.exports = Classe;