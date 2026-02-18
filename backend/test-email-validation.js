// Test pour valider la nouvelle logique d'email multi-école
const db = require('./src/models');

async function testEmailValidation() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');

    // Test 1: SuperAdmin avec @universitesaintjean.org
    console.log('Test 1: SuperAdmin avec @universitesaintjean.org');
    try {
      const superAdminUser = await db.Utilisateur.create({
        nom: 'testSuper',
        prenom: 'admin',
        email: 'admin@universitesaintjean.org',
        motDePasseHash: 'hash123',
        estActif: true
      });
      console.log('✅ SuperAdmin email accepté:', superAdminUser.email);
      await superAdminUser.destroy();
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }

    // Test 2: Format standard prenom.nom@domaine.org
    console.log('\nTest 2: Format standard prenom.nom@saintjeaningenieur.org');
    try {
      const standardUser = await db.Utilisateur.create({
        nom: 'dupont',
        prenom: 'marie',
        email: 'marie.dupont@saintjeaningenieur.org',
        motDePasseHash: 'hash123',
        estActif: true
      });
      console.log('✅ Standard email accepté:', standardUser.email);
      await standardUser.destroy();
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }

    // Test 3: Email avec domaine CPGE
    console.log('\nTest 3: Format standard prenom.nom@cpge.org');
    try {
      const cpgeUser = await db.Utilisateur.create({
        nom: 'martin',
        prenom: 'jean',
        email: 'jean.martin@cpge.org',
        motDePasseHash: 'hash123',
        estActif: true
      });
      console.log('✅ CPGE email accepté:', cpgeUser.email);
      await cpgeUser.destroy();
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }

    // Test 4: Format invalide (sans point)
    console.log('\nTest 4: Format invalide (marie@saintjeaningenieur.org)');
    try {
      const invalidUser = await db.Utilisateur.create({
        nom: 'dupont',
        prenom: 'marie',
        email: 'marie@saintjeaningenieur.org',
        motDePasseHash: 'hash123',
        estActif: true
      });
      console.log('❌ Email invalide accepté (devrait être rejeté)');
      await invalidUser.destroy();
    } catch (error) {
      console.log('✅ Email invalide correctement rejeté:', error.message);
    }

    // Test 5: Test création d'Ecole avec domaine
    console.log('\nTest 5: Création d\'Ecole avec domaine');
    try {
      const ecole = await db.Ecole.create({
        nom: 'Test School Prepavogt',
        domaine: 'prepavogt.org'
      });
      console.log('✅ Ecole créée avec domaine:', ecole.domaine);
      await ecole.destroy();
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }

    // Test 6: Test SuperAdmin avec type SUPERADMIN
    console.log('\nTest 6: Test SuperAdmin avec type SUPERADMIN');
    try {
      const superUser = await db.Utilisateur.create({
        nom: 'Chief',
        prenom: 'Admin',
        email: 'chief@universitesaintjean.org',
        motDePasseHash: 'hash123',
        estActif: true
      });
      
      const admin = await db.Administrateur.create({
        id: superUser.id,
        type: 'SUPERADMIN'
      });
      console.log('✅ SuperAdmin créé avec type:', admin.type);
      
      await admin.destroy();
      await superUser.destroy();
    } catch (error) {
      console.error('❌ Erreur:', error.message);
    }

    console.log('\n✅ Tous les tests d\'email sont terminés!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
    process.exit(1);
  }
}

testEmailValidation();
