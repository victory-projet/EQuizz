// Script pour tester la connexion de l'admin
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
  try {
    console.log('🔍 Vérification des identifiants de l\'administrateur\n');

    // 1. Récupérer l'admin
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'admin.sji@saintjeaningenieur.org' }
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   Email: ${utilisateur.email}`);
    console.log(`   Nom: ${utilisateur.nom} ${utilisateur.prenom}`);
    console.log(`   Actif: ${utilisateur.estActif}`);
    console.log(`   Hash du mot de passe: ${utilisateur.motDePasseHash}`);
    console.log('');

    // 2. Tester le mot de passe
    const testPasswords = ['admin123', 'Admin123', 'password', ''];
    
    console.log('🔐 Test des mots de passe courants:\n');
    
    for (const password of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(password, utilisateur.motDePasseHash);
        if (isMatch) {
          console.log(`✅ MOT DE PASSE TROUVÉ: "${password}"`);
          console.log('');
          console.log('📋 Identifiants de connexion:');
          console.log(`   Email: ${utilisateur.email}`);
          console.log(`   Mot de passe: ${password}`);
          process.exit(0);
        } else {
          console.log(`❌ "${password}" - incorrect`);
        }
      } catch (error) {
        console.log(`❌ "${password}" - erreur: ${error.message}`);
      }
    }

    console.log('\n⚠️  Aucun mot de passe courant ne correspond.');
    console.log('💡 Vous pouvez réinitialiser le mot de passe avec le script suivant:');
    console.log('   node backend/reset-admin-password.js');

    process.exit(1);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testAdminLogin();
