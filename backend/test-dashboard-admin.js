// Script pour tester l'endpoint dashboard admin
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testDashboardAdmin() {
  try {
    console.log('🧪 Test de l\'endpoint dashboard admin\n');

    // 1. Connexion en tant qu'admin
    console.log('1️⃣ Connexion en tant qu\'administrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin.sji@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // 2. Appeler l'endpoint dashboard
    console.log('2️⃣ Appel de l\'endpoint /api/dashboard/admin...');
    const dashboardResponse = await axios.get(`${API_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Dashboard chargé avec succès!\n');
    console.log('📊 Données du dashboard:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data.error);
      console.error('   Stack:', error.response.data.stack);
    } else {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

testDashboardAdmin();
