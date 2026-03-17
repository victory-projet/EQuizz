const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Évaluation de mi-parcours de l'UE INF305"
  },

  description: {
    type: DataTypes.TEXT, 
    allowNull: true,
  },

  dateDebut: {
    type: DataTypes.DATE, 
    allowNull: false,
  },

  dateFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  datePublication: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  typeEvaluation: {
    type: DataTypes.ENUM('MI_PARCOURS', 'FIN_SEMESTRE'),
    allowNull: false,
    defaultValue: 'MI_PARCOURS',
  },
  
  statut: {
    type: DataTypes.ENUM('BROUILLON', 'PUBLIEE', 'EN_COURS', 'CLOTUREE'),
    allowNull: false,
    defaultValue: 'BROUILLON',
  },

  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_archive'
  },

  superadministrateur_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Superadministrateur',
      key: 'id'
    }
  },

  administrateur_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Administrateur',
      key: 'id'
    }
  },

  cours_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cours',
      key: 'id'
    }
  }

}, {
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  
  // Scopes pour filtrer automatiquement les éléments archivés
  defaultScope: {
    where: { estArchive: false }
  },
  scopes: {
    archived: { 
      where: { estArchive: true } 
    },
    all: { 
      where: {} 
    }
  }
});

module.exports = Evaluation;