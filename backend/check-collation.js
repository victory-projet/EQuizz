const db = require('./src/models');

async function checkCollation() {
  try {
    console.log('🔍 Vérification des collations...\n');
    
    // Vérifier superadministrateur.id
    const [superAdminCols] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'superadministrateur'
        AND COLUMN_NAME = 'id'
    `);
    
    console.log('📋 superadministrateur.id:');
    console.log(superAdminCols[0]);
    
    // Vérifier evaluation.superadministrateur_id
    const [evalCols] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND COLUMN_NAME = 'superadministrateur_id'
    `);
    
    console.log('\n📋 evaluation.superadministrateur_id:');
    console.log(evalCols[0]);
    
    // Vérifier administrateur.id pour comparaison
    const [adminCols] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'administrateur'
        AND COLUMN_NAME = 'id'
    `);
    
    console.log('\n📋 administrateur.id (pour comparaison):');
    console.log(adminCols[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkCollation();
