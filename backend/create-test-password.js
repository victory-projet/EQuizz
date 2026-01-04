const db = require('./src/models');

async function createTestPassword() {
  try {
    console.log('🔧 Création d\'un mot de passe de test...\n');

    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' }
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    // Définir un nouveau mot de passe (sera automatiquement hashé par le hook)
    const newPassword = 'test123';
    utilisateur.motDePasseHash = newPassword;
    await utilisateur.save();

    console.log('✅ Nouveau mot de passe défini');

    // Tester le nouveau mot de passe
    const isMatch = await utilisateur.isPasswordMatch(newPassword);
    console.log('✅ Test du nouveau mot de passe:', isMatch ? 'Réussi' : 'Échoué');

    if (isMatch) {
      console.log(`\n🎉 Utilisateur: celestin.simo@saintjeaningenieur.org`);
      console.log(`🔑 Mot de passe: ${newPassword}`);
      console.log(`📱 Matricule: 2223i032`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestPassword();