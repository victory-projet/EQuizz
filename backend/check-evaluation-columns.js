// Vérifier les colonnes de la table Evaluation
const db = require('./src/models');

async function checkColumns() {
  try {
    const [results] = await db.sequelize.query('DESCRIBE Evaluation');
    
    console.log('📊 Colonnes de la table Evaluation:\n');
    
    const adminCol = results.find(c => c.Field === 'administrateur_id');
    const superAdminCol = results.find(c => c.Field === 'superadministrateur_id');
    
    console.log('✓ superadministrateur_id:', superAdminCol ? '✅ EXISTE' : '❌ N\'EXISTE PAS');
    console.log('✓ administrateur_id:', adminCol ? '✅ EXISTE' : '❌ N\'EXISTE PAS');
    
    if (adminCol) {
      console.log('\n📋 Détails administrateur_id:');
      console.log('   Type:', adminCol.Type);
      console.log('   Null:', adminCol.Null);
      console.log('   Key:', adminCol.Key);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkColumns();
