// Script de debug pour tester la suppression d'évaluation
const db = require('./src/models');

async function testDelete() {
  try {
    console.log('🔍 Connexion à la base de données...');
    await db.sequelize.authenticate();
    console.log('✅ Connexion réussie');

    // Lister toutes les évaluations
    console.log('\n📋 Liste des évaluations:');
    const evaluations = await db.Evaluation.findAll({
      include: [
        { model: db.Cours, required: false },
        { model: db.Quizz, include: [db.Question], required: false }
      ]
    });

    evaluations.forEach(eval => {
      console.log(`- ID: ${eval.id}, Titre: ${eval.titre}, Statut: ${eval.statut}, Quizz: ${eval.Quizz ? 'Oui' : 'Non'}`);
    });

    if (evaluations.length === 0) {
      console.log('❌ Aucune évaluation trouvée');
      return;
    }

    // Prendre une évaluation en brouillon pour test
    const testEval = evaluations.find(e => e.statut === 'BROUILLON') || evaluations[0];
    console.log(`\n🎯 Test de suppression sur: ${testEval.titre} (ID: ${testEval.id})`);
    console.log(`📊 Statut: ${testEval.statut}`);

    // Vérifier les soumissions
    if (testEval.Quizz) {
      const submissionsCount = await db.SessionReponse.count({
        where: { quizz_id: testEval.Quizz.id }
      });
      console.log(`📊 Nombre de soumissions: ${submissionsCount}`);

      if (submissionsCount > 0) {
        console.log('⚠️ Cette évaluation a des soumissions, suppression bloquée');
        return;
      }
    }

    // Tenter la suppression
    console.log('🗑️ Tentative de suppression...');
    const result = await db.Evaluation.destroy({
      where: { id: testEval.id }
    });

    console.log(`✅ Suppression réussie. Lignes affectées: ${result}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

testDelete();