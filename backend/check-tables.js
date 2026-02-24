const db = require('./src/models');

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables dans la base de données...\n');
    
    const [tables] = await db.sequelize.query('SHOW TABLES');
    
    console.log('📋 Tables existantes:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });
    
    console.log(`\n✅ Total: ${tables.length} tables trouvées`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkTables();
