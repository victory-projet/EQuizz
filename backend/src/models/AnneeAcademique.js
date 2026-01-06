const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnneeAcademique = sequelize.define('AnneeAcademique', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // Nom de l'année académique, ex: "2024-2025"
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // ex: "2024-2025"
  },

  // Date de début de l'année académique
  dateDebut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_debut'
  },

  // Date de fin de l'année académique
  dateFin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_fin'
  },

  // Indique si c'est l'année académique active
  estActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_active'
  },

  // Permet d'archiver une année académique
  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_archive'
  }

}, {
  freezeTableName: true,
  tableName: 'anneeacademique'
});

module.exports = AnneeAcademique;