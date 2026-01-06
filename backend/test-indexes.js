const sequelize = require('./src/config/database');

async function checkIndexes() {
  try {
    console.log('🔍 Vérification des index...');
    
    // Vérifier les index de la table anneeacademique
    console.log('\n📋 Index de la table anneeacademique:');
    const [indexes] = await sequelize.query(`SHOW INDEX FROM anneeacademique`);
    
    indexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? 'non-unique' : 'unique'})`);
    });
    
    // Essayer une insertion simple sans UUID
    console.log('\n🧪 Test d\'insertion simple...');
    try {
      await sequelize.query(`
        INSERT INTO anneeacademique (id, nom, date_debut, date_fin, est_active, est_archive, created_at, updated_at)
        VALUES ('test-uuid-123', 'Test-2024', '2024-09-01', '2025-06-30', 0, 0, NOW(), NOW())
      `);
      console.log('✅ Insertion réussie');
      
      // Nettoyer
      await sequelize.query(`DELETE FROM anneeacademique WHERE id = 'test-uuid-123'`);
      console.log('✅ Nettoyage terminé');
      
    } catch (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkIndexes();