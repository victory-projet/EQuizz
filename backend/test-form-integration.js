// Test d'intégration pour le formulaire d'évaluation
const db = require('./src/models');

async function testFormIntegration() {
  try {
    console.log('🧪 Test d\'intégration du formulaire d\'évaluation');
    console.log('=' .repeat(50));

    // 1. Tester la connexion à la base de données
    console.log('\n1. 🔌 Test de connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Connexion réussie');

    // 2. Vérifier les cours disponibles
    console.log('\n2. 📚 Vérification des cours disponibles...');
    const cours = await db.Cours.findAll({
      where: { estArchive: false },
      attributes: ['id', 'nom', 'code']
    });
    console.log(`✅ ${cours.length} cours trouvés:`);
    cours.forEach(c => console.log(`   - ${c.nom} (${c.code}) - ID: ${c.id}`));

    // 3. Vérifier les classes disponibles
    console.log('\n3. 👥 Vérification des classes disponibles...');
    const classes = await db.Classe.findAll({
      include: [
        {
          model: db.Etudiant,
          attributes: ['id'],
          required: false
        }
      ],
      attributes: ['id', 'nom', 'niveau']
    });
    
    const classesWithEffectif = classes.map(classe => ({
      id: classe.id,
      nom: classe.nom,
      niveau: classe.niveau,
      effectif: classe.Etudiants ? classe.Etudiants.length : 0
    }));
    
    console.log(`✅ ${classesWithEffectif.length} classes trouvées:`);
    classesWithEffectif.forEach(c => console.log(`   - ${c.nom} (${c.niveau}) - ${c.effectif} étudiants - ID: ${c.id}`));

    // 4. Tester la création d'une évaluation
    console.log('\n4. 📝 Test de création d\'évaluation...');
    
    if (cours.length === 0 || classesWithEffectif.length === 0) {
      console.log('⚠️  Impossible de tester la création : pas de cours ou de classes disponibles');
      return;
    }

    // Récupérer un admin pour le test
    const admin = await db.Utilisateur.findOne({
      include: [{ model: db.Administrateur }],
      where: { '$Administrateur.id$': { [db.Sequelize.Op.ne]: null } }
    });

    if (!admin) {
      console.log('⚠️  Impossible de tester la création : aucun administrateur trouvé');
      return;
    }

    const testEvaluationData = {
      titre: 'Test Évaluation Formulaire',
      description: 'Test d\'intégration du formulaire',
      dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      coursId: cours[0].id,
      classeIds: [classesWithEffectif[0].id],
      statut: 'BROUILLON'
    };

    console.log('📤 Données de test:', {
      titre: testEvaluationData.titre,
      coursId: testEvaluationData.coursId,
      classeIds: testEvaluationData.classeIds,
      statut: testEvaluationData.statut
    });

    // Simuler l'appel du service
    const evaluationService = require('./src/services/evaluation.service');
    const evaluation = await evaluationService.create(testEvaluationData, admin.id);
    
    console.log('✅ Évaluation créée avec succès:', {
      id: evaluation.id,
      titre: evaluation.titre,
      statut: evaluation.statut,
      coursNom: evaluation.Cour?.nom || evaluation.Cours?.nom,
      classesCount: evaluation.Classes?.length || 0
    });

    // 5. Nettoyer le test
    console.log('\n5. 🧹 Nettoyage...');
    await db.Evaluation.destroy({ where: { id: evaluation.id } });
    console.log('✅ Évaluation de test supprimée');

    console.log('\n🎉 Test d\'intégration réussi !');
    console.log('✅ Le formulaire peut correctement communiquer avec le backend');

  } catch (error) {
    console.error('\n❌ Erreur lors du test d\'intégration:', error);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

// Exécuter le test
testFormIntegration();