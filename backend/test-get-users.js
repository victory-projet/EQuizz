// Test pour voir tous les utilisateurs
require('dotenv').config();
const axios = require('axios');

async function testGetUsers() {
  try {
    // 1. Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const { token } = loginResponse.data;

    // 2. Get all users
    const usersResponse = await axios.get('http://localhost:3000/api/utilisateurs', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    console.log(`Total utilisateurs: ${users.length}\n`);

    // Trouver le superadmin
    const superadmin = users.find(u => u.email === 'super.admin@saintjeaningenieur.org');
    
    if (superadmin) {
      console.log('✅ Superadmin trouvé:');
      console.log(JSON.stringify(superadmin, null, 2));
    } else {
      console.log('❌ Superadmin NON trouvé dans la liste');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testGetUsers();
