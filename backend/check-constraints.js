const db = require('./src/models');

async function checkConstraints() {
  try {
    console.log('🔍 Vérification des contraintes sur la table evaluation...\n');
    
    const [constraints] = await db.sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'equizz_db'
        AND TABLE_NAME = 'evaluation'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('📋 Contraintes de clés étrangères:');
    constraints.forEach(c => {
      console.log(`  - ${c.CONSTRAINT_NAME}: ${c.COLUMN_NAME} -> ${c.REFERENCED_TABLE_NAME}.${c.REFERENCED_COLUMN_NAME}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkConstraints();
