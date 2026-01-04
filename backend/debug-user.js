const db = require('./src/models');

async function debugUser() {
  try {
    console.log('🔍 Debug de l\'utilisateur celestin.simo...\n');

    // Récupérer l'utilisateur avec tous les détails
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' },
      raw: true
    });

    console.log('Utilisateur trouvé:', utilisateur);

    if (utilisateur) {
      // Essayer de mettre à jour avec l'ID exact
      console.log('\n🔧 Tentative de mise à jour du mot de passe...');
      
      const hashedPassword = '$2a$10$60OD2cTXWlxnundNjaxCIusQu4G3MCizNRaseflscUhotH57i9Jzq';
      
      const [affectedRows] = await db.Utilisateur.update(
        { motDePasse: hashedPassword },
        { 
          where: { id: utilisateur.id },
          returning: true
        }
      );

      console.log('Lignes affectées:', affectedRows);

      // Vérifier la mise à jour
      const updatedUser = await db.Utilisateur.findByPk(utilisateur.id);
      console.log('Mot de passe après mise à jour:', updatedUser.motDePasse ? 'Présent' : 'Absent');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

debugUser();