const axios = require('axios');

async function testAcademicEndpoints() {
  try {
    console.log('🔍 Test des endpoints académiques...\n');

    // 1. Authentification
    console.log('1️⃣ Authentification...');
    const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    const token = authResponse.data.token;
    console.log('✅ Authentification réussie\n');

    // 2. Test des années académiques
    console.log('2️⃣ Test /academic/annees-academiques...');
    try {
      const anneesResponse = await axios.get('http://localhost:3000/api/academic/annees-academiques', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📊 Réponse années académiques:', JSON.stringify(anneesResponse.data, null, 2));
      console.log('- Type:', typeof anneesResponse.data);
      console.log('- Clés:', Object.keys(anneesResponse.data));
      
      if (anneesResponse.data.data) {
        console.log('- data est un tableau:', Array.isArray(anneesResponse.data.data));
      }
    } catch (error) {
      console.log('❌ Erreur années académiques:', error.response?.status, error.response?.data);
    }

    // 3. Test des classes
    console.log('\n3️⃣ Test /academic/classes...');
    try {
      const classesResponse = await axios.get('http://localhost:3000/api/academic/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📊 Réponse classes:', JSON.stringify(classesResponse.data, null, 2));
      console.log('- Type:', typeof classesResponse.data);
      console.log('- Clés:', Object.keys(classesResponse.data));
      
      if (classesResponse.data.classes) {
        console.log('- classes est un tableau:', Array.isArray(classesResponse.data.classes));
      }
    } catch (error) {
      console.log('❌ Erreur classes:', error.response?.status, error.response?.data);
    }

    // 4. Test des cours
    console.log('\n4️⃣ Test /cours...');
    try {
      const coursResponse = await axios.get('http://localhost:3000/api/cours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📊 Réponse cours:', JSON.stringify(coursResponse.data, null, 2));
      console.log('- Type:', typeof coursResponse.data);
      console.log('- Clés:', Object.keys(coursResponse.data));
      
      if (coursResponse.data.cours) {
        console.log('- cours est un tableau:', Array.isArray(coursResponse.data.cours));
      }
    } catch (error) {
      console.log('❌ Erreur cours:', error.response?.status, error.response?.data);
    }

    console.log('\n✅ Tests terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

testAcademicEndpoints();