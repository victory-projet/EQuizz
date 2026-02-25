// Script pour tester l'endpoint des étudiants
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testStudentsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint des étudiants\n');

    // 1. Connexion en tant qu'admin
    console.log('1️⃣ Connexion en tant qu\'administrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin.sji@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.utilisateur;
    console.log('✅ Connexion réussie');
    console.log('   Rôle:', user.role);
    console.log('   Email:', user.email);
    console.log('');

    // 2. Appeler l'endpoint des étudiants
    console.log('2️⃣ Appel de l\'endpoint /api/academic/etudiants...');
    const studentsResponse = await axios.get(`${API_URL}/academic/etudiants`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Étudiants chargés avec succès!');
    console.log(`   Nombre d'étudiants: ${studentsResponse.data.length}`);
    
    if (studentsResponse.data.length > 0) {
      console.log('   Premier étudiant:', studentsResponse.data[0].nom, studentsResponse.data[0].prenom);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data.error);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

testStudentsEndpoint();
