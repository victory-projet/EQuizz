// Test de l'endpoint des écoles
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testSchoolsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint des écoles\n');

    // 1. Connexion en tant que super-admin
    console.log('1️⃣ Connexion en tant que superadministrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // 2. Appeler l'endpoint des écoles
    console.log('2️⃣ Appel de l\'endpoint /api/academic/ecoles...');
    const schoolsResponse = await axios.get(`${API_URL}/academic/ecoles`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Écoles chargées avec succès!');
    console.log(`   Nombre d'écoles: ${schoolsResponse.data.length || schoolsResponse.data.data?.length || 0}`);
    
    if (schoolsResponse.data.length > 0 || schoolsResponse.data.data?.length > 0) {
      const schools = schoolsResponse.data.data || schoolsResponse.data;
      console.log('\n📋 Liste des écoles:');
      schools.forEach((school, index) => {
        console.log(`   ${index + 1}. ${school.nom} (ID: ${school.id}, Active: ${school.estActive !== false ? 'Oui' : 'Non'})`);
      });
    } else {
      console.log('\n⚠️  Aucune école trouvée');
      console.log('   Réponse complète:', JSON.stringify(schoolsResponse.data, null, 2));
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

testSchoolsEndpoint();
