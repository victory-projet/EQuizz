// Script pour initialiser la base de données en production
require('dotenv').config();
const db = require('./src/models');

async function setupDatabase() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Connexion établie avec succès.');

    console.log('🔄 Synchronisation des tables...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées avec succès.');

    // Afficher les tables créées
    const tables = await db.sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tables créées:', tables);

    console.log('\n✅ Configuration de la base de données terminée!');
    console.log('Vous pouvez maintenant appeler POST /api/init/seed pour peupler la base.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

setupDatabase();
