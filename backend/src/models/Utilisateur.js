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
        // Validation basique : format email standard
        const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicEmail.test(value)) {
          throw new Error('Format d\'email invalide');
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
  },

  role: {
    type: DataTypes.ENUM('SUPER-ADMIN', 'ADMIN', 'ENSEIGNANT', 'ETUDIANT'),
    allowNull: true, // Peut être null pendant la phase initiale ou pour certains tests
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
    beforeValidate: (utilisateur) => {
      if (utilisateur.email && utilisateur.role === 'SUPER-ADMIN') {
        const domain = utilisateur.email.split('@')[1];
        if (domain !== 'universitesaintjean.org') {
          throw new Error('Les Super-Administrateurs doivent utiliser un email @universitesaintjean.org');
        }
      }
    },
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