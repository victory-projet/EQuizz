const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
    // ex: "Nouvelle évaluation disponible"
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    // ex: "L'évaluation pour le cours 'INF305' est maintenant ouverte."
  },

  typeNotification: {
    type: DataTypes.ENUM('NOUVELLE_EVALUATION', 'RAPPEL_EVALUATION', 'EVALUATION_BIENTOT_FERMEE'),
    allowNull: false,
  },
  
});

module.exports = Notification;