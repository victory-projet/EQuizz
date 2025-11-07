require('dotenv').config();
console.log('Chargement du .env :', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_DIALECT: process.env.DB_DIALECT,
});
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,

    // --- Options globales pour tous les modèles ---
    define: {
      // Pour avoir created_at et updated_at au lieu de createdAt et updatedAt
      underscored: true,
      
      // Empêche Sequelize de renommer la table au pluriel
      freezeTableName: true,

      // Active la suppression logique (soft delete)
      paranoid: true, 
    }
  }
);

module.exports = sequelize;
