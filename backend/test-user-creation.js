// Test script to verify user creation without email service
const db = require('./src/models');
const { Utilisateur, Administrateur } = db;

async function testUserCreation() {
  try {
    console.log('🔄 Syncing database...');
    await db.sequelize.sync({ force: true }); // Force recreate tables
    console.log('✅ Database synced');
    
    console.log('🔄 Testing user creation...');
    
    // Test data
    const userData = {
      nom: 'Test',
      prenom: 'Admin',
      email: 'test.admin@saintjeaningenieur.org',
      motDePasseHash: 'testpassword123',
      estActif: true
    };

    // Create user
    const utilisateur = await Utilisateur.create(userData);
    console.log('✅ User created:', utilisateur.id);

    // Create admin role
    await Administrateur.create({ id: utilisateur.id });
    console.log('✅ Admin role created');

    // Fetch complete user
    const completeUser = await Utilisateur.findByPk(utilisateur.id, {
      include: [{ model: Administrateur }]
    });
    
    console.log('✅ Complete user:', {
      id: completeUser.id,
      nom: completeUser.nom,
      prenom: completeUser.prenom,
      email: completeUser.email,
      hasAdmin: !!completeUser.Administrateur
    });

    // Cleanup
    await utilisateur.destroy();
    console.log('✅ Test user cleaned up');
    
    console.log('🎉 User creation test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await db.sequelize.close();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testUserCreation().then(() => process.exit(0));
}

module.exports = testUserCreation;