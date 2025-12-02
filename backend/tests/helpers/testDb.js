// Helper pour gérer la base de données de test
const { Sequelize } = require('sequelize');

let sequelize;

/**
 * Initialise une base de données SQLite en mémoire pour les tests
 */
const setupTestDb = async () => {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
    define: {
      timestamps: true,
    },
  });

  // Importer tous les modèles
  const db = require('../../src/models');
  
  // Synchroniser la base de données
  await sequelize.sync({ force: true });
  
  return sequelize;
};

/**
 * Nettoie la base de données après chaque test
 */
const cleanupTestDb = async () => {
  if (sequelize) {
    await sequelize.drop();
    await sequelize.close();
  }
};

/**
 * Réinitialise toutes les tables
 */
const resetTestDb = async () => {
  if (sequelize) {
    await sequelize.sync({ force: true });
  }
};

module.exports = {
  setupTestDb,
  cleanupTestDb,
  resetTestDb,
};
