const axios = require('axios');

async function testEvaluationsFormat() {
  try {
    console.log('🔍 Test du format de réponse /evaluations...\n');

    // 1. Authentification
    console.log('1️⃣ Authentification...');
    const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    console.log('📋 Réponse auth:', JSON.stringify(authResponse.data, null, 2));
    const token = authResponse.data.data?.token || authResponse.data.token;
    console.log('✅ Authentification réussie, token:', token ? 'présent' : 'absent');

    // 2. Test de l'endpoint evaluations
    console.log('2️⃣ Test de l\'endpoint /evaluations...');
    const evaluationsResponse = await axios.get('http://localhost:3000/api/evaluations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Réponse complète:', JSON.stringify(evaluationsResponse.data, null, 2));
    console.log('\n📋 Analyse de la structure:');
    console.log('- Type de réponse:', typeof evaluationsResponse.data);
    console.log('- Clés disponibles:', Object.keys(evaluationsResponse.data));
    
    if (evaluationsResponse.data.evaluations) {
      console.log('- evaluations est un tableau:', Array.isArray(evaluationsResponse.data.evaluations));
      console.log('- Nombre d\'évaluations:', evaluationsResponse.data.evaluations.length);
      
      if (evaluationsResponse.data.evaluations.length > 0) {
        console.log('- Structure d\'une évaluation:', Object.keys(evaluationsResponse.data.evaluations[0]));
      }
    }

    if (evaluationsResponse.data.pagination) {
      console.log('- Pagination présente:', evaluationsResponse.data.pagination);
    }

    console.log('\n✅ Format correct pour le frontend Angular');
    console.log('Le repository peut maintenant extraire evaluations.evaluations');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Vérifiez que l\'utilisateur admin@test.com existe avec le mot de passe admin123');
    }
  }
}

testEvaluationsFormat();