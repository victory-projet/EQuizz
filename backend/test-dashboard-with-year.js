const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDashboardWithYear() {
  try {
    // Login as superadmin
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'Admin123!'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');

    // Test dashboard with year parameter
    console.log('📊 Testing /api/dashboard/admin?year=2025-2026...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard/admin?year=2025-2026`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Dashboard with year parameter works!');
    console.log('Dashboard:', JSON.stringify(dashboardResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testDashboardWithYear();
