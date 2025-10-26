const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quizz = sequelize.define('Quizz', {
  
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    // ex: "Veuillez répondre honnêtement. Vos réponses sont anonymes."
  },
});

module.exports = Quizz;