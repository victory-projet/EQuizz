// backend/tests/helpers/db-setup.js
// Helper pour setup de la base de données de test

const db = require('../../src/models');

async function setupTestDatabase() {
  try {
    // Synchroniser la base de données (force: true pour recréer les tables)
    await db.sequelize.sync({ force: true });
    console.log('✅ Base de données de test synchronisée');
  } catch (error) {
    console.error('❌ Erreur sync base de données:', error);
    throw error;
  }
}

async function cleanupTestDatabase() {
  try {
    // Fermer la connexion
    await db.sequelize.close();
    console.log('✅ Connexion base de données fermée');
  } catch (error) {
    console.error('❌ Erreur fermeture base de données:', error);
  }
}

async function clearAllTables() {
  try {
    // Supprimer toutes les données de toutes les tables
    await db.sequelize.truncate({ cascade: true, restartIdentity: true });
  } catch (error) {
    // Si truncate ne fonctionne pas, essayer de supprimer manuellement
    const models = Object.keys(db.sequelize.models);
    for (const modelName of models) {
      try {
        await db[modelName].destroy({ where: {}, force: true });
      } catch (err) {
        // Ignorer les erreurs de contraintes
      }
    }
  }
}

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  clearAllTables
};
