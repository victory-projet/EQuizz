// Script pour tester la connexion de l'admin via l'API
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testAdminLoginAPI() {
  try {
    console.log('🧪 Test de connexion de l\'administrateur via l\'API\n');

    const credentials = {
      email: 'admin.sji@saintjeaningenieur.org',
      motDePasse: 'admin123'
    };

    console.log('📤 Envoi de la requête de connexion:');
    console.log('   URL:', `${API_URL}/auth/login`);
    console.log('   Email:', credentials.email);
    console.log('   Mot de passe:', credentials.motDePasse);
    console.log('');

    const response = await axios.post(`${API_URL}/auth/login`, credentials);

    console.log('✅ Connexion réussie!\n');
    console.log('📋 Réponse:');
    console.log('   Token:', response.data.token ? 'Présent' : 'Absent');
    console.log('   Utilisateur:', response.data.utilisateur ? response.data.utilisateur.email : 'Absent');
    console.log('   Rôle:', response.data.utilisateur ? response.data.utilisateur.role : 'N/A');
    console.log('');
    console.log('🎉 L\'administrateur peut se connecter avec succès!');
    console.log('');
    console.log('📋 Identifiants à utiliser dans le frontend:');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Mot de passe: ${credentials.motDePasse}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la connexion:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data.error);
      console.error('   Données:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   ', error.message);
    }
    
    console.log('\n💡 Vérifications à faire:');
    console.log('   1. Le serveur backend est-il démarré? (npm start dans backend/)');
    console.log('   2. L\'email est-il correct?');
    console.log('   3. Le mot de passe est-il correct?');
    
    process.exit(1);
  }
}

testAdminLoginAPI();
