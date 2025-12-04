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
        // Regex stricte pour valider le format : prenom.nom@saintjeaningenieur.org
        // Accepte UNIQUEMENT les lettres non accentuées (a-z, A-Z), pas de chiffres ni d'accents
        const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@saintjeaningenieur\.org$/;
        if (!emailRegex.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@saintjeaningenieur.org (lettres non accentuées uniquement, sans chiffres)');
        }
        // Vérifier que le domaine est exactement @saintjeaningenieur.org
        if (!value.endsWith('@saintjeaningenieur.org')) {
          throw new Error('L\'email doit se terminer par @saintjeaningenieur.org');
        }
      }
    }
  },

  motDePasseHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'utilisateur',
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