// Test de l'API pour récupérer les questions
const axios = require('axios');

async function testQuestionsAPI() {
  try {
    const quizzId = '174497c1-395d-4954-9126-1dbdec5d8f1f'; // ID du quizz créé
    const url = `http://localhost:3000/api/evaluations/quizz/${quizzId}/questions`;
    
    console.log('🔍 Test de l\'API:', url);
    
    // Note: Cette requête échouera car elle nécessite une authentification
    // Mais nous verrons si la route existe
    const response = await axios.get(url);
    console.log('✅ Réponse:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('📡 Statut HTTP:', error.response.status);
      console.log('📡 Message:', error.response.data?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.log('✅ Route trouvée mais authentification requise (normal)');
      } else if (error.response.status === 404) {
        console.log('❌ Route non trouvée');
      }
    } else {
      console.error('❌ Erreur réseau:', error.message);
    }
  }
}

testQuestionsAPI();