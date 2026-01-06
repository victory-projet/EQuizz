const db = require('./src/models');

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');

    const utilisateurs = await db.Utilisateur.findAll({
      include: [
        { model: db.Etudiant, as: 'Etudiant' },
        { model: db.Enseignant, as: 'Enseignant' },
        { model: db.Administrateur, as: 'Administrateur' }
      ],
      limit: 5
    });

    if (utilisateurs.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    console.log(`✅ ${utilisateurs.length} utilisateur(s) trouvé(s):\n`);

    utilisateurs.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.nom} ${user.prenom}`);
      
      if (user.Etudiant) {
        console.log(`   Matricule: ${user.Etudiant.matricule}`);
        console.log('   Type: Étudiant');
      } else if (user.Enseignant) {
        console.log('   Type: Enseignant');
      } else if (user.Administrateur) {
        console.log('   Type: Administrateur');
      }
      
      console.log(`   Actif: ${user.estActif ? 'Oui' : 'Non'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();