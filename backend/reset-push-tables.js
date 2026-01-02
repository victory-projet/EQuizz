// Script pour nettoyer les tables de push notifications si elles existent déjà
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
  }
);

async function resetPushTables() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    // Supprimer les tables si elles existent
    console.log('🗑️  Suppression des tables push notifications si elles existent...');
    
    await sequelize.query('DROP TABLE IF EXISTS `NotificationPreference`');
    await sequelize.query('DROP TABLE IF EXISTS `DeviceToken`');
    
    console.log('✅ Tables supprimées avec succès');
    console.log('ℹ️  Vous pouvez maintenant redéployer pour créer les nouvelles tables');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetPushTables();