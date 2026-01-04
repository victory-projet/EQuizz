const db = require('./src/models');

async function checkPassword() {
  try {
    console.log('🔍 Vérification du mot de passe pour celestin.simo...\n');

    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' }
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé');
    console.log('Email:', utilisateur.email);
    console.log('Mot de passe hashé:', utilisateur.motDePasse ? 'Présent' : 'Absent');
    console.log('Longueur du hash:', utilisateur.motDePasse ? utilisateur.motDePasse.length : 0);
    
    // Tester le mot de passe
    if (utilisateur.motDePasse) {
      console.log('\n🔐 Test du mot de passe...');
      const isMatch = await utilisateur.isPasswordMatch('3IVci1TKpZ');
      console.log('Mot de passe "3IVci1TKpZ" correspond:', isMatch ? 'Oui' : 'Non');
      
      // Tester d'autres mots de passe possibles
      const testPasswords = ['password', 'test123', 'admin', '123456'];
      for (const pwd of testPasswords) {
        const match = await utilisateur.isPasswordMatch(pwd);
        if (match) {
          console.log(`✅ Mot de passe trouvé: "${pwd}"`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPassword();