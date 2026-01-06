// Script de test des routes backend
const axios = require('axios');

const BASE_URL = 'https://equizz-backend.onrender.com/api';

// Token de test - remplacez par un vrai token d'admin
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MTI0MDYwLCJleHAiOjE3MzYyMTA0NjB9.example';

async function testRoutes() {
  console.log('🧪 Test des routes backend...\n');

  const routes = [
    { method: 'GET', path: '/evaluations', needsAuth: true },
    { method: 'GET', path: '/dashboard/admin', needsAuth: true },
    { method: 'GET', path: '/notifications', needsAuth: true },
  ];

  for (const route of routes) {
    try {
      console.log(`📡 Test ${route.method} ${route.path}`);
      
      const config = {
        method: route.method.toLowerCase(),
        url: `${BASE_URL}${route.path}`,
        timeout: 10000,
      };

      if (route.needsAuth) {
        config.headers = {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        };
      }

      const response = await axios(config);
      console.log(`✅ ${route.method} ${route.path} - Status: ${response.status}`);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${route.method} ${route.path} - Status: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        console.log(`⏱️ ${route.method} ${route.path} - Timeout`);
      } else {
        console.log(`💥 ${route.method} ${route.path} - Error: ${error.message}`);
      }
    }
    
    console.log(''); // Ligne vide pour la lisibilité
  }
}

// Test simple sans authentification
async function testHealth() {
  try {
    console.log('🏥 Test de santé du serveur...');
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`, { timeout: 5000 });
    console.log('✅ Serveur en ligne');
  } catch (error) {
    console.log('❌ Serveur hors ligne ou problème de connexion');
  }
}

async function main() {
  await testHealth();
  await testRoutes();
}

main().catch(console.error);