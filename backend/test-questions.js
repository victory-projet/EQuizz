// Script de test pour créer des questions de test
const db = require('./src/models');

async function createTestQuestions() {
  try {
    // Trouver une évaluation existante avec un quizz
    const evaluation = await db.Evaluation.findOne({
      include: [{ model: db.Quizz }],
      where: { statut: 'BROUILLON' }
    });

    if (!evaluation || !evaluation.Quizz) {
      console.log('❌ Aucune évaluation en brouillon avec quizz trouvée');
      return;
    }

    console.log('✅ Évaluation trouvée:', {
      id: evaluation.id,
      titre: evaluation.titre,
      quizzId: evaluation.Quizz.id
    });

    // Créer quelques questions de test
    const questions = [
      {
        enonce: 'Quelle est la différence entre une clé primaire et une clé étrangère ?',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: evaluation.Quizz.id
      },
      {
        enonce: 'Quel langage de requête est utilisé pour interroger une base de données relationnelle ?',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['SQL', 'HTML', 'CSS', 'JavaScript'],
        quizz_id: evaluation.Quizz.id
      },
      {
        enonce: 'Expliquez le concept de normalisation en base de données.',
        typeQuestion: 'REPONSE_OUVERTE',
        quizz_id: evaluation.Quizz.id
      }
    ];

    // Supprimer les questions existantes pour ce quizz
    await db.Question.destroy({
      where: { quizz_id: evaluation.Quizz.id }
    });

    // Créer les nouvelles questions
    const createdQuestions = await db.Question.bulkCreate(questions);
    
    console.log('✅ Questions créées avec succès:');
    createdQuestions.forEach((q, index) => {
      console.log(`  ${index + 1}. ${q.enonce} (${q.typeQuestion})`);
    });

    console.log(`\n🎯 Vous pouvez maintenant tester avec l'évaluation ID: ${evaluation.id}`);
    console.log(`🎯 Quizz ID: ${evaluation.Quizz.id}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await db.sequelize.close();
  }
}

createTestQuestions();