// Script to drop all tables and recreate the database schema
const db = require('./src/models');

async function resetDatabase() {
  try {
    console.log('🔄 Dropping all tables...');
    
    // Disable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables
    const [tables] = await db.sequelize.query('SHOW TABLES');
    
    // Drop each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      if (tableName !== 'sequelizemeta') { // Keep migration history
        console.log(`  Dropping table: ${tableName}`);
        await db.sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      }
    }
    
    // Re-enable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ All tables dropped successfully');
    console.log('🔄 Recreating tables with correct schema...');
    
    // Sync database with force to recreate all tables
    await db.sequelize.sync({ force: true });
    
    console.log('✅ Database schema recreated successfully');
    console.log('💡 Restart the server to auto-seed the database');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
