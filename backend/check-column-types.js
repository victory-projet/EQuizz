const db = require('./src/models');

async function checkColumnTypes() {
  try {
    console.log('🔍 Vérification des types de colonnes...\n');
    
    // Vérifier le type de la colonne id dans superadministrateur
    const [superAdminCols] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'superadministrateur'
        AND COLUMN_NAME = 'id'
    `);
    
    console.log('📋 superadministrateur.id:');
    console.log(superAdminCols[0]);
    
    // Vérifier le type de la colonne superadministrateur_id dans evaluation
    const [evalCols] = await db.sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND COLUMN_NAME = 'superadministrateur_id'
    `);
    
    console.log('\n📋 evaluation.superadministrateur_id:');
    console.log(evalCols[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkColumnTypes();
