// Test des endpoints dashboard avec authentification
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000';

// Créer un token JWT pour l'admin
function createAdminToken() {
  const payload = {
    id: '98ee728f-a1ef-458d-981d-ca4b697237fe',
    email: 'super.admin@saintjeaningenieur.org',
    role: 'admin'  // En minuscules comme attendu par le middleware
  };
  
  // Utiliser la même clé secrète que dans l'application
  const secret = 'VOTRE_CLE_SECRETE_TRES_LONGUE_ET_ALEATOIRE';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

async function testDashboardEndpoints() {
  try {
    const token = createAdminToken();
    console.log('🔑 Token créé pour les tests');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Health check
    console.log('\n1. Test de l\'endpoint health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/dashboard/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: Alerts (celui qui causait l'erreur)
    console.log('\n2. Test de l\'endpoint alerts...');
    const alertsResponse = await axios.get(`${BASE_URL}/api/dashboard/alerts`, { headers });
    console.log('✅ Alerts récupérées:', alertsResponse.data.length, 'alertes');
    if (alertsResponse.data.length > 0) {
      console.log('   Première alerte:', alertsResponse.data[0].title);
    }

    // Test 3: Recent activities (celui qui causait l'erreur)
    console.log('\n3. Test de l\'endpoint recent activities...');
    const activitiesResponse = await axios.get(`${BASE_URL}/api/dashboard/activities/recent`, { headers });
    console.log('✅ Activités récupérées:', activitiesResponse.data.length, 'activités');
    if (activitiesResponse.data.length > 0) {
      console.log('   Première activité:', activitiesResponse.data[0].title);
    }

    // Test 4: Metrics
    console.log('\n4. Test de l\'endpoint metrics...');
    const metricsResponse = await axios.get(`${BASE_URL}/api/dashboard/metrics`, { headers });
    console.log('✅ Métriques récupérées:', Object.keys(metricsResponse.data).length, 'catégories');

    console.log('\n🎉 Tous les endpoints dashboard fonctionnent correctement !');
    console.log('✅ L\'erreur "Unknown column \'Cour.enseignant_id\'" est résolue.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testDashboardEndpoints();