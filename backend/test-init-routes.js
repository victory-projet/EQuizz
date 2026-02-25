// Test du seeding init-routes avec rechargement forcé
delete require.cache[require.resolve('./src/routes/init.routes.js')];
delete require.cache[require.resolve('./src/models')];

const db = require('./src/models');

async function testInitRoutes() {
  try {
    console.log('🧪 Test du seeding init-routes.js\n');
    
    // Vérifier que la DB est vide
    const userCount = await db.Utilisateur.count();
    console.log(`👥 Utilisateurs actuels: ${userCount}\n`);
    
    if (userCount > 0) {
      console.log('⚠️  Base de données non vide. Réinitialiser avec: node reset-database.js');
      process.exit(1);
    }
    
    // Charger la fonction seedDatabase
    const { seedDatabase } = require('./src/routes/init.routes.js');
    
    console.log('🌱 Lancement du seeding...\n');
    const result = await seedDatabase();
    
    if (result.success) {
      console.log('✅ SEEDING RÉUSSI!\n');
      console.log(`📊 ${result.message}\n`);
      
      // Vérifier les données
      const stats = {
        utilisateurs: await db.Utilisateur.count(),
        administrateurs: await db.Administrateur.count(),
        superadmins: await db.Superadministrateur.count(),
        ecoles: await db.Ecole.count(),
        classes: await db.Classe.count(),
        enseignants: await db.Enseignant.count(),
        etudiants: await db.Etudiant.count(),
        cours: await db.Cours.count()
      };
      
      console.log('📈 Données créées:');
      Object.entries(stats).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Vérifier l'administrateur
      const admin = await db.Administrateur.findOne({
        include: [
          { model: db.Utilisateur, as: 'Utilisateur' },
          { model: db.Ecole, as: 'Ecole' }
        ]
      });
      
      if (admin) {
        console.log('\n✅ Administrateur vérifié:');
        console.log(`   Email: ${admin.Utilisateur.email}`);
        console.log(`   École: ${admin.Ecole.nom}`);
        console.log(`   ecole_id: ${admin.ecole_id}`);
        console.log(`   ecoleId: ${admin.ecoleId}`);
      }
      
      console.log('\n✅ INIT-ROUTES FONCTIONNE CORRECTEMENT!');
      process.exit(0);
    } else {
      console.log('⚠️  Seeding ignoré:', result.message);
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du seeding:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

testInitRoutes();
