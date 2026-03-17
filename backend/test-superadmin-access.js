// Script de test pour vérifier l'accès du superadministrateur
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testSuperadminAccess() {
  try {
    console.log('🧪 Test d\'accès du superadministrateur\n');

    // 1. Connexion en tant que superadmin
    console.log('1️⃣ Connexion en tant que superadministrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.utilisateur;
    console.log('✅ Connexion réussie');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rôle: ${user.role || 'Non défini'}`);

    // 2. Tester l'accès au profil
    console.log('\n2️⃣ Test d\'accès au profil...');
    const profileResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Accès au profil réussi');
    console.log(`   Rôle dans le profil: ${profileResponse.data.role}`);

    // 3. Tester l'accès aux utilisateurs (route admin)
    console.log('\n3️⃣ Test d\'accès à la liste des utilisateurs...');
    const usersResponse = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Accès aux utilisateurs réussi');
    console.log(`   Nombre d'utilisateurs: ${usersResponse.data.length}`);

    // 4. Tester l'accès au dashboard (route admin)
    console.log('\n4️⃣ Test d\'accès au dashboard admin...');
    const dashboardResponse = await axios.get(`${API_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Accès au dashboard réussi');
    console.log(`   Données du dashboard:`, Object.keys(dashboardResponse.data));

    // 5. Tester l'accès aux routes académiques
    console.log('\n5️⃣ Test d\'accès aux routes académiques...');
    try {
      const academicResponse = await axios.get(`${API_URL}/academic/ecoles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Accès aux écoles réussi');
      console.log(`   Nombre d'écoles: ${academicResponse.data.length}`);
    } catch (err) {
      console.log('⚠️  Route écoles non disponible (normal si pas encore créée)');
    }

    console.log('\n✅ Tous les tests essentiels ont réussi ! Le superadministrateur a bien accès aux routes admin.');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
      console.error(`   Code: ${error.response.data.code || 'N/A'}`);
      console.error(`   Données complètes:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testSuperadminAccess();
