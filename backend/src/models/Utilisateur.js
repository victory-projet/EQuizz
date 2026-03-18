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
        // Validation format prenom.nom@... (lettres uniquement, sans chiffres, sans accents)
        const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!standardFormat.test(value)) {
          throw new Error('Le format de l\'email doit être prenom.nom@domaine.org (lettres non accentuées uniquement)');
        }

        const domain = value.split('@')[1];
        const isSJDomain = domain === 'universitesaintjean.org';

        // Note: La validation du rôle par domaine est faite dans un hook beforeValidate 
        // car 'this.role' n'est pas fiable ici selon les versions de Sequelize
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
      if (utilisateur.email) {
        const domain = utilisateur.email.split('@')[1];
        const isSJDomain = domain === 'universitesaintjean.org';

        // Si c'est un Super-Admin, il DOIT avoir le domaine saintjean
        if (utilisateur.role === 'SUPER-ADMIN' && !isSJDomain) {
          throw new Error('Les Super-Administrateurs doivent utiliser un email @universitesaintjean.org');
        }
        
        // Si ce n'est PAS un Super-Admin (donc Admin, Enseignant, Etudiant ou indéfini), il ne doit PAS avoir le domaine saintjean
        // On permet isSJDomain UNIQUEMENT si le rôle est explicitement SUPER-ADMIN
        if (isSJDomain && utilisateur.role !== 'SUPER-ADMIN') {
          throw new Error('Le domaine @universitesaintjean.org est réservé aux Super-Administrateurs');
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