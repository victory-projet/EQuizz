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
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          console.warn('Erreur parsing JSON options:', e);
          return [];
        }
      }
      return rawValue || [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('options', value);
      } else if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          this.setDataValue('options', parsed);
        } catch (e) {
          console.warn('Erreur parsing JSON options:', e);
          this.setDataValue('options', []);
        }
      } else {
        this.setDataValue('options', []);
      }
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