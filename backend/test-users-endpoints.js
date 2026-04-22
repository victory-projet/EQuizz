const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUsersEndpoints() {
  try {
    console.log('🔐 Login as superadmin...\n');
    
    // Login as superadmin
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'Admin123!'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');

    // Test utilisateurs endpoint
    console.log('📋 Testing /api/utilisateurs endpoint...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/utilisateurs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Users endpoint works!');
      console.log(`Found ${usersResponse.data.length} users`);
      console.log('Users:', JSON.stringify(usersResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Users endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n📚 Testing /api/academic/etudiants endpoint...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/api/academic/etudiants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Students endpoint works!');
      console.log(`Found ${studentsResponse.data.length || studentsResponse.data.count || 0} students`);
      console.log('Students:', JSON.stringify(studentsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Students endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n👨‍🏫 Testing /api/academic/enseignants endpoint...');
    try {
      const teachersResponse = await axios.get(`${BASE_URL}/api/academic/enseignants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Teachers endpoint works!');
      console.log(`Found ${teachersResponse.data.length || teachersResponse.data.count || 0} teachers`);
      console.log('Teachers:', JSON.stringify(teachersResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Teachers endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testUsersEndpoints();
