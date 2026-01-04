const db = require('./src/models');

async function testExistingPassword() {
  try {
    console.log('🔍 Test du mot de passe existant...\n');

    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' }
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé');
    console.log('Hash existant:', utilisateur.motDePasseHash);

    // Tester différents mots de passe
    const testPasswords = [
      '3IVci1TKpZ',
      'password',
      'test123',
      'admin',
      '123456',
      'celestin',
      'simo',
      '2223i032'
    ];

    console.log('\n🔐 Test des mots de passe...');
    for (const pwd of testPasswords) {
      try {
        const isMatch = await utilisateur.isPasswordMatch(pwd);
        console.log(`"${pwd}": ${isMatch ? '✅ MATCH' : '❌'}`);
        if (isMatch) {
          console.log(`\n🎉 Mot de passe trouvé: "${pwd}"`);
          break;
        }
      } catch (error) {
        console.log(`"${pwd}": ❌ Erreur - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

testExistingPassword();