// Test script to check if backend is accessible
const https = require('https');

function testEndpoint(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing backend connectivity...\n');

  const baseUrl = 'https://equizz-backend.onrender.com';
  
  const endpoints = [
    { url: `${baseUrl}/api/init/test`, name: 'Health Check' },
    { url: `${baseUrl}/api/evaluations`, name: 'Evaluations Endpoint' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
      const result = await testEndpoint(endpoint.url);
      console.log(`✅ Status: ${result.status}`);
      console.log(`📄 Response: ${result.data.substring(0, 200)}${result.data.length > 200 ? '...' : ''}\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

runTests().catch(console.error);