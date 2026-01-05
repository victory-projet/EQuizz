// Script de test pour la création d'évaluation
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration de test
const TEST_CONFIG = {
  adminToken: 'YOUR_ADMIN_TOKEN', // Remplacer par un vrai token
  testData: {
    titre: 'Test Quiz Creation',
    description: 'Quiz de test pour vérifier la création',
    dateDebut: new Date().toISOString(),
    dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    cours_id: null, // À récupérer dynamiquement
    classeIds: [], // À récupérer dynamiquement
    statut: 'BROUILLON'
  }
};

async function testEvaluationCreation() {
  console.log('🧪 Test de création d\'évaluation...\n');

  const headers = {
    'Authorization': `Bearer ${TEST_CONFIG.adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Récupérer les cours disponibles
    console.log('1️⃣ Récupération des cours...');
    const coursResponse = await axios.get(`${BASE_URL}/cours`, { headers });
    console.log(`✅ ${coursResponse.data.length} cours trouvés`);
    
    if (coursResponse.data.length === 0) {
      console.log('❌ Aucun cours disponible pour les tests');
      return;
    }

    const firstCours = coursResponse.data[0];
    TEST_CONFIG.testData.cours_id = firstCours.id;
    console.log(`📚 Cours sélectionné: "${firstCours.nom}" (ID: ${firstCours.id})`);

    // 2. Récupérer les classes disponibles
    console.log('\n2️⃣ Récupération des classes...');
    const classesResponse = await axios.get(`${BASE_URL}/classes`, { headers });
    console.log(`✅ ${classesResponse.data.length} classes trouvées`);
    
    if (classesResponse.data.length === 0) {
      console.log('❌ Aucune classe disponible pour les tests');
      return;
    }

    const firstClasse = classesResponse.data[0];
    TEST_CONFIG.testData.classeIds = [firstClasse.id];
    console.log(`👥 Classe sélectionnée: "${firstClasse.nom}" (ID: ${firstClasse.id})`);

    // 3. Tester la création d'évaluation
    console.log('\n3️⃣ Test de création d\'évaluation...');
    console.log('📤 Données envoyées:', JSON.stringify(TEST_CONFIG.testData, null, 2));
    
    const createResponse = await axios.post(
      `${BASE_URL}/evaluations`, 
      TEST_CONFIG.testData, 
      { headers }
    );
    
    console.log('✅ Évaluation créée avec succès !');
    console.log(`📋 ID: ${createResponse.data.id}`);
    console.log(`📋 Titre: ${createResponse.data.titre}`);
    console.log(`📋 Statut: ${createResponse.data.statut}`);

    // 4. Vérifier que l'évaluation existe
    console.log('\n4️⃣ Vérification de l\'évaluation créée...');
    const getResponse = await axios.get(
      `${BASE_URL}/evaluations/${createResponse.data.id}`, 
      { headers }
    );
    
    console.log('✅ Évaluation récupérée avec succès');
    console.log(`📋 Cours associé: ${getResponse.data.Cours?.nom || 'Non défini'}`);
    console.log(`📋 Classes: ${getResponse.data.Classes?.length || 0}`);
    console.log(`📋 Quizz ID: ${getResponse.data.Quizz?.id || 'Non créé'}`);

    // 5. Nettoyer (supprimer l'évaluation de test)
    console.log('\n5️⃣ Nettoyage...');
    await axios.delete(`${BASE_URL}/evaluations/${createResponse.data.id}`, { headers });
    console.log('✅ Évaluation de test supprimée');

    console.log('\n🎉 Tous les tests sont passés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Détails de l\'erreur 400:');
      console.log('- Vérifiez que cours_id est un UUID valide');
      console.log('- Vérifiez que classeIds est un array non vide');
      console.log('- Vérifiez que l\'utilisateur est bien administrateur');
    }
  }
}

// Fonction pour tester sans authentification (récupération des données de base)
async function testBasicData() {
  console.log('🧪 Test de récupération des données de base...\n');

  try {
    // Test cours
    console.log('1️⃣ Test récupération cours...');
    const coursResponse = await axios.get(`${BASE_URL}/cours`);
    console.log(`✅ ${coursResponse.data.length} cours récupérés`);
    
    if (coursResponse.data.length > 0) {
      const firstCours = coursResponse.data[0];
      console.log(`📚 Premier cours: "${firstCours.nom}" (ID: ${firstCours.id}, Type: ${typeof firstCours.id})`);
    }

    // Test classes
    console.log('\n2️⃣ Test récupération classes...');
    const classesResponse = await axios.get(`${BASE_URL}/classes`);
    console.log(`✅ ${classesResponse.data.length} classes récupérées`);
    
    if (classesResponse.data.length > 0) {
      const firstClasse = classesResponse.data[0];
      console.log(`👥 Première classe: "${firstClasse.nom}" (ID: ${firstClasse.id}, Type: ${typeof firstClasse.id})`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter les tests
if (process.argv.includes('--basic')) {
  testBasicData();
} else {
  console.log('⚠️  Pour exécuter les tests complets, configurez d\'abord TEST_CONFIG.adminToken');
  console.log('⚠️  Pour un test simple sans authentification, utilisez: node test-evaluation-creation.js --basic');
  
  if (TEST_CONFIG.adminToken !== 'YOUR_ADMIN_TOKEN') {
    testEvaluationCreation();
  } else {
    testBasicData();
  }
}