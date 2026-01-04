const db = require('./src/models');

async function setPassword() {
  try {
    console.log('🔧 Configuration du mot de passe pour celestin.simo...\n');

    const hashedPassword = '$2a$10$60OD2cTXWlxnundNjaxCIusQu4G3MCizNRaseflscUhotH57i9Jzq';

    const result = await db.Utilisateur.update(
      { motDePasse: hashedPassword },
      { where: { id: '4633d66c-681a-4f6f-bf4d-6d07536e76dc' } }
    );

    console.log('✅ Mot de passe configuré');
    console.log('Lignes mises à jour:', result[0]);

    // Vérifier que ça fonctionne
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' }
    });

    if (utilisateur && utilisateur.motDePasse) {
      const isMatch = await utilisateur.isPasswordMatch('3IVci1TKpZ');
      console.log('✅ Vérification du mot de passe:', isMatch ? 'Réussi' : 'Échoué');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

setPassword();