// Simple test for activities endpoint
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function test() {
  try {
    // Login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    // Get activities
    const activitiesRes = await axios.get(`${API_URL}/dashboard/activities/recent`, {
      headers: { Authorization: `Bearer ${loginRes.data.token}` },
      params: { limit: 10 }
    });

    console.log('✅ Success! Activities:', activitiesRes.data.length);
    if (activitiesRes.data.length > 0) {
      console.log('First activity:', JSON.stringify(activitiesRes.data[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Wait 3 seconds for server to start
setTimeout(test, 3000);
