const db = require('./src/models');

async function createTestData() {
  try {
    console.log('🔍 Création des données de test...\n');

    // 1. Récupérer ou créer une année académique
    let anneeAcademique = await db.AnneeAcademique.findOne({
      where: { nom: '2025-2026' }
    });
    
    if (!anneeAcademique) {
      anneeAcademique = await db.AnneeAcademique.create({
        nom: '2025-2026',
        dateDebut: new Date('2025-09-01'),
        dateFin: new Date('2026-06-30'),
        estActive: true
      });
    }
    console.log('✅ Année académique:', anneeAcademique.nom);

    // 2. Récupérer ou créer un cours
    let cours = await db.Cours.findOne({
      where: { nom: 'Mathématiques' }
    });
    
    if (!cours) {
      cours = await db.Cours.create({
        nom: 'Mathématiques',
        code: 'MATH101',
        description: 'Cours de mathématiques de base',
        credits: 3
      });
    }
    console.log('✅ Cours:', cours.nom);

    // 3. Récupérer ou créer une école
    let ecole = await db.Ecole.findOne({
      where: { nom: 'École Test' }
    });
    
    if (!ecole) {
      ecole = await db.Ecole.create({
        nom: 'École Test',
        adresse: '123 Rue de Test',
        telephone: '01 23 45 67 89',
        email: 'contact@ecole-test.fr'
      });
    }
    console.log('✅ École:', ecole.nom);

    // 4. Récupérer ou créer une classe
    let classe = await db.Classe.findOne({
      where: { nom: 'L1 Informatique' }
    });
    
    if (!classe) {
      classe = await db.Classe.create({
        nom: 'L1 Informatique',
        niveau: 'L1',
        anneeAcademiqueId: anneeAcademique.id,
        ecole_id: ecole.id
      });
    }
    console.log('✅ Classe:', classe.nom);

    // 5. Créer une évaluation de test
    const admin = await db.Utilisateur.findOne({
      where: { email: 'super.admin@saintjeaningenieur.org' },
      include: [{ model: db.Administrateur }]
    });

    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }

    const [evaluation] = await db.Evaluation.findOrCreate({
      where: { titre: 'Évaluation Test Mathématiques' },
      defaults: {
        titre: 'Évaluation Test Mathématiques',
        description: 'Évaluation de test pour vérifier le système',
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        statut: 'BROUILLON',
        cours_id: cours.id,
        administrateur_id: admin.id
      }
    });
    console.log('✅ Évaluation créée:', evaluation.titre);

    // 6. Associer la classe à l'évaluation
    await evaluation.addClasse(classe.id);
    console.log('✅ Classe associée à l\'évaluation');

    // 7. Créer un quizz pour l'évaluation
    const [quizz] = await db.Quizz.findOrCreate({
      where: { evaluation_id: evaluation.id },
      defaults: {
        titre: `Quizz pour ${evaluation.titre}`,
        evaluation_id: evaluation.id
      }
    });
    console.log('✅ Quizz créé:', quizz.titre);

    // 8. Ajouter quelques questions
    const questions = [
      {
        enonce: 'Combien font 2 + 2 ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['3', '4', '5', '6'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Quelle est la racine carrée de 16 ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['2', '4', '8', '16'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Expliquez le théorème de Pythagore',
        typeQuestion: 'TEXTE_LIBRE',
        options: [],
        quizz_id: quizz.id
      }
    ];

    for (const questionData of questions) {
      const [question] = await db.Question.findOrCreate({
        where: { 
          enonce: questionData.enonce,
          quizz_id: quizz.id 
        },
        defaults: questionData
      });
      console.log('✅ Question créée:', question.enonce.substring(0, 30) + '...');
    }

    console.log('\n🎉 Données de test créées avec succès !');
    console.log('📊 Résumé:');
    console.log(`- Année académique: ${anneeAcademique.nom}`);
    console.log(`- École: ${ecole.nom}`);
    console.log(`- Cours: ${cours.nom} (${cours.code})`);
    console.log(`- Classe: ${classe.nom}`);
    console.log(`- Évaluation: ${evaluation.titre}`);
    console.log(`- Quizz: ${quizz.titre}`);
    console.log(`- Questions: ${questions.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await db.sequelize.close();
  }
}

createTestData();