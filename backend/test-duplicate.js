// Test script pour vérifier la duplication d'évaluation
const db = require('./src/models');
const evaluationRepository = require('./src/repositories/evaluation.repository');

async function testDuplicate() {
  try {
    console.log('🔍 Test de duplication d\'évaluation...');
    
    // Récupérer toutes les évaluations
    const evaluations = await evaluationRepository.findAll();
    console.log(`📊 ${evaluations.length} évaluations trouvées`);
    
    if (evaluations.length === 0) {
      console.log('❌ Aucune évaluation trouvée pour tester la duplication');
      return;
    }
    
    // Prendre la première évaluation en brouillon
    const draftEvaluation = evaluations.find(evaluation => evaluation.statut === 'BROUILLON');
    
    if (!draftEvaluation) {
      console.log('❌ Aucune évaluation en brouillon trouvée');
      return;
    }
    
    console.log(`📝 Test avec l'évaluation: ${draftEvaluation.titre} (ID: ${draftEvaluation.id})`);
    
    // Tester la duplication
    const transaction = await db.sequelize.transaction();
    
    try {
      const duplicated = await evaluationRepository.duplicate(
        draftEvaluation.id, 
        draftEvaluation.administrateur_id, 
        transaction
      );
      
      await transaction.commit();
      
      console.log('✅ Duplication réussie !');
      console.log(`📋 Nouvelle évaluation: ${duplicated.titre} (ID: ${duplicated.id})`);
      
      if (duplicated.Quizz) {
        console.log(`🎯 Quizz dupliqué: ${duplicated.Quizz.titre} (ID: ${duplicated.Quizz.id})`);
        if (duplicated.Quizz.Questions) {
          console.log(`❓ ${duplicated.Quizz.Questions.length} questions dupliquées`);
        }
      }
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de duplication:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

testDuplicate();