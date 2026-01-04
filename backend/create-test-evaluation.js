// Script pour créer une évaluation de test
const db = require('./src/models');

async function createTestEvaluation() {
  try {
    console.log('🔍 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Connexion réussie');

    // Récupérer un administrateur et un cours existants
    const admin = await db.Administrateur.findOne();
    const cours = await db.Cours.findOne();
    const classe = await db.Classe.findOne();

    if (!admin || !cours || !classe) {
      console.log('❌ Données manquantes:', { admin: !!admin, cours: !!cours, classe: !!classe });
      return;
    }

    console.log('📋 Données trouvées:', {
      adminId: admin.id,
      coursId: cours.id,
      classeId: classe.id
    });

    // Créer une évaluation de test
    const evaluation = await db.Evaluation.create({
      titre: 'Test Suppression - ' + new Date().toISOString(),
      description: 'Évaluation créée pour tester la suppression',
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      statut: 'BROUILLON',
      administrateur_id: admin.id,
      cours_id: cours.id
    });

    console.log('✅ Évaluation créée:', evaluation.id, evaluation.titre);

    // Créer le quizz associé
    const quizz = await db.Quizz.create({
      titre: `Quizz pour ${evaluation.titre}`,
      evaluation_id: evaluation.id
    });

    console.log('✅ Quizz créé:', quizz.id);

    // Associer à une classe
    await evaluation.addClasse(classe.id);
    console.log('✅ Classe associée');

    // Créer quelques questions de test
    const questions = [
      {
        enonce: 'Quelle est la différence entre une clé primaire et une clé étrangère ?',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: quizz.id
      },
      {
        enonce: 'Quel langage de requête est utilisé pour interroger une base de données relationnelle ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['SQL', 'HTML', 'CSS', 'JavaScript'],
        quizz_id: quizz.id
      },
      {
        enonce: 'Expliquez le concept de normalisation en base de données.',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: quizz.id
      }
    ];

    const createdQuestions = await db.Question.bulkCreate(questions);
    console.log('✅ Questions créées:', createdQuestions.length);

    console.log('\n🎯 Évaluation de test créée avec succès !');
    console.log('ID:', evaluation.id);
    console.log('Titre:', evaluation.titre);
    console.log('Quizz ID:', quizz.id);
    console.log('Questions:', createdQuestions.length);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

createTestEvaluation();