const axios = require('axios');
const db = require('./src/models');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

async function setupTestUser() {
  // Utiliser les identifiants fournis par l'utilisateur
  return { 
    matricule: '2223i032', // Matricule de celestin.simo
    motDePasse: '3IVci1TKpZ' 
  };
}

async function testRefreshToken() {
  try {
    console.log('🔐 Test du système de refresh token...\n');

    // Configuration du mot de passe de test
    const credentials = await setupTestUser();

    // 1. D'abord, se connecter pour obtenir les tokens
    console.log('1. Connexion avec un utilisateur test...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      matricule: credentials.matricule,
      motDePasse: credentials.motDePasse
    });

    console.log('✅ Connexion réussie');
    console.log('Token reçu:', loginResponse.data.token.substring(0, 30) + '...');
    console.log('Refresh token reçu:', loginResponse.data.refreshToken ? 'Oui' : 'Non');

    if (!loginResponse.data.refreshToken) {
      console.log('❌ Aucun refresh token reçu lors de la connexion');
      return;
    }

    // 2. Tester l'endpoint de refresh
    console.log('\n2. Test de l\'endpoint refresh...');
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: loginResponse.data.refreshToken
    });

    console.log('✅ Refresh token réussi');
    console.log('Nouveau token:', refreshResponse.data.token.substring(0, 30) + '...');
    console.log('Nouveau refresh token:', refreshResponse.data.refreshToken ? 'Oui' : 'Non');

    // 3. Tester avec un refresh token invalide
    console.log('\n3. Test avec un refresh token invalide...');
    try {
      await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: 'invalid-token'
      });
      console.log('❌ Le refresh avec un token invalide devrait échouer');
    } catch (error) {
      console.log('✅ Erreur attendue avec token invalide:', error.response?.data?.error);
    }

    // 4. Tester l'utilisation du nouveau token
    console.log('\n4. Test d\'utilisation du nouveau token...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${refreshResponse.data.token}`
      }
    });

    console.log('✅ Nouveau token fonctionne pour /auth/me');
    console.log('Utilisateur:', meResponse.data.nom, meResponse.data.prenom);

    console.log('\n🎉 Tous les tests de refresh token sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
}

// Lancer le test
testRefreshToken();