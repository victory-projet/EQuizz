// Test complet pour vérifier la communication frontend-backend
require('dotenv').config();
const axios = require('axios');

async function testFrontendBackend() {
  try {
    console.log('🔐 1. Test de connexion...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const { token, utilisateur } = loginResponse.data;
    console.log('✅ Connexion réussie');
    console.log('   Utilisateur:', utilisateur.prenom, utilisateur.nom);
    console.log('   Rôle:', utilisateur.role);
    console.log('   Email:', utilisateur.email);

    console.log('\n📋 2. Test de récupération des utilisateurs...');
    const usersResponse = await axios.get('http://localhost:3000/api/utilisateurs', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    console.log(`✅ ${users.length} utilisateurs récupérés`);

    // Filtrer les superadmins
    const superadmins = users.filter(u => u.role === 'SUPER-ADMIN');
    console.log(`\n📊 Superadministrateurs: ${superadmins.length}`);
    
    if (superadmins.length > 0) {
      superadmins.forEach(sa => {
        console.log(`   - ${sa.prenom} ${sa.nom}`);
        console.log(`     Email: ${sa.email}`);
        console.log(`     ID: ${sa.id}`);
        console.log(`     Rôle: ${sa.role}`);
        console.log(`     Actif: ${sa.estActif}`);
      });
    } else {
      console.log('❌ Aucun superadministrateur trouvé!');
      console.log('\n🔍 Tous les utilisateurs:');
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFrontendBackend();
