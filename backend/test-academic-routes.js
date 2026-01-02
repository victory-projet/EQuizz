// Test script pour vérifier les routes académiques
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration pour les tests (vous devrez ajuster selon votre authentification)
const config = {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE', // Remplacez par un vrai token
    'Content-Type': 'application/json'
  }
};

async function testRoutes() {
  console.log('🧪 Test des routes académiques...\n');

  try {
    // Test des années académiques
    console.log('📅 Test des années académiques...');
    const anneesResponse = await axios.get(`${BASE_URL}/academic/annees-academiques`, config);
    console.log(`✅ Années académiques: ${anneesResponse.data.length} trouvées`);

    if (anneesResponse.data.length > 0) {
      const anneeId = anneesResponse.data[0].id;
      
      // Test des semestres
      console.log('\n📚 Test des semestres...');
      try {
        const semestresResponse = await axios.get(`${BASE_URL}/academic/annees-academiques/${anneeId}/semestres`, config);
        console.log(`✅ Semestres: ${semestresResponse.data.length} trouvés pour l'année ${anneeId}`);
      } catch (error) {
        console.log(`❌ Erreur semestres: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test des cours
    console.log('\n📖 Test des cours...');
    try {
      const coursResponse = await axios.get(`${BASE_URL}/academic/cours`, config);
      console.log(`✅ Cours: ${coursResponse.data.length} trouvés`);
    } catch (error) {
      console.log(`❌ Erreur cours: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test des classes
    console.log('\n🏫 Test des classes...');
    try {
      const classesResponse = await axios.get(`${BASE_URL}/academic/classes`, config);
      console.log(`✅ Classes: ${classesResponse.data.length} trouvées`);
    } catch (error) {
      console.log(`❌ Erreur classes: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test des étudiants
    console.log('\n👨‍🎓 Test des étudiants...');
    try {
      const etudiantsResponse = await axios.get(`${BASE_URL}/academic/etudiants`, config);
      console.log(`✅ Étudiants: ${etudiantsResponse.data.length} trouvés`);
    } catch (error) {
      console.log(`❌ Erreur étudiants: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test des enseignants
    console.log('\n👨‍🏫 Test des enseignants...');
    try {
      const enseignantsResponse = await axios.get(`${BASE_URL}/academic/enseignants`, config);
      console.log(`✅ Enseignants: ${enseignantsResponse.data.length} trouvés`);
    } catch (error) {
      console.log(`❌ Erreur enseignants: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.status === 401) {
      console.log('💡 Conseil: Vérifiez votre token d\'authentification dans le script');
    }
  }

  console.log('\n🏁 Test terminé');
}

// Exécuter les tests
testRoutes();