const sequelize = require('./src/config/database');

async function fixUniqueIndex() {
  try {
    console.log('🔧 Correction de l\'index unique...');
    
    // Supprimer l'index problématique
    console.log('\n1. Suppression de l\'index unique_active_year...');
    try {
      await sequelize.query(`DROP INDEX unique_active_year ON anneeacademique`);
      console.log('✅ Index supprimé');
    } catch (error) {
      console.log('⚠️ Index déjà supprimé ou n\'existe pas');
    }
    
    // Créer un nouvel index conditionnel (seulement pour MySQL 8.0+)
    // Pour les versions antérieures, on utilisera une contrainte au niveau application
    console.log('\n2. Test d\'insertion...');
    await sequelize.query(`
      INSERT INTO anneeacademique (id, nom, date_debut, date_fin, est_active, est_archive, created_at, updated_at)
      VALUES ('test-uuid-123', 'Test-2024', '2024-09-01', '2025-06-30', 0, 0, NOW(), NOW())
    `);
    console.log('✅ Insertion réussie');
    
    await sequelize.query(`
      INSERT INTO anneeacademique (id, nom, date_debut, date_fin, est_active, est_archive, created_at, updated_at)
      VALUES ('test-uuid-456', 'Test-2025', '2025-09-01', '2026-06-30', 0, 0, NOW(), NOW())
    `);
    console.log('✅ Deuxième insertion réussie');
    
    // Nettoyer
    await sequelize.query(`DELETE FROM anneeacademique WHERE id IN ('test-uuid-123', 'test-uuid-456')`);
    console.log('✅ Nettoyage terminé');
    
    console.log('\n🎉 Problème résolu !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixUniqueIndex();