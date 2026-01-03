// Script pour recréer complètement la base de données de production
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

async function recreateProductionDB() {
  try {
    console.log('🔄 Connexion à la base de données de production...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    console.log('🗑️  ATTENTION: Suppression COMPLÈTE de toutes les tables...');
    console.log('⚠️  Cette opération va supprimer TOUTES les données !');
    
    // Obtenir la liste de toutes les tables
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'defaultdb'}'
      AND TABLE_TYPE = 'BASE TABLE'
    `);
    
    console.log(`📋 Tables trouvées: ${tables.map(t => t.TABLE_NAME).join(', ')}`);
    
    // Désactiver les contraintes de clés étrangères
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Supprimer toutes les tables
    for (const table of tables) {
      console.log(`🗑️  Suppression de la table: ${table.TABLE_NAME}`);
      await sequelize.query(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
    }
    
    // Réactiver les contraintes de clés étrangères
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Toutes les tables ont été supprimées');
    console.log('🔄 La base de données est maintenant vide et prête pour une nouvelle initialisation');
    console.log('🚀 Redémarrez le service Render pour recréer automatiquement toutes les tables');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Demander confirmation avant de procéder
console.log('⚠️  ATTENTION: Ce script va supprimer TOUTES les données de la base de production !');
console.log('📝 Assurez-vous d\'avoir une sauvegarde si nécessaire.');
console.log('🔄 Exécution dans 5 secondes... (Ctrl+C pour annuler)');

setTimeout(() => {
  recreateProductionDB();
}, 5000);