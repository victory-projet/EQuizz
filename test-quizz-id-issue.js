// Script de test pour diagnostiquer le problème de quizzId
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration de test
const TEST_CONFIG = {
  adminToken: 'YOUR_ADMIN_TOKEN', // Remplacer par un vrai token
  testData: {
    titre: 'Test Quiz ID Issue',
    description: 'Test pour diagnostiquer le problème de quizzId',
    dateDebut: new Date().toISOString(),
    dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    cours_id: null,
    classeIds: [],
    statut: 'BROUILLON'
  }
};

async function testQuizzIdIssue() {
  console.log('🧪 Test de diagnostic du problème quizzId...\n');

  const headers = {
    'Authorization': `Bearer ${TEST_CONFIG.adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Récupérer les données de base
    console.log('1️⃣ Récupération des données de base...');
    const [coursResponse, classesResponse] = await Promise.all([
      axios.get(`${BASE_URL}/cours`, { headers }),
      axios.get(`${BASE_URL}/classes`, { headers })
    ]);

    if (coursResponse.data.length === 0 || classesResponse.data.length === 0) {
      console.log('❌ Données de base manquantes');
      return;
    }

    TEST_CONFIG.testData.cours_id = coursResponse.data[0].id;
    TEST_CONFIG.testData.classeIds = [classesResponse.data[0].id];

    console.log(`✅ Cours: ${coursResponse.data[0].nom} (${coursResponse.data[0].id})`);
    console.log(`✅ Classe: ${classesResponse.data[0].nom} (${classesResponse.data[0].id})`);

    // 2. Créer l'évaluation
    console.log('\n2️⃣ Création de l\'évaluation...');
    const createResponse = await axios.post(
      `${BASE_URL}/evaluations`, 
      TEST_CONFIG.testData, 
      { headers }
    );

    console.log('✅ Évaluation créée');
    console.log('📋 ID évaluation:', createResponse.data.id);
    console.log('🔍 Structure de la réponse de création:');
    console.log(JSON.stringify(createResponse.data, null, 2));

    // Vérifier si le quizz est dans la réponse
    let quizzId = null;
    if (createResponse.data.quizz?.id) {
      quizzId = createResponse.data.quizz.id;
      console.log('✅ Quizz ID trouvé via quizz.id:', quizzId);
    } else if (createResponse.data.Quizz?.id) {
      quizzId = createResponse.data.Quizz.id;
      console.log('✅ Quizz ID trouvé via Quizz.id:', quizzId);
    } else if (createResponse.data.quizzId) {
      quizzId = createResponse.data.quizzId;
      console.log('✅ Quizz ID trouvé via quizzId:', quizzId);
    } else {
      console.log('⚠️ Quizz ID non trouvé dans la réponse de création');
    }

    // 3. Récupérer l'évaluation complète
    console.log('\n3️⃣ Récupération de l\'évaluation complète...');
    const getResponse = await axios.get(
      `${BASE_URL}/evaluations/${createResponse.data.id}`, 
      { headers }
    );

    console.log('✅ Évaluation complète récupérée');
    console.log('🔍 Structure de la réponse de récupération:');
    console.log(JSON.stringify(getResponse.data, null, 2));

    // Vérifier le quizz dans la réponse complète
    if (getResponse.data.quizz?.id) {
      quizzId = getResponse.data.quizz.id;
      console.log('✅ Quizz ID trouvé dans récupération via quizz.id:', quizzId);
    } else if (getResponse.data.Quizz?.id) {
      quizzId = getResponse.data.Quizz.id;
      console.log('✅ Quizz ID trouvé dans récupération via Quizz.id:', quizzId);
    } else {
      console.log('❌ Quizz ID toujours non trouvé dans la récupération complète');
    }

    // 4. Tester la création de question si quizzId trouvé
    if (quizzId) {
      console.log('\n4️⃣ Test de création de question...');
      const questionData = {
        enonce: 'Question de test',
        typeQuestion: 'CHOIX_MULTIPLE',
        options: ['Option A', 'Option B', 'Option C'],
        ordre: 1
      };

      try {
        const questionResponse = await axios.post(
          `${BASE_URL}/evaluations/quizz/${quizzId}/questions`,
          questionData,
          { headers }
        );
        console.log('✅ Question créée avec succès:', questionResponse.data.id);
      } catch (questionError) {
        console.log('❌ Erreur création question:', questionError.response?.data || questionError.message);
      }
    } else {
      console.log('\n4️⃣ ❌ Impossible de tester la création de question - quizzId manquant');
    }

    // 5. Vérifier directement dans la base de données
    console.log('\n5️⃣ Vérification directe des quizz...');
    try {
      const quizzResponse = await axios.get(`${BASE_URL}/quizz`, { headers });
      console.log(`✅ ${quizzResponse.data.length} quizz trouvés dans la base`);
      
      const relatedQuizz = quizzResponse.data.find(q => q.evaluation_id === createResponse.data.id);
      if (relatedQuizz) {
        console.log('✅ Quizz associé trouvé:', relatedQuizz.id);
        console.log('📋 Détails du quizz:', JSON.stringify(relatedQuizz, null, 2));
      } else {
        console.log('❌ Aucun quizz associé à cette évaluation trouvé');
      }
    } catch (quizzError) {
      console.log('⚠️ Impossible de récupérer les quizz directement:', quizzError.message);
    }

    // 6. Nettoyer
    console.log('\n6️⃣ Nettoyage...');
    await axios.delete(`${BASE_URL}/evaluations/${createResponse.data.id}`, { headers });
    console.log('✅ Évaluation de test supprimée');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
}

// Test simple sans authentification
async function testBasicEndpoints() {
  console.log('🧪 Test des endpoints de base...\n');

  try {
    const endpoints = [
      '/cours',
      '/classes',
      '/evaluations'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.data.length} éléments`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter les tests
if (process.argv.includes('--basic')) {
  testBasicEndpoints();
} else {
  console.log('⚠️  Pour exécuter les tests complets, configurez d\'abord TEST_CONFIG.adminToken');
  console.log('⚠️  Pour un test simple sans authentification, utilisez: node test-quizz-id-issue.js --basic');
  
  if (TEST_CONFIG.adminToken !== 'YOUR_ADMIN_TOKEN') {
    testQuizzIdIssue();
  } else {
    testBasicEndpoints();
  }
}