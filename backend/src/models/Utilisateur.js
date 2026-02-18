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
      // Valider le format de l'email
      isEmail: {
        msg: 'L\'adresse email doit être valide'
      },
      isEmailCustom(value) {
        // Format spécial pour SuperAdmin : accepte @universitesaintjean.org
        const superAdminFormat = /^[a-zA-Z]+@universitesaintjean\.org$/;
        if (superAdminFormat.test(value)) {
          return; // SuperAdmin accepté avec ce domaine
        }
        
        // Format standard pour les autres utilisateurs : prenom.nom@domaine
        // Accepte UNIQUEMENT les lettres non accentuées (a-z, A-Z) pour le nom/prénom
        const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!standardFormat.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@domaine.org (lettres non accentuées uniquement, sans chiffres) ou utilisateur@universitesaintjean.org pour SuperAdmin');
        }
      }
    }
  },

  motDePasseHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
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