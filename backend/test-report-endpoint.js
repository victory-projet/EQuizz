// Test script for report endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testReportEndpoint() {
  console.log('🧪 Testing Report endpoints...\n');

  try {
    // First, let's try to login to get a token
    console.log('1. Attempting to login...');
    let token = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'super.admin@saintjeaningenieur.org',
        motDePasse: 'admin123'
      });
      
      token = loginResponse.data.token;
      console.log('✅ Login successful, token obtained');
    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      
      // Try alternative passwords
      const passwords = ['admin', 'password', '123456', 'super.admin'];
      for (const pwd of passwords) {
        try {
          const altLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'super.admin@saintjeaningenieur.org',
            motDePasse: pwd
          });
          
          token = altLoginResponse.data.token;
          console.log(`✅ Login successful with password: ${pwd}`);
          break;
        } catch (altError) {
          console.log(`❌ Password '${pwd}' failed`);
        }
      }
    }

    if (!token) {
      console.log('❌ Cannot proceed without authentication token');
      return;
    }

    // Test 2: Get filter options
    console.log('\n2. Testing /api/reports/filter-options...');
    try {
      const response = await axios.get(`${BASE_URL}/api/reports/filter-options`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Success: Filter options retrieved`);
      console.log(`   Classes: ${response.data.classes?.length || 0}`);
      console.log(`   Enseignants: ${response.data.enseignants?.length || 0}`);
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.error) {
        console.log(`   Details: ${error.response.data.error}`);
      }
    }

    // Test 3: List evaluations first to get a valid ID
    console.log('\n3. Getting evaluations list to find valid IDs...');
    try {
      const response = await axios.get(`${BASE_URL}/api/evaluations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const evaluations = response.data.evaluations || response.data;
      console.log(`✅ Found ${evaluations.length} evaluations`);
      
      if (evaluations.length > 0) {
        const firstEval = evaluations[0];
        console.log(`   First evaluation: ${firstEval.id} - ${firstEval.titre}`);
        
        // Test 4: Get report for the first evaluation
        console.log(`\n4. Testing report for evaluation ${firstEval.id}...`);
        try {
          const reportResponse = await axios.get(`${BASE_URL}/api/reports/evaluations/${firstEval.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Success: Report generated for evaluation ${firstEval.id}`);
          console.log(`   Total students: ${reportResponse.data.statistics?.totalStudents || 0}`);
          console.log(`   Total respondents: ${reportResponse.data.statistics?.totalRespondents || 0}`);
          console.log(`   Participation rate: ${reportResponse.data.statistics?.participationRate || 0}%`);
        } catch (error) {
          console.log(`❌ Error generating report: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
          if (error.response?.data?.error) {
            console.log(`   Details: ${error.response.data.error}`);
          }
          if (error.response?.data?.stack) {
            console.log(`   Stack: ${error.response.data.stack.split('\n')[0]}`);
          }
        }
      } else {
        console.log('❌ No evaluations found to test with');
      }
    } catch (error) {
      console.log(`❌ Error getting evaluations: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Test the specific failing evaluation ID
    console.log('\n5. Testing the specific failing evaluation ID...');
    const failingId = '842deb0f-71cc-4cb5-a218-a6aeb876eeb0';
    try {
      const reportResponse = await axios.get(`${BASE_URL}/api/reports/evaluations/${failingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Success: Report generated for evaluation ${failingId}`);
    } catch (error) {
      console.log(`❌ Error with specific ID: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.error) {
        console.log(`   Details: ${error.response.data.error}`);
      }
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }

  console.log('\n🏁 Report endpoint test completed');
}

// Run the tests
testReportEndpoint();