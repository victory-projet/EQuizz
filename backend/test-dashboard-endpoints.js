const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDashboardEndpoints() {
  try {
    console.log('🔐 Login as superadmin...\n');
    
    // Login as superadmin
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'Admin123!'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');

    // Test dashboard admin endpoint
    console.log('📊 Testing /api/dashboard/admin endpoint...');
    try {
      const adminResponse = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Admin dashboard endpoint works!');
      console.log('Dashboard:', JSON.stringify(adminResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Admin dashboard endpoint error:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.error('Error details:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n📈 Testing /api/dashboard/metrics endpoint...');
    try {
      const metricsResponse = await axios.get(`${BASE_URL}/api/dashboard/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Metrics endpoint works!');
      console.log('Metrics:', JSON.stringify(metricsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Metrics endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🔔 Testing /api/dashboard/alerts endpoint...');
    try {
      const alertsResponse = await axios.get(`${BASE_URL}/api/dashboard/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Alerts endpoint works!');
      console.log('Alerts:', JSON.stringify(alertsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Alerts endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n📋 Testing /api/dashboard/activities/recent endpoint...');
    try {
      const activitiesResponse = await axios.get(`${BASE_URL}/api/dashboard/activities/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Recent activities endpoint works!');
      console.log('Activities:', JSON.stringify(activitiesResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Recent activities endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testDashboardEndpoints();
