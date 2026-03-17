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
        const superAdminFormat = /^[a-zA-Z]+\.[a-zA-Z]+@universitesaintjean\.org$/;
        if (superAdminFormat.test(value)) {
          return;
        }

        const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!standardFormat.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@domaine.org (lettres non accentuées uniquement, sans chiffres) ou prenom.nom@universitesaintjean.org pour SuperAdmin');
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