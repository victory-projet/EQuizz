const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoursEnseignant = sequelize.define('CoursEnseignant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  cours_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cours',
      key: 'id'
    }
  },
  
  enseignant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Enseignant',
      key: 'id'
    }
  },
  
  // Rôle de l'enseignant pour ce cours
  role: {
    type: DataTypes.ENUM('TITULAIRE', 'ASSISTANT', 'INTERVENANT'),
    defaultValue: 'TITULAIRE',
    allowNull: false
  },
  
  // Indique si c'est l'enseignant principal
  estPrincipal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'est_principal'
  },
  
  // Date d'assignation
  dateAssignation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'date_assignation'
  },

  // Champs d'archivage
  estArchive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },

  dateArchivage: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  archivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Utilisateur',
      key: 'id'
    }
  }
}, {
  freezeTableName: true,
  defaultScope: {
    where: {
      estArchive: false
    }
  },
  scopes: {
    withArchived: {
      where: {}
    },
    onlyArchived: {
      where: {
        estArchive: true
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['cours_id', 'enseignant_id']
    },
    {
      fields: ['cours_id']
    },
    {
      fields: ['enseignant_id']
    }
  ]
});

module.exports = CoursEnseignant;