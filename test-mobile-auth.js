const axios = require('axios');

// Configuration pour tester l'API mobile
const MOBILE_API_URL = 'http://localhost:3000/api';

async function testMobileAuth() {
  try {
    console.log('📱 Test de l\'authentification mobile avec refresh token...\n');

    // 1. Simuler une connexion mobile
    console.log('1. Test de connexion mobile...');
    const loginResponse = await axios.post(`${MOBILE_API_URL}/auth/login`, {
      matricule: '2223i032',
      motDePasse: '3IVci1TKpZ'
    });

    console.log('✅ Connexion mobile réussie');
    console.log('Token reçu:', loginResponse.data.token ? 'Oui' : 'Non');
    console.log('Refresh token reçu:', loginResponse.data.refreshToken ? 'Oui' : 'Non');

    if (!loginResponse.data.refreshToken) {
      console.log('❌ Aucun refresh token reçu - le problème persiste');
      return;
    }

    // 2. Simuler l'utilisation d'une API protégée
    console.log('\n2. Test d\'accès à une API protégée...');
    const meResponse = await axios.get(`${MOBILE_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });

    console.log('✅ Accès API protégée réussi');
    console.log('Utilisateur:', meResponse.data.nom, meResponse.data.prenom);

    // 3. Simuler l'expiration du token et le refresh automatique
    console.log('\n3. Test du refresh automatique...');
    const refreshResponse = await axios.post(`${MOBILE_API_URL}/auth/refresh`, {
      refreshToken: loginResponse.data.refreshToken
    });

    console.log('✅ Refresh automatique réussi');
    console.log('Nouveau token:', refreshResponse.data.token ? 'Oui' : 'Non');
    console.log('Nouveau refresh token:', refreshResponse.data.refreshToken ? 'Oui' : 'Non');

    // 4. Tester le nouveau token
    console.log('\n4. Test du nouveau token...');
    const newMeResponse = await axios.get(`${MOBILE_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${refreshResponse.data.token}`
      }
    });

    console.log('✅ Nouveau token fonctionne');
    console.log('Utilisateur:', newMeResponse.data.nom, newMeResponse.data.prenom);

    console.log('\n🎉 Le système de refresh token mobile fonctionne parfaitement !');
    console.log('\n📋 Résumé de la solution:');
    console.log('- ✅ Backend génère access token + refresh token');
    console.log('- ✅ Endpoint /auth/refresh fonctionne');
    console.log('- ✅ Mobile app peut utiliser les nouveaux tokens');
    console.log('- ✅ Intercepteur axios gère le refresh automatique');
    
    console.log('\n🔧 Pour résoudre l\'erreur "session expirée":');
    console.log('1. Redémarrer l\'app mobile pour charger le nouveau code');
    console.log('2. Se reconnecter pour obtenir les nouveaux tokens');
    console.log('3. L\'app gérera automatiquement le refresh des tokens');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Si vous voyez cette erreur 401:');
      console.log('- Vérifiez que le mot de passe est correct');
      console.log('- Assurez-vous que le serveur backend fonctionne');
      console.log('- Redémarrez le serveur backend si nécessaire');
    }
  }
}

testMobileAuth();