// Test de tous les endpoints critiques
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

const endpoints = [
  // Endpoints publics
  { method: 'GET', url: '/dashboard/health', auth: false },
  { method: 'GET', url: '/academic/classes/public', auth: false },
  { method: 'POST', url: '/auth/claim-account', auth: false },
  { method: 'POST', url: '/auth/login', auth: false },
  { method: 'POST', url: '/auth/forgot-password', auth: false },
  
  // Endpoints protégés par module (devraient retourner 401 ou 403)
  // Auth & Profile
  { method: 'GET', url: '/auth/me', auth: true },
  { method: 'PUT', url: '/auth/profile', auth: true },
  
  // Académique
  { method: 'GET', url: '/academic/ecoles', auth: true },
  { method: 'GET', url: '/academic/annees-academiques', auth: true },
  { method: 'GET', url: '/academic/cours', auth: true },
  { method: 'GET', url: '/academic/classes', auth: true },
  { method: 'GET', url: '/academic/etudiants', auth: true },
  { method: 'GET', url: '/academic/enseignants', auth: true },

  // Évaluations & Questions
  { method: 'GET', url: '/evaluations', auth: true },
  { method: 'POST', url: '/evaluations', auth: true },
  { method: 'GET', url: '/questions', auth: true },

  // Étudiant
  { method: 'GET', url: '/student/evaluations/available', auth: true },
  { method: 'GET', url: '/student/results', auth: true },

  // Notifications
  { method: 'GET', url: '/notifications/summary', auth: true },
  { method: 'GET', url: '/notifications', auth: true },
  { method: 'GET', url: '/push-notifications/config', auth: true },

  // Dashboard & Rapports
  { method: 'GET', url: '/dashboard/admin', auth: true },
  { method: 'GET', url: '/dashboard/metrics', auth: true },
  { method: 'GET', url: '/reports/global', auth: true },

  // Utilisateurs & Data
  { method: 'GET', url: '/utilisateurs', auth: true },
  { method: 'GET', url: '/data/export', auth: true },
];

async function testEndpoint(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 5000
    };

    if (endpoint.auth) {
      config.headers = { Authorization: 'Bearer fake-token' };
    }

    const response = await axios(config);
    console.log(`✅ ${endpoint.method} ${endpoint.url} - ${response.status}`);
    return { success: true, status: response.status };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (endpoint.auth && (status === 401 || status === 403)) {
        console.log(`✅ ${endpoint.method} ${endpoint.url} - ${status} (Auth required - OK)`);
        return { success: true, status };
      } else if (status === 404) {
        console.log(`❌ ${endpoint.method} ${endpoint.url} - 404 NOT FOUND`);
        return { success: false, status: 404 };
      } else {
        console.log(`⚠️  ${endpoint.method} ${endpoint.url} - ${status}`);
        return { success: true, status };
      }
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.url} - Connection Error`);
      return { success: false, error: 'Connection Error' };
    }
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing all critical endpoints...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ ...endpoint, ...result });
  }
  
  console.log('\n📊 Summary:');
  const failed = results.filter(r => !r.success);
  const notFound = results.filter(r => r.status === 404);
  
  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Successful: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`404 Not Found: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log('\n❌ Endpoints returning 404:');
    notFound.forEach(endpoint => {
      console.log(`   ${endpoint.method} ${endpoint.url}`);
    });
  }
  
  if (failed.length === 0) {
    console.log('\n🎉 All endpoints are working correctly!');
  }
}

// Exécuter les tests
testAllEndpoints().catch(console.error);