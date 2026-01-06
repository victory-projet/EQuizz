const db = require('./src/models');

async function setAdminPassword() {
  try {
    console.log('🔧 Configuration du mot de passe administrateur...\n');

    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'super.admin@saintjeaningenieur.org' }
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur administrateur non trouvé');
      return;
    }

    // Définir un nouveau mot de passe (sera automatiquement hashé par le hook)
    const newPassword = 'admin123';
    utilisateur.motDePasseHash = newPassword;
    await utilisateur.save();

    console.log('✅ Nouveau mot de passe administrateur défini');

    // Tester le nouveau mot de passe
    const isMatch = await utilisateur.isPasswordMatch(newPassword);
    console.log('✅ Test du nouveau mot de passe:', isMatch ? 'Réussi' : 'Échoué');

    if (isMatch) {
      console.log(`\n🎉 Utilisateur: super.admin@saintjeaningenieur.org`);
      console.log(`🔑 Mot de passe: ${newPassword}`);
      console.log(`👑 Type: Administrateur`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

setAdminPassword();