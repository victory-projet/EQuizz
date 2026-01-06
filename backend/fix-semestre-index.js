const sequelize = require('./src/config/database');

async function fixSemestreIndex() {
  try {
    console.log('🔧 Correction des index de la table semestre...');
    
    // Vérifier les index de semestre
    console.log('\n📋 Index de la table semestre:');
    const [indexes] = await sequelize.query(`SHOW INDEX FROM semestre`);
    
    indexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? 'non-unique' : 'unique'})`);
    });
    
    // Supprimer les index problématiques
    const problematicIndexes = ['unique_semester_per_year', 'unique_active_semester'];
    
    for (const indexName of problematicIndexes) {
      try {
        console.log(`\n🗑️ Suppression de l'index ${indexName}...`);
        await sequelize.query(`DROP INDEX ${indexName} ON semestre`);
        console.log('✅ Index supprimé');
      } catch (error) {
        console.log(`⚠️ Index ${indexName} déjà supprimé ou n'existe pas`);
      }
    }
    
    // Test d'insertion
    console.log('\n🧪 Test d\'insertion dans semestre...');
    
    // D'abord créer une année académique
    await sequelize.query(`
      INSERT INTO anneeacademique (id, nom, date_debut, date_fin, est_active, est_archive, created_at, updated_at)
      VALUES ('test-annee-123', 'Test-Annee-2024', '2024-09-01', '2025-06-30', 0, 0, NOW(), NOW())
    `);
    console.log('✅ Année académique créée');
    
    // Puis créer un semestre
    await sequelize.query(`
      INSERT INTO semestre (id, nom, numero, date_debut, date_fin, annee_academique_id, est_actif, est_archive, created_at, updated_at)
      VALUES ('test-semestre-123', 'Semestre 1', 1, '2024-09-01', '2025-01-31', 'test-annee-123', 0, 0, NOW(), NOW())
    `);
    console.log('✅ Semestre créé');
    
    // Nettoyer
    await sequelize.query(`DELETE FROM semestre WHERE id = 'test-semestre-123'`);
    await sequelize.query(`DELETE FROM anneeacademique WHERE id = 'test-annee-123'`);
    console.log('✅ Nettoyage terminé');
    
    console.log('\n🎉 Problème résolu !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixSemestreIndex();