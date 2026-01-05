// Script de test pour les questions
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configuration pour les tests
let authToken = '';
let quizzId = '';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'super.admin@saintjeaningenieur.org',
      motDePasse: 'Admin123!'
    });
    
    authToken = response.data.token;
    console.log('✅ Connexion réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return false;
  }
}

async function getEvaluations() {
  try {
    const response = await axios.get(`${BASE_URL}/evaluations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.length > 0) {
      const evaluation = response.data[0];
      quizzId = evaluation.Quizz?.id;
      console.log('✅ Évaluations récupérées, Quiz ID:', quizzId);
      return true;
    } else {
      console.log('⚠️ Aucune évaluation trouvée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des évaluations:', error.response?.data || error.message);
    return false;
  }
}

async function createQuestion() {
  if (!quizzId) {
    console.log('❌ Pas de Quiz ID disponible');
    return false;
  }

  try {
    const questionData = {
      enonce: "Quelle est la capitale de la France ?",
      typeQuestion: "CHOIX_MULTIPLE",
      options: [
        { texte: "Paris", estCorrecte: true },
        { texte: "Lyon", estCorrecte: false },
        { texte: "Marseille", estCorrecte: false },
        { texte: "Toulouse", estCorrecte: false }
      ]
    };

    const response = await axios.post(`${BASE_URL}/evaluations/quizz/${quizzId}/questions`, questionData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Question créée:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la question:', error.response?.data || error.message);
    return false;
  }
}

async function getQuestions() {
  if (!quizzId) {
    console.log('❌ Pas de Quiz ID disponible');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/quizz/${quizzId}/questions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Questions récupérées:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des questions:', error.response?.data || error.message);
    return false;
  }
}

async function testQuestions() {
  console.log('🚀 Test des fonctionnalités de questions...\n');

  // 1. Connexion
  const loginSuccess = await login();
  if (!loginSuccess) return;

  // 2. Récupérer les évaluations
  const evalSuccess = await getEvaluations();
  if (!evalSuccess) return;

  // 3. Créer une question
  const questionId = await createQuestion();
  if (!questionId) return;

  // 4. Récupérer les questions
  await getQuestions();

  console.log('\n✅ Tests terminés avec succès !');
}

// Exécuter les tests
testQuestions().catch(console.error);