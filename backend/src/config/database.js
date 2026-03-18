const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

console.log(`🔍 Configuration DB (${env}):`, {
  host: config.host,
  port: config.port,
  user: config.username,
  database: config.database,
  dialect: config.dialect,
  hasPassword: !!config.password
});

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = sequelize;
