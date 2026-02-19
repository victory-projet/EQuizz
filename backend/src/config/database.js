// Charger dotenv uniquement en développement
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Sequelize } = require('sequelize');

// Log de debug pour vérifier les variables (masquer le mot de passe)
console.log('🔍 Configuration DB:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
  hasPassword: !!process.env.DB_PASSWORD
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT,
    storage: process.env.DB_DIALECT === 'sqlite' ? process.env.DB_STORAGE : null,
    logging: false,

    // Options de connexion pour éviter les timeouts
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,  // Augmenté à 60s
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 120000,  // Augmenté à 120s
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false  // Nécessaire pour les certificats Aiven
      } : false
    },

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
