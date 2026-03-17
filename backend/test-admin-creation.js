// Test direct de création d'administrateur et superadministrateur
const db = require('./src/models');

async function testAdminCreation() {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('🧪 Test de création d\'administrateur et superadministrateur...\n');
    
    // 1. Créer une école
    const ecole = await db.Ecole.create({
      nom: 'Test École ' + Date.now(),
      estActive: true
    }, { transaction });
    console.log(`✅ École créée:`);
    console.log(`   - ID: ${ecole.id}`);
    console.log(`   - Nom: ${ecole.nom}`);
    console.log(`   - Active: ${ecole.estActive}`);
    
    // 2. Créer un superadministrateur
    console.log('\n📝 Création d\'un superadministrateur...');
    const superadminUser = await db.Utilisateur.create({
      nom: 'SuperAdmin',
      prenom: 'Test',
      email: `test.superadmin${Date.now()}@universitesaintjean.org`,
      motDePasseHash: 'Test123!'
    }, { transaction });
    console.log(`✅ Utilisateur superadmin créé:`);
    console.log(`   - ID: ${superadminUser.id}`);
    console.log(`   - Email: ${superadminUser.email}`);
    console.log(`   - Nom: ${superadminUser.prenom} ${superadminUser.nom}`);
    
    const superadmin = await db.Superadministrateur.create({
      id: superadminUser.id,
      profil: null
    }, { transaction });
    console.log(`✅ Superadministrateur créé:`);
    console.log(`   - ID: ${superadmin.id}`);
    
    // 3. Créer un administrateur
    console.log('\n📝 Création d\'un administrateur...');
    const adminUser = await db.Utilisateur.create({
      nom: 'Admin',
      prenom: 'Test',
      email: `test.admin${Date.now()}@saintjeaningenieur.org`,
      motDePasseHash: 'Test123!'
    }, { transaction });
    console.log(`✅ Utilisateur admin créé:`);
    console.log(`   - ID: ${adminUser.id}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Nom: ${adminUser.prenom} ${adminUser.nom}`);
    
    const admin = await db.Administrateur.create({
      id: adminUser.id,
      ecoleId: ecole.id
    }, { transaction });
    console.log(`✅ Administrateur créé:`);
    console.log(`   - ID: ${admin.id}`);
    console.log(`   - ecole_id (DB): ${admin.ecole_id}`);
    console.log(`   - ecoleId (model): ${admin.ecoleId}`);
    
    // 4. Vérifier les données créées
    console.log('\n🔍 Vérification des données...');
    const userCount = await db.Utilisateur.count({ transaction });
    const superadminCount = await db.Superadministrateur.count({ transaction });
    const adminCount = await db.Administrateur.count({ transaction });
    const ecoleCount = await db.Ecole.count({ transaction });
    
    console.log(`   - Utilisateurs: ${userCount}`);
    console.log(`   - Superadministrateurs: ${superadminCount}`);
    console.log(`   - Administrateurs: ${adminCount}`);
    console.log(`   - Écoles: ${ecoleCount}`);
    
    await transaction.commit();
    console.log('\n✅ Test réussi! Toutes les données ont été créées correctement.');
    
    // Afficher un résumé des données créées
    console.log('\n📋 Résumé des données créées:');
    console.log('   Superadmin:');
    console.log(`     - Email: ${superadminUser.email}`);
    console.log(`     - ID: ${superadminUser.id}`);
    console.log('   Admin:');
    console.log(`     - Email: ${adminUser.email}`);
    console.log(`     - ID: ${adminUser.id}`);
    console.log(`     - École: ${ecole.nom} (${ecole.id})`);
    
    process.exit(0);
    
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAdminCreation();
