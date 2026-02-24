// Script pour tester l'endpoint des activités récentes
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testActivitiesEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint des activités récentes\n');

    // 1. Connexion en tant que super-admin
    console.log('1️⃣ Connexion en tant que superadministrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // 2. Appeler l'endpoint des activités récentes
    console.log('2️⃣ Appel de l\'endpoint /api/dashboard/activities/recent...');
    const activitiesResponse = await axios.get(`${API_URL}/dashboard/activities/recent`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 10 }
    });

    console.log('✅ Activités chargées avec succès!');
    console.log(`   Nombre d'activités: ${activitiesResponse.data.length}`);
    
    if (activitiesResponse.data.length > 0) {
      console.log('\n📋 Première activité:');
      console.log(JSON.stringify(activitiesResponse.data[0], null, 2));
    } else {
      console.log('\n⚠️  Aucune activité récente trouvée');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data.error);
      if (error.response.data.stack) {
        console.error('\n   Stack:', error.response.data.stack);
      }
    } else {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

testActivitiesEndpoint();
