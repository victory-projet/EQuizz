const fs = require('fs');
const path = require('path');
const db = require('./src/models');

async function runMigration() {
  try {
    console.log('🔄 Exécution de la migration...');
    
    const sqlPath = path.join(__dirname, 'migrations', 'create-password-reset-tokens-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Séparer les commandes SQL
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      await db.sequelize.query(statement);
    }
    
    console.log('✅ Migration exécutée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

runMigration();
