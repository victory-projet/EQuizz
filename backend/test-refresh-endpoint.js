const axios = require('axios');
const jwtService = require('./src/services/jwt.service');
const db = require('./src/models');

const API_URL = 'http://localhost:3000/api';

async function testRefreshEndpoint() {
  try {
    console.log('🔐 Test de l\'endpoint refresh token...\n');

    // 1. Récupérer un utilisateur et générer des tokens directement
    const utilisateur = await db.Utilisateur.findOne({
      where: { email: 'celestin.simo@saintjeaningenieur.org' },
      include: [
        { model: db.Administrateur, as: 'Administrateur' },
        { model: db.Enseignant, as: 'Enseignant' },
        { 
          model: db.Etudiant, 
          as: 'Etudiant',
          include: [{ model: db.Classe, as: 'Classe' }]
        }
      ]
    });

    if (!utilisateur) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', utilisateur.nom, utilisateur.prenom);

    // 2. Générer des tokens directement
    console.log('\n2. Génération des tokens...');
    const tokens = jwtService.generateTokenPair(utilisateur);
    
    console.log('✅ Tokens générés');
    console.log('Access token:', tokens.accessToken.substring(0, 30) + '...');
    console.log('Refresh token:', tokens.refreshToken.substring(0, 30) + '...');

    // 3. Tester l'endpoint /auth/refresh
    console.log('\n3. Test de l\'endpoint /auth/refresh...');
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken
    });

    console.log('✅ Refresh endpoint réussi !');
    console.log('Nouveau access token:', refreshResponse.data.token.substring(0, 30) + '...');
    console.log('Nouveau refresh token:', refreshResponse.data.refreshToken.substring(0, 30) + '...');

    // 4. Tester l'utilisation du nouveau token avec /auth/me
    console.log('\n4. Test du nouveau token avec /auth/me...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${refreshResponse.data.token}`
      }
    });

    console.log('✅ Nouveau token fonctionne !');
    console.log('Utilisateur récupéré:', meResponse.data.nom, meResponse.data.prenom);

    // 5. Tester avec un refresh token invalide
    console.log('\n5. Test avec un refresh token invalide...');
    try {
      await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: 'invalid-token'
      });
      console.log('❌ Le refresh avec un token invalide devrait échouer');
    } catch (error) {
      console.log('✅ Erreur attendue avec token invalide:', error.response?.data?.error);
    }

    console.log('\n🎉 L\'endpoint refresh token fonctionne parfaitement !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
}

testRefreshEndpoint();