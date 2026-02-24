// Script pour tester la réponse de l'API pour un admin
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testAdminResponse() {
  try {
    console.log('🧪 Test de la réponse API pour l\'administrateur\n');

    // 1. Connexion
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;

    // 2. Récupérer tous les utilisateurs
    const usersResponse = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    const admin = users.find(u => u.role === 'ADMIN');

    if (admin) {
      console.log('✅ Administrateur trouvé\n');
      console.log('📋 Réponse complète:');
      console.log(JSON.stringify(admin, null, 2));
    } else {
      console.log('❌ Aucun administrateur trouvé');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAdminResponse();
