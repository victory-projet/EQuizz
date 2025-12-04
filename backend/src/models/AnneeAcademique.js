const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnneeAcademique = sequelize.define('AnneeAcademique', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  libelle: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ex: "2024-2025", ne peut pas exister deux fois
    validate: {
      // S'assure que le format est bien AAAA-AAAA
      is: /^\d{4}-\d{4}$/
    }
  },

  dateDebut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  dateFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  estCourante: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }

});

module.exports = AnneeAcademique;