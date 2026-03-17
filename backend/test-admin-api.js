// Script pour tester l'API des administrateurs
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testAdminAPI() {
  try {
    console.log('🧪 Test de l\'API des administrateurs\n');

    // 1. Connexion en tant que superadmin
    console.log('1️⃣ Connexion en tant que superadministrateur...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie\n');

    // 2. Récupérer tous les utilisateurs
    console.log('2️⃣ Récupération de tous les utilisateurs...');
    const usersResponse = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    console.log(`✅ ${users.length} utilisateurs récupérés\n`);

    // 3. Filtrer les administrateurs
    const admins = users.filter(u => u.role === 'ADMIN');
    console.log(`3️⃣ Administrateurs trouvés: ${admins.length}\n`);

    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log('📋 Administrateur:');
        console.log(`   Nom: ${admin.nom} ${admin.prenom}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Rôle: ${admin.role}`);
        console.log(`   École: ${admin.ecole?.nom || 'Non assigné'}`);
        console.log(`   École ID: ${admin.ecole?.id || 'N/A'}`);
        console.log(`   Actif: ${admin.estActif ? 'Oui' : 'Non'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Aucun administrateur trouvé dans la réponse de l\'API');
      console.log('\n📊 Répartition des rôles:');
      const roles = {};
      users.forEach(u => {
        roles[u.role] = (roles[u.role] || 0) + 1;
      });
      Object.keys(roles).forEach(role => {
        console.log(`   ${role}: ${roles[role]}`);
      });
    }

    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testAdminAPI();
