const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Génère un UUID automatiquement
    primaryKey: true,
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
      isEmailCustom(value) {
        // Regex pour valider le format : prenom.nom@saintjeaningenieur.com
        const emailRegex = /^[a-z]+\.[a-z]+@saintjeaningenieur\.com$/;
        if (!emailRegex.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@saintjeaningenieur.com');
        }
      }
    }
  },

  motDePasseHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

module.exports = Utilisateur;