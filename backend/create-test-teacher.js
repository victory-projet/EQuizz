const db = require('./src/models');

async function createTestTeacher() {
  try {
    console.log('🔍 Création d\'un enseignant de test...\n');

    // 1. Créer un utilisateur enseignant
    const [utilisateur, created] = await db.Utilisateur.findOrCreate({
      where: { email: 'jean.martin@saintjeaningenieur.org' },
      defaults: {
        nom: 'Martin',
        prenom: 'Jean',
        email: 'jean.martin@saintjeaningenieur.org',
        motDePasseHash: 'teacher123',
        estActif: true
      }
    });

    if (created) {
      console.log('✅ Utilisateur créé:', utilisateur.email);
    } else {
      console.log('ℹ️ Utilisateur existant:', utilisateur.email);
    }

    // 2. Créer le profil enseignant
    const [enseignant, enseignantCreated] = await db.Enseignant.findOrCreate({
      where: { id: utilisateur.id },
      defaults: {
        id: utilisateur.id,
        specialite: 'Informatique'
      }
    });

    if (enseignantCreated) {
      console.log('✅ Profil enseignant créé');
    } else {
      console.log('ℹ️ Profil enseignant existant');
    }

    // 3. Créer un deuxième enseignant
    const [utilisateur2, created2] = await db.Utilisateur.findOrCreate({
      where: { email: 'marie.dubois@saintjeaningenieur.org' },
      defaults: {
        nom: 'Dubois',
        prenom: 'Marie',
        email: 'marie.dubois@saintjeaningenieur.org',
        motDePasseHash: 'teacher123',
        estActif: true
      }
    });

    if (created2) {
      console.log('✅ Deuxième utilisateur créé:', utilisateur2.email);
    } else {
      console.log('ℹ️ Deuxième utilisateur existant:', utilisateur2.email);
    }

    const [enseignant2, enseignant2Created] = await db.Enseignant.findOrCreate({
      where: { id: utilisateur2.id },
      defaults: {
        id: utilisateur2.id,
        specialite: 'Mathématiques'
      }
    });

    if (enseignant2Created) {
      console.log('✅ Deuxième profil enseignant créé');
    } else {
      console.log('ℹ️ Deuxième profil enseignant existant');
    }

    // 4. Vérifier les enseignants créés
    console.log('\n📊 Vérification des enseignants...');
    const enseignants = await db.Utilisateur.findAll({
      include: [
        {
          model: db.Enseignant,
          required: false
        }
      ]
    });

    const enseignantsFiltered = enseignants.filter(user => user.Enseignant !== null);
    console.log(`✅ Total enseignants: ${enseignantsFiltered.length}`);
    
    enseignantsFiltered.forEach(teacher => {
      console.log(`- ${teacher.prenom} ${teacher.nom} (${teacher.email}) - Spécialité: ${teacher.Enseignant.specialite}`);
    });

    console.log('\n🎉 Enseignants de test créés avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await db.sequelize.close();
  }
}

createTestTeacher();