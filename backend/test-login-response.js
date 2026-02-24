// Test simple pour voir la réponse du login
require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    console.log('Réponse complète du login:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
  }
}

testLogin();
