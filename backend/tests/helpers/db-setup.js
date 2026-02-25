// backend/tests/helpers/db-setup.js
// Helper pour setup de la base de données de test

const db = require('../../src/models');

async function setupTestDatabase() {
  try {
    // Synchroniser la base de données (force: true pour recréer les tables)
    await db.sequelize.sync({ force: true });
  } catch (error) {
    console.error('❌ Erreur sync base de données:', error);
    throw error;
  }
}

async function cleanupTestDatabase() {
  try {
    // Fermer la connexion
    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Erreur fermeture base de données:', error);
  }
}

async function clearAllTables() {
  const isSqlite = db.sequelize.getDialect() === 'sqlite';
  const models = Object.values(db.sequelize.models);

  try {
    if (isSqlite) {
      await db.sequelize.query('PRAGMA foreign_keys = OFF');
    }

    // Deleting in reverse order might help with constraints if foreign_keys wasn't OFF
    // But since it's OFF, we can just delete all.
    for (const model of models) {
      await model.destroy({ where: {}, force: true, truncate: !isSqlite && model.name !== 'Utilisateur' });
    }

    if (isSqlite) {
      await db.sequelize.query('PRAGMA foreign_keys = ON');
    }
  } catch (error) {
    if (isSqlite) {
      await db.sequelize.query('PRAGMA foreign_keys = ON');
    }
    throw error;
  }
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  clearAllTables
};
