// Script pour tester le seeding
const db = require('./src/models');
const { seedDatabase } = require('./src/routes/init.routes');

async function testSeeding() {
  try {
    console.log('🌱 Test du seeding...\n');
    
    const result = await seedDatabase();
    
    if (result.success) {
      console.log('✅ Seeding réussi!');
      console.log(`📊 Message: ${result.message}`);
      
      // Vérifier les données créées
      const userCount = await db.Utilisateur.count();
      const adminCount = await db.Administrateur.count();
      const ecoleCount = await db.Ecole.count();
      const classeCount = await db.Classe.count();
      
      console.log('\n📈 Données créées:');
      console.log(`  - Utilisateurs: ${userCount}`);
      console.log(`  - Administrateurs: ${adminCount}`);
      console.log(`  - Écoles: ${ecoleCount}`);
      console.log(`  - Classes: ${classeCount}`);
      
      // Vérifier l'administrateur
      const admin = await db.Administrateur.findOne({
        include: [
          { model: db.Utilisateur, as: 'Utilisateur' },
          { model: db.Ecole, as: 'Ecole' }
        ]
      });
      
      if (admin) {
        console.log('\n👤 Administrateur créé:');
        console.log(`  - ID: ${admin.id}`);
        console.log(`  - École ID: ${admin.ecole_id}`);
        console.log(`  - École: ${admin.Ecole ? admin.Ecole.nom : 'N/A'}`);
      }
      
      console.log('\n✅ Test terminé avec succès');
    } else {
      console.log('⚠️  Seeding ignoré:', result.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testSeeding();
