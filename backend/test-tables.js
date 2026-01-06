const sequelize = require('./src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables dans la base de données...');
    
    const [results] = await sequelize.query("SHOW TABLES");
    
    console.log('\n📋 Tables existantes:');
    results.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Vérifier spécifiquement les nouvelles tables
    const tableNames = results.map(row => Object.values(row)[0]);
    
    console.log('\n🔍 Vérification des nouvelles tables:');
    console.log(`  - AnneeAcademique: ${tableNames.includes('AnneeAcademique') ? '✅' : '❌'}`);
    console.log(`  - Semestre: ${tableNames.includes('Semestre') ? '✅' : '❌'}`);
    
    // Vérifier la structure de la table Cours
    if (tableNames.includes('Cours')) {
      console.log('\n📋 Structure de la table Cours:');
      const [coursStructure] = await sequelize.query("DESCRIBE Cours");
      coursStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkTables();