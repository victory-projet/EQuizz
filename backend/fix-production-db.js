// Script pour corriger la base de données de production
const { Sequelize } = require('sequelize');

// Configuration de la base de données (utilise les variables d'environnement)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'avnadmin', 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'equizz-mysql-gillsimo08-1c72.e.aivencloud.com',
    port: process.env.DB_PORT || 20530,
    dialect: 'mysql',
    logging: console.log,
  }
);

async function fixProductionDB() {
  try {
    console.log('🔄 Connexion à la base de données de production...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    console.log('🗑️  Suppression des tables push notifications existantes...');
    
    // Supprimer les tables dans l'ordre (foreign keys)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS `NotificationPreference`');
    await sequelize.query('DROP TABLE IF EXISTS `DeviceToken`');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Tables supprimées');

    // Nettoyer les entrées de migration
    console.log('🧹 Nettoyage des migrations...');
    await sequelize.query('DELETE FROM SequelizeMeta WHERE name LIKE \'%push-notifications%\'');
    
    console.log('✅ Base de données nettoyée avec succès');
    console.log('🔄 Redémarrez maintenant le service Render pour appliquer les nouvelles migrations');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixProductionDB();