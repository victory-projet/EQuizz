const db = require('./src/models');

async function checkAdminData() {
  try {
    console.log('🔍 Vérification des données dans les tables admin...\n');
    
    // Vérifier la table administrateur
    const [adminData] = await db.sequelize.query('SELECT COUNT(*) as count FROM administrateur');
    console.log(`📊 Table 'administrateur': ${adminData[0].count} enregistrements`);
    
    // Vérifier la table superadministrateur
    const [superAdminData] = await db.sequelize.query('SELECT COUNT(*) as count FROM superadministrateur');
    console.log(`📊 Table 'superadministrateur': ${superAdminData[0].count} enregistrements`);
    
    if (adminData[0].count > 0) {
      console.log('\n⚠️  La table administrateur contient des données.');
      console.log('📋 Aperçu des données:');
      const [records] = await db.sequelize.query('SELECT * FROM administrateur LIMIT 5');
      console.log(records);
    }
    
    if (superAdminData[0].count > 0) {
      console.log('\n✅ La table superadministrateur contient des données.');
      console.log('📋 Aperçu des données:');
      const [records] = await db.sequelize.query('SELECT * FROM superadministrateur LIMIT 5');
      console.log(records);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkAdminData();
