const db = require('./src/models');

async function resetDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    console.log('⚠️  ATTENTION: Cette opération va supprimer TOUTES les données!\n');

    // Désactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Vérifications de clés étrangères désactivées\n');

    // Supprimer toutes les tables
    console.log('🗑️  Suppression de toutes les tables...');
    const tables = await db.sequelize.query('SHOW TABLES', { 
      type: db.sequelize.QueryTypes.SELECT 
    });
    
    for (const table of tables) {
      const tableName = table[`Tables_in_${db.sequelize.config.database}`];
      await db.sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`  ✅ ${tableName} supprimée`);
    }

    // Réactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Vérifications de clés étrangères réactivées\n');

    // Synchroniser tous les modèles pour recréer les tables
    console.log('🔄 Recréation de toutes les tables...');
    await db.sequelize.sync({ force: true });
    console.log('✅ Toutes les tables ont été recréées!\n');

    // Vérifier les tables créées
    const newTables = await db.sequelize.query('SHOW TABLES', { 
      type: db.sequelize.QueryTypes.SELECT 
    });
    
    console.log('Tables dans la base de données:');
    newTables.forEach(table => {
      const tableName = table[`Tables_in_${db.sequelize.config.database}`];
      console.log(`  - ${tableName}`);
    });

    console.log('\n💡 Utilisez "node manual-seed.js" pour peupler la base de données');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.parent) {
      console.error('Parent Error:', error.parent.message);
    }
    process.exit(1);
  }
}

resetDatabase();
