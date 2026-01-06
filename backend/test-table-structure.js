const sequelize = require('./src/config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure des tables...');
    
    // Vérifier la structure de anneeacademique
    console.log('\n📋 Structure de la table anneeacademique:');
    try {
      const [anneeStructure] = await sequelize.query("DESCRIBE anneeacademique");
      anneeStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('❌ Table anneeacademique n\'existe pas');
    }
    
    // Vérifier la structure de semestre
    console.log('\n📋 Structure de la table semestre:');
    try {
      const [semestreStructure] = await sequelize.query("DESCRIBE semestre");
      semestreStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('❌ Table semestre n\'existe pas');
    }
    
    // Vérifier la structure de cours
    console.log('\n📋 Structure de la table cours:');
    try {
      const [coursStructure] = await sequelize.query("DESCRIBE cours");
      coursStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } catch (error) {
      console.log('❌ Table cours n\'existe pas');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkTableStructure();