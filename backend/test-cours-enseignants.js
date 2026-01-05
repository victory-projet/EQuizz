const db = require('./src/models');

async function testCoursEnseignants() {
  try {
    console.log('🔄 Test des relations Cours-Enseignants...');

    // Synchroniser la base de données
    await db.sequelize.sync({ force: false });

    // 1. Créer un cours de test
    console.log('\n1. Création d\'un cours de test...');
    const cours = await db.Cours.create({
      code: 'TEST001',
      nom: 'Cours de Test'
    });
    console.log('✅ Cours créé:', cours.nom);

    // 2. Récupérer des enseignants existants
    console.log('\n2. Récupération des enseignants...');
    const enseignants = await db.Enseignant.findAll({
      limit: 2,
      include: [{
        model: db.Utilisateur,
        attributes: ['nom', 'prenom', 'email']
      }]
    });
    
    if (enseignants.length === 0) {
      console.log('⚠️ Aucun enseignant trouvé. Créons-en un...');
      
      // Créer un utilisateur enseignant
      const utilisateur = await db.Utilisateur.create({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.com',
        motDePasse: 'password123',
        role: 'enseignant'
      });

      const enseignant = await db.Enseignant.create({
        id: utilisateur.id,
        specialite: 'Informatique'
      });

      enseignants.push(await db.Enseignant.findByPk(enseignant.id, {
        include: [{
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email']
        }]
      }));
    }

    console.log(`✅ ${enseignants.length} enseignant(s) trouvé(s)`);

    // 3. Associer les enseignants au cours
    console.log('\n3. Association des enseignants au cours...');
    await cours.setEnseignants(enseignants);
    console.log('✅ Enseignants associés au cours');

    // 4. Vérifier les associations
    console.log('\n4. Vérification des associations...');
    const coursAvecEnseignants = await db.Cours.findByPk(cours.id, {
      include: [{
        model: db.Enseignant,
        through: { attributes: [] },
        include: [{
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email']
        }]
      }]
    });

    console.log('✅ Cours avec enseignants:');
    console.log(`   - Nom: ${coursAvecEnseignants.nom}`);
    console.log(`   - Code: ${coursAvecEnseignants.code}`);
    console.log(`   - Enseignants (${coursAvecEnseignants.Enseignants.length}):`);
    coursAvecEnseignants.Enseignants.forEach(ens => {
      console.log(`     * ${ens.Utilisateur.prenom} ${ens.Utilisateur.nom} (${ens.Utilisateur.email})`);
    });

    // 5. Test de pagination
    console.log('\n5. Test de pagination...');
    const coursPage1 = await db.Cours.findAndCountAll({
      where: { estArchive: false },
      include: [{
        model: db.Enseignant,
        through: { attributes: [] },
        include: [{
          model: db.Utilisateur,
          attributes: ['nom', 'prenom', 'email']
        }]
      }],
      limit: 5,
      offset: 0,
      order: [['nom', 'ASC']]
    });

    console.log(`✅ Pagination: ${coursPage1.count} cours total(s), ${coursPage1.rows.length} sur cette page`);

    // 6. Nettoyage
    console.log('\n6. Nettoyage...');
    await cours.destroy();
    console.log('✅ Cours de test supprimé');

    console.log('\n🎉 Tous les tests sont passés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error(error.stack);
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le test
testCoursEnseignants();