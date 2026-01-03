// Script pour nettoyer complètement les migrations et tables de push notifications
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

async function resetPushMigrations() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    // Supprimer les index problématiques s'ils existent
    console.log('🗑️  Suppression des index problématiques...');
    
    const indexesToDrop = [
      'device_token_user_index',
      'device_token_platform_index', 
      'device_token_active_index',
      'device_token_last_used_index',
      'notification_preference_user_unique'
    ];

    for (const indexName of indexesToDrop) {
      try {
        await sequelize.query(`DROP INDEX ${indexName} ON DeviceToken`);
        console.log(`✅ Index ${indexName} supprimé`);
      } catch (error) {
        // Index n'existe pas, on continue
        console.log(`ℹ️  Index ${indexName} n'existe pas`);
      }
    }

    try {
      await sequelize.query(`DROP INDEX notification_preference_user_unique ON NotificationPreference`);
      console.log(`✅ Index notification_preference_user_unique supprimé`);
    } catch (error) {
      console.log(`ℹ️  Index notification_preference_user_unique n'existe pas`);
    }

    // Supprimer les tables si elles existent
    console.log('🗑️  Suppression des tables...');
    await sequelize.query('DROP TABLE IF EXISTS `NotificationPreference`');
    await sequelize.query('DROP TABLE IF EXISTS `DeviceToken`');
    
    // Supprimer les entrées de migration problématiques
    console.log('🗑️  Nettoyage des migrations...');
    await sequelize.query(`DELETE FROM SequelizeMeta WHERE name = '20250102000001-add-push-notifications-tables.js'`);
    await sequelize.query(`DELETE FROM SequelizeMeta WHERE name = '20250102000002-add-push-notifications-minimal.js'`);
    
    console.log('✅ Nettoyage terminé avec succès');
    console.log('ℹ️  Redémarrez maintenant le serveur pour appliquer les nouvelles migrations');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetPushMigrations();