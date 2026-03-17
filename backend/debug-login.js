// Debug pour voir ce que contient l'utilisateur
require('dotenv').config();
const db = require('./src/models');

async function debugLogin() {
  try {
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'super.admin@universitesaintjean.org' },
      include: [
        { model: db.Superadministrateur, as: 'Superadministrateur' },
        { model: db.Enseignant, as: 'Enseignant' },
        { model: db.Etudiant, as: 'Etudiant' }
      ]
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log('   ID:', utilisateur.id);
    console.log('   Email:', utilisateur.email);
    console.log('   Nom:', utilisateur.prenom, utilisateur.nom);
    console.log('\n📋 Profils associés:');
    console.log('   Superadministrateur:', utilisateur.Superadministrateur ? '✅ OUI' : '❌ NON');
    console.log('   Enseignant:', utilisateur.Enseignant ? '✅ OUI' : '❌ NON');
    console.log('   Etudiant:', utilisateur.Etudiant ? '✅ OUI' : '❌ NON');

    if (utilisateur.Superadministrateur) {
      console.log('\n✅ Détails Superadministrateur:');
      console.log(JSON.stringify(utilisateur.Superadministrateur.toJSON(), null, 2));
    }

    // Vérifier dans la table directement
    console.log('\n🔍 Vérification directe dans la table superadministrateur:');
    const superadmin = await db.Superadministrateur.findByPk(utilisateur.id);
    console.log('   Trouvé:', superadmin ? '✅ OUI' : '❌ NON');
    if (superadmin) {
      console.log('   ID:', superadmin.id);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugLogin();
