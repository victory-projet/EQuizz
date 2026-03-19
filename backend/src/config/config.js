require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { getSecret } = require('../utils/secrets');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = getSecret('DB_USER', process.env.DB_USER || 'root');
const dbName = process.env.DB_NAME || 'equizz_db';
const dbPassword = getSecret('DB_PASSWORD', process.env.DB_PASSWORD || '');
const dbDialect = process.env.DB_DIALECT || 'mysql';

const commonConfig = {
  username: dbUser,
  password: dbPassword,
  database: dbName,
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
    paranoid: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 120000
  }
};

module.exports = {
  development: {
    ...commonConfig
  },
  test: {
    ...commonConfig,
    database: process.env.DB_NAME || 'equizz_db_test',
    logging: false
  },
  production: {
    ...commonConfig,
    dialectOptions: {
      ...commonConfig.dialectOptions,
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
};
