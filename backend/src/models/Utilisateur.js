const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Génère un UUID automatiquement
    primaryKey: true,
  },

  estActif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    // Permet de désactiver un compte sans le supprimer
  },
  
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmailCustom(value) {
        // Deux formats acceptés:
        // 1. prenom.nom@universitesaintjean.org (pour superadmins)
        // 2. prenom.nom@saintjeaningenieur.org (pour enseignants et étudiants)
        
        const superAdminRegex = /^[a-zA-Z]+\.[a-zA-Z]+@universitesaintjean\.org$/;
        const regularUserRegex = /^[a-zA-Z]+\.[a-zA-Z]+@saintjeaningenieur\.org$/;
        
        if (!superAdminRegex.test(value) && !regularUserRegex.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@universitesaintjean.org (superadmin) ou prenom.nom@saintjeaningenieur.org (autres utilisateurs)');
        }
      }
    }
  },

  motDePasseHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  dateImport: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_import',
    comment: 'Date du dernier import Excel'
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  // Ajout des Hooks
  hooks: {
    beforeSave: async (utilisateur) => {
      if (utilisateur.changed('motDePasseHash') && utilisateur.motDePasseHash) {
        const salt = await bcrypt.genSalt(10);
        utilisateur.motDePasseHash = await bcrypt.hash(utilisateur.motDePasseHash, salt);
      }
    }
  }
});

Utilisateur.prototype.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.motDePasseHash);
};

module.exports = Utilisateur;