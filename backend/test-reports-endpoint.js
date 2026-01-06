const axios = require('axios');

async function testReportsEndpoint() {
  try {
    console.log('🔍 Test de l\'endpoint /reports/filter-options...\n');

    // 1. Authentification
    console.log('1️⃣ Authentification...');
    const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    const token = authResponse.data.token;
    console.log('✅ Authentification réussie\n');

    // 2. Test de l'endpoint reports/filter-options
    console.log('2️⃣ Test /reports/filter-options...');
    try {
      const response = await axios.get('http://localhost:3000/api/reports/filter-options', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Réponse réussie:', response.status);
      console.log('📊 Données:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Erreur:', error.response?.status, error.response?.statusText);
      console.log('📋 Détails:', error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('💡 L\'endpoint n\'existe pas - il faut le créer');
      } else if (error.response?.status === 500) {
        console.log('💡 Erreur serveur - il y a un problème dans le code backend');
      }
    }

    // 3. Vérifier les autres endpoints de reports
    console.log('\n3️⃣ Test des autres endpoints reports...');
    
    const reportEndpoints = [
      '/reports',
      '/reports/evaluations',
      '/reports/advanced'
    ];

    for (const endpoint of reportEndpoints) {
      try {
        const response = await axios.get(`http://localhost:3000/api${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testReportsEndpoint();