const db = require('./src/models');

async function runMigration() {
  try {
    console.log('🔄 Exécution de la migration de renommage Administrateurs -> Superadministrateurs...');
    
    // Vérifier si la table Administrateurs existe
    const [tables] = await db.sequelize.query(
      "SHOW TABLES LIKE 'Administrateurs'"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  La table Administrateurs n\'existe pas. Vérification de Superadministrateurs...');
      const [superTables] = await db.sequelize.query(
        "SHOW TABLES LIKE 'Superadministrateurs'"
      );
      
      if (superTables.length > 0) {
        console.log('✅ La table Superadministrateurs existe déjà. Migration déjà effectuée.');
      } else {
        console.log('❌ Aucune des deux tables n\'existe.');
      }
      process.exit(0);
    }
    
    // Renommer la table
    await db.sequelize.query('RENAME TABLE Administrateurs TO Superadministrateurs');
    
    console.log('✅ Migration exécutée avec succès: Administrateurs -> Superadministrateurs');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
