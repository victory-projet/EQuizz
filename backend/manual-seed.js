const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function manualSeed() {
  try {
    console.log('🌱 Manually seeding database...\n');

    const response = await axios.post(`${BASE_URL}/api/init/seed`);

    console.log('✅ Seeding successful!');
    console.log('\nResult:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Error:', error.response.data.error);
      if (error.response.data.stack) {
        console.error('\nStack:', error.response.data.stack);
      }
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

manualSeed();
