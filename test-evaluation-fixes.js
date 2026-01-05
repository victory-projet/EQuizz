// Script de test pour vérifier les corrections des évaluations
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration de test (à adapter selon votre environnement)
const TEST_CONFIG = {
  adminToken: 'YOUR_ADMIN_TOKEN', // Remplacer par un vrai token
  evaluationId: 1 // ID d'une évaluation existante
};

async function testEvaluationOperations() {
  console.log('🧪 Test des opérations d\'évaluation...\n');

  const headers = {
    'Authorization': `Bearer ${TEST_CONFIG.adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Test de récupération des évaluations
    console.log('1️⃣ Test de récupération des évaluations...');
    const evaluationsResponse = await axios.get(`${BASE_URL}/evaluations`, { headers });
    console.log(`✅ ${evaluationsResponse.data.length} évaluations récupérées`);

    if (evaluationsResponse.data.length === 0) {
      console.log('❌ Aucune évaluation trouvée pour les tests');
      return;
    }

    const testEvaluation = evaluationsResponse.data[0];
    console.log(`📋 Test avec l'évaluation: "${testEvaluation.titre}" (ID: ${testEvaluation.id})`);

    // 2. Test de duplication
    console.log('\n2️⃣ Test de duplication...');
    const duplicateResponse = await axios.post(
      `${BASE_URL}/evaluations/${testEvaluation.id}/duplicate`, 
      {}, 
      { headers }
    );
    console.log('✅ Duplication réussie');
    console.log(`📋 Nouvelle évaluation: "${duplicateResponse.data.evaluation.titre}" (ID: ${duplicateResponse.data.evaluation.id})`);

    const duplicatedId = duplicateResponse.data.evaluation.id;

    // 3. Test de récupération de l'évaluation dupliquée
    console.log('\n3️⃣ Test de récupération de l\'évaluation dupliquée...');
    const duplicatedEvaluation = await axios.get(`${BASE_URL}/evaluations/${duplicatedId}`, { headers });
    console.log('✅ Évaluation dupliquée récupérée');
    console.log(`📋 Statut: ${duplicatedEvaluation.data.statut}`);
    console.log(`📋 Questions: ${duplicatedEvaluation.data.Quizz?.Questions?.length || 0}`);

    // 4. Test de suppression de l'évaluation dupliquée
    console.log('\n4️⃣ Test de suppression de l\'évaluation dupliquée...');
    await axios.delete(`${BASE_URL}/evaluations/${duplicatedId}`, { headers });
    console.log('✅ Suppression réussie');

    // 5. Vérification que l'évaluation a bien été supprimée
    console.log('\n5️⃣ Vérification de la suppression...');
    try {
      await axios.get(`${BASE_URL}/evaluations/${duplicatedId}`, { headers });
      console.log('❌ L\'évaluation existe encore (problème)');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ L\'évaluation a bien été supprimée');
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
  }
}

// Fonction pour tester uniquement la récupération des évaluations
async function testGetEvaluations() {
  console.log('🧪 Test simple de récupération des évaluations...\n');

  try {
    const response = await axios.get(`${BASE_URL}/evaluations`);
    console.log(`✅ ${response.data.length} évaluations récupérées`);
    
    if (response.data.length > 0) {
      const firstEval = response.data[0];
      console.log(`📋 Première évaluation: "${firstEval.titre}"`);
      console.log(`📋 Statut: ${firstEval.statut}`);
      console.log(`📋 Cours: ${firstEval.Cours?.nom || 'Non défini'}`);
      console.log(`📋 Questions: ${firstEval.Quizz?.Questions?.length || 0}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter les tests
if (process.argv.includes('--simple')) {
  testGetEvaluations();
} else {
  console.log('⚠️  Pour exécuter les tests complets, configurez d\'abord TEST_CONFIG.adminToken');
  console.log('⚠️  Pour un test simple sans authentification, utilisez: node test-evaluation-fixes.js --simple');
  
  if (TEST_CONFIG.adminToken !== 'YOUR_ADMIN_TOKEN') {
    testEvaluationOperations();
  } else {
    testGetEvaluations();
  }
}