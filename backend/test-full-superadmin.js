// Test complet: login + récupération des utilisateurs
require('dotenv').config();
const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🔐 1. Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const { token, utilisateur } = loginResponse.data;
    console.log('✅ Connecté:', utilisateur.prenom, utilisateur.nom);
    console.log('   Rôle:', utilisateur.role);

    // Décoder le token pour voir ce qu'il contient
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\n🔑 Token JWT contient:');
    console.log('   Rôle dans le token:', decoded.role);

    console.log('\n📋 2. Récupération des utilisateurs...');
    const usersResponse = await axios.get('http://localhost:3000/api/utilisateurs', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    console.log(`✅ ${users.length} utilisateurs récupérés`);

    // Filtrer par rôle
    const superadmins = users.filter(u => u.role === 'SUPER-ADMIN');
    const admins = users.filter(u => u.role === 'ADMIN');
    const enseignants = users.filter(u => u.role === 'ENSEIGNANT');
    const etudiants = users.filter(u => u.role === 'ETUDIANT');

    console.log('\n📊 Répartition par rôle:');
    console.log(`   SUPER-ADMIN: ${superadmins.length}`);
    console.log(`   ADMIN: ${admins.length}`);
    console.log(`   ENSEIGNANT: ${enseignants.length}`);
    console.log(`   ETUDIANT: ${etudiants.length}`);

    if (superadmins.length > 0) {
      console.log('\n✅ Superadministrateurs:');
      superadmins.forEach(sa => {
        console.log(`   - ${sa.prenom} ${sa.nom} (${sa.email})`);
      });
    } else {
      console.log('\n❌ Aucun superadministrateur trouvé!');
    }

    console.log('\n✅ Test réussi!');

  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\n💡 Le serveur backend doit être redémarré pour que les changements prennent effet.');
    }
  }
}

testFullFlow();
