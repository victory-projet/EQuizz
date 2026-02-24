const db = require('./src/models');

async function checkSuperAdminData() {
  try {
    console.log('🔍 Vérification des données superadministrateur...\n');
    
    const [superAdminData] = await db.sequelize.query('SELECT COUNT(*) as count FROM superadministrateur');
    console.log(`📊 Table 'superadministrateur': ${superAdminData[0].count} enregistrements`);
    
    if (superAdminData[0].count > 0) {
      console.log('\n📋 Données:');
      const [records] = await db.sequelize.query('SELECT * FROM superadministrateur');
      console.log(records);
    }
    
    // Vérifier la colonne dans evaluation
    console.log('\n🔗 Vérification de la colonne dans evaluation...');
    const [evalColumns] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND COLUMN_NAME = 'superadministrateur_id'
    `);
    console.log(evalColumns[0]);
    
    // Vérifier les contraintes
    console.log('\n🔗 Contraintes de clés étrangères:');
    const [constraints] = await db.sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND COLUMN_NAME = 'superadministrateur_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log(constraints);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkSuperAdminData();
