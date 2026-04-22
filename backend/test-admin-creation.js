const db = require('./src/models');

async function testAdminCreation() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Create school first
    const ecole = await db.Ecole.create({
      nom: 'Test School'
    });
    console.log('✅ École créée:', ecole.id);

    // Create user
    const user = await db.Utilisateur.create({
      nom: 'Test',
      prenom: 'Admin',
      email: 'test.admin@saintjeaningenieur.org',
      motDePasseHash: 'Test123!'
    });
    console.log('✅ Utilisateur créé:', user.id);

    // Try to create admin with ecoleId
    console.log('\n🔧 Tentative 1: avec ecoleId');
    try {
      const admin1 = await db.Administrateur.create({
        id: user.id,
        ecoleId: ecole.id
      });
      console.log('✅ Admin créé avec ecoleId:', admin1.id);
    } catch (error) {
      console.error('❌ Erreur avec ecoleId:', error.message);
    }

    // Try to create admin with ecole_id
    console.log('\n🔧 Tentative 2: avec ecole_id');
    try {
      const admin2 = await db.Administrateur.create({
        id: user.id,
        ecole_id: ecole.id
      });
      console.log('✅ Admin créé avec ecole_id:', admin2.id);
    } catch (error) {
      console.error('❌ Erreur avec ecole_id:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testAdminCreation();
