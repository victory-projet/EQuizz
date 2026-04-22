const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUsersStructure() {
  try {
    // Login as superadmin
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'Admin123!'
    });

    const token = loginResponse.data.token;

    // Get users
    const usersResponse = await axios.get(`${BASE_URL}/api/utilisateurs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Structure des utilisateurs retournés par l\'API:');
    console.log(JSON.stringify(usersResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUsersStructure();
