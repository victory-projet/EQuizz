const db = require('./src/models');

async function recreateUserTables() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    // Désactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Vérifications de clés étrangères désactivées\n');

    // Supprimer les tables utilisateur existantes
    console.log('🗑️  Suppression des tables utilisateur...');
    await db.sequelize.query('DROP TABLE IF EXISTS administrateur');
    await db.sequelize.query('DROP TABLE IF EXISTS superadministrateur');
    await db.sequelize.query('DROP TABLE IF EXISTS enseignant');
    await db.sequelize.query('DROP TABLE IF EXISTS etudiant');
    await db.sequelize.query('DROP TABLE IF EXISTS utilisateur');
    console.log('✅ Tables utilisateur supprimées\n');

    // Réactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Vérifications de clés étrangères réactivées\n');

    // Synchroniser les modèles pour recréer les tables
    console.log('🔄 Synchronisation des modèles...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Tables recréées avec succès!\n');

    // Vérifier les tables créées
    const tables = await db.sequelize.query('SHOW TABLES', { 
      type: db.sequelize.QueryTypes.SELECT 
    });
    
    console.log('Tables dans la base de données:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${db.sequelize.config.database}`];
      console.log(`  - ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.parent) {
      console.error('Parent Error:', error.parent.message);
    }
    process.exit(1);
  }
}

recreateUserTables();
