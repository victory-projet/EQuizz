// Script pour tester l'endpoint de création d'évaluation
require('dotenv').config();
const axios = require('axios');

async function testEvaluationEndpoint() {
  try {
    console.log('🔍 Test de l\'endpoint POST /api/evaluations\n');

    // 1. Se connecter pour obtenir un token
    console.log('1️⃣ Connexion en tant qu\'admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@saintjeaningenieur.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenu:', token.substring(0, 50) + '...\n');

    // 2. Récupérer les classes et cours disponibles
    console.log('2️⃣ Récupération des classes...');
    const classesResponse = await axios.get('http://localhost:3000/api/academic/classes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const classes = classesResponse.data;
    console.log(`✅ ${classes.length} classes trouvées`);
    if (classes.length > 0) {
      console.log('   Première classe:', classes[0].nom, '(ID:', classes[0].id, ')');
    }

    console.log('\n3️⃣ Récupération des cours...');
    const coursResponse = await axios.get('http://localhost:3000/api/academic/cours', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cours = coursResponse.data;
    console.log(`✅ ${cours.length} cours trouvés`);
    if (cours.length > 0) {
      console.log('   Premier cours:', cours[0].nom, '(ID:', cours[0].id, ')');
    }

    if (classes.length === 0 || cours.length === 0) {
      console.log('\n⚠️ Pas assez de données pour créer une évaluation');
      return;
    }

    // 3. Créer une évaluation de test
    console.log('\n4️⃣ Création d\'une évaluation de test...');
    const evaluationData = {
      titre: 'Test Évaluation - ' + new Date().toISOString(),
      description: 'Évaluation créée par le script de test',
      dateDebut: new Date().toISOString(),
      dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cours_id: cours[0].id,
      classeIds: [classes[0].id],
      statut: 'BROUILLON'
    };

    console.log('📤 Données envoyées:', JSON.stringify(evaluationData, null, 2));

    const createResponse = await axios.post(
      'http://localhost:3000/api/evaluations',
      evaluationData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Évaluation créée avec succès!');
    console.log('📋 Réponse:', JSON.stringify(createResponse.data, null, 2));

    // 4. Vérifier que l'évaluation existe
    console.log('\n5️⃣ Vérification de l\'évaluation créée...');
    const getResponse = await axios.get(
      `http://localhost:3000/api/evaluations/${createResponse.data.id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Évaluation récupérée:', getResponse.data.titre);

    console.log('\n✅ Tous les tests ont réussi!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testEvaluationEndpoint();
