const db = require('./src/models');

async function testFilterOptionsDirect() {
  try {
    console.log('🔍 Test direct des options de filtrage...\n');

    // Test 1: Récupérer les classes
    console.log('1️⃣ Test des classes...');
    try {
      const classes = await db.Classe.findAll({
        attributes: ['id', 'nom', 'niveau'],
        include: [
          {
            model: db.AnneeAcademique,
            attributes: ['id', 'nom'],
            required: false
          }
        ]
      });
      console.log(`✅ Classes trouvées: ${classes.length}`);
      if (classes.length > 0) {
        console.log('📋 Première classe:', JSON.stringify(classes[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Erreur classes:', error.message);
    }

    // Test 2: Récupérer les enseignants
    console.log('\n2️⃣ Test des enseignants...');
    try {
      const enseignants = await db.Utilisateur.findAll({
        attributes: ['id', 'nom', 'prenom', 'email'],
        include: [
          {
            model: db.Enseignant,
            required: true,
            attributes: ['id', 'specialite']
          }
        ]
      });
      console.log(`✅ Enseignants trouvés: ${enseignants.length}`);
      if (enseignants.length > 0) {
        console.log('📋 Premier enseignant:', JSON.stringify(enseignants[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Erreur enseignants:', error.message);
      console.log('📋 Stack:', error.stack);
    }

    // Test 3: Vérifier les associations
    console.log('\n3️⃣ Test des associations...');
    try {
      const utilisateurs = await db.Utilisateur.findAll({
        limit: 5,
        include: [
          { model: db.Enseignant, required: false },
          { model: db.Administrateur, required: false },
          { model: db.Etudiant, required: false }
        ]
      });
      console.log(`✅ Utilisateurs avec associations: ${utilisateurs.length}`);
      utilisateurs.forEach(user => {
        console.log(`- ${user.nom} ${user.prenom}: Enseignant=${!!user.Enseignant}, Admin=${!!user.Administrateur}, Etudiant=${!!user.Etudiant}`);
      });
    } catch (error) {
      console.log('❌ Erreur associations:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await db.sequelize.close();
  }
}

testFilterOptionsDirect();