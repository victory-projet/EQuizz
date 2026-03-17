// Script pour tester le flux de réinitialisation de mot de passe
require('dotenv').config();
const axios = require('axios');

async function testPasswordReset() {
  try {
    console.log('🔍 Test du flux de réinitialisation de mot de passe\n');

    const testEmail = 'super.admin@saintjeaningenieur.org';

    // 1. Demander une réinitialisation de mot de passe
    console.log('1️⃣ Demande de réinitialisation pour:', testEmail);
    const forgotResponse = await axios.post('http://localhost:3000/api/auth/forgot-password', {
      email: testEmail
    });

    console.log('✅ Réponse:', forgotResponse.data);

    if (forgotResponse.data.token) {
      const token = forgotResponse.data.token;
      console.log('\n📧 Token généré:', token);

      // 2. Valider le token
      console.log('\n2️⃣ Validation du token...');
      const validateResponse = await axios.get(
        `http://localhost:3000/api/auth/validate-reset-token/${token}`
      );

      console.log('✅ Token valide:', validateResponse.data);

      // 3. Réinitialiser le mot de passe
      console.log('\n3️⃣ Réinitialisation du mot de passe...');
      const resetResponse = await axios.post('http://localhost:3000/api/auth/reset-password', {
        token: token,
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      console.log('✅ Mot de passe réinitialisé:', resetResponse.data);

      // 4. Tester la connexion avec le nouveau mot de passe
      console.log('\n4️⃣ Test de connexion avec le nouveau mot de passe...');
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: testEmail,
        motDePasse: 'NewPassword123!'
      });

      console.log('✅ Connexion réussie avec le nouveau mot de passe!');
      console.log('   Token:', loginResponse.data.token.substring(0, 50) + '...');

      // 5. Remettre l'ancien mot de passe
      console.log('\n5️⃣ Remise de l\'ancien mot de passe...');
      const resetBackResponse = await axios.post('http://localhost:3000/api/auth/forgot-password', {
        email: testEmail
      });

      if (resetBackResponse.data.token) {
        await axios.post('http://localhost:3000/api/auth/reset-password', {
          token: resetBackResponse.data.token,
          newPassword: 'admin123',
          confirmPassword: 'admin123'
        });
        console.log('✅ Mot de passe remis à "admin123"');
      }

      console.log('\n✅ Tous les tests ont réussi!');
      console.log('\n📋 Résumé:');
      console.log('   ✅ Demande de réinitialisation');
      console.log('   ✅ Validation du token');
      console.log('   ✅ Réinitialisation du mot de passe');
      console.log('   ✅ Connexion avec le nouveau mot de passe');
      console.log('   ✅ Restauration de l\'ancien mot de passe');

    } else {
      console.log('\n⚠️ Aucun token retourné (mode production - email envoyé)');
      console.log('   En production, vérifiez votre boîte email');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testPasswordReset();
