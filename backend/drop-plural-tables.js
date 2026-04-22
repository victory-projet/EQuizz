const db = require('./src/models');

async function dropPluralTables() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connecté à la base de données\n');

    // Vérifier quelles tables existent
    const tables = await db.sequelize.query('SHOW TABLES', { 
      type: db.sequelize.QueryTypes.SELECT 
    });
    
    console.log('Tables existantes:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${db.sequelize.config.database}`];
      console.log(`  - ${tableName}`);
    });
    console.log('');

    // Désactiver les vérifications de clés étrangères temporairement
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Vérifications de clés étrangères désactivées\n');

    // Supprimer les tables au pluriel
    const tablesToDrop = ['utilisateurs', 'administrateurs', 'superadministrateurs'];
    
    for (const table of tablesToDrop) {
      try {
        await db.sequelize.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Table "${table}" supprimée`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de "${table}":`, error.message);
      }
    }

    // Réactiver les vérifications de clés étrangères
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Vérifications de clés étrangères réactivées');

    // Vérifier les tables restantes
    const remainingTables = await db.sequelize.query('SHOW TABLES', { 
      type: db.sequelize.QueryTypes.SELECT 
    });
    
    console.log('\nTables restantes:');
    remainingTables.forEach(table => {
      const tableName = table[`Tables_in_${db.sequelize.config.database}`];
      console.log(`  - ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

dropPluralTables();
