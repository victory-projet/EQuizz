// backend/src/models/SessionReponse.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionReponse = sequelize.define('SessionReponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

module.exports = SessionReponse;