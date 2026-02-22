const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  enonce: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  typeQuestion: {
    type: DataTypes.ENUM('CHOIX_MULTIPLE', 'REPONSE_OUVERTE'),
    allowNull: false,
  },

  options: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('options');
      
      // Si c'est déjà un tableau, le retourner
      if (Array.isArray(rawValue)) {
        return rawValue;
      }
      
      // Si c'est une chaîne, essayer de la parser
      if (typeof rawValue === 'string') {
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Erreur parsing options:', e);
          return [];
        }
      }
      
      // Si c'est null ou undefined, retourner un tableau vide
      if (rawValue === null || rawValue === undefined) {
        return [];
      }
      
      // Sinon, retourner un tableau vide
      return [];
    }
  },

  ordre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },

}, {
  freezeTableName: true // Empêche la pluralisation automatique
});

module.exports = Question;