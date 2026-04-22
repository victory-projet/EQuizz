const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testServerHealth() {
  try {
    console.log('🔍 Testing server health...\n');

    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test admin login
    console.log('🔐 Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'jean.directeur@saintjeaningenieur.org',
      motDePasse: 'Admin123!'
    });

    console.log('✅ Login successful!');
    console.log('Response data:', JSON.stringify(loginResponse.data, null, 2));
    
    const user = loginResponse.data.utilisateur || loginResponse.data.user;
    const token = loginResponse.data.token;
    
    if (user) {
      console.log('\nUser:', {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        ecole: user.ecole
      });
      console.log('Token:', token.substring(0, 50) + '...');
      console.log('');

      // Test dashboard with admin token
      console.log('📊 Testing dashboard endpoint...');
      const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Dashboard loaded successfully!');
      console.log('Stats:', dashboardResponse.data);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testServerHealth();
