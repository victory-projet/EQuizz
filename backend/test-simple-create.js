const sequelize = require('./src/config/database');

async function testSimpleCreate() {
  try {
    console.log('🧪 Test de création simple...');
    
    // Test direct avec une requête SQL
    console.log('\n1. Test avec requête SQL directe...');
    const [result] = await sequelize.query(`
      INSERT INTO anneeacademique (id, nom, date_debut, date_fin, est_active, est_archive, created_at, updated_at)
      VALUES (UUID(), '2024-2025-test', '2024-09-01', '2025-06-30', 0, 0, NOW(), NOW())
    `);
    console.log('✅ Insertion SQL réussie');
    
    // Récupérer l'enregistrement
    const [records] = await sequelize.query(`
      SELECT * FROM anneeacademique WHERE nom = '2024-2025-test'
    `);
    console.log('✅ Enregistrement trouvé:', records[0]);
    
    // Nettoyer
    await sequelize.query(`DELETE FROM anneeacademique WHERE nom = '2024-2025-test'`);
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testSimpleCreate();