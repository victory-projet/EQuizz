// Test pour vérifier que le superadmin a le bon rôle
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'super.admin@universitesaintjean.org';
const ADMIN_PASSWORD = 'admin123';

async function testSuperadminRole() {
  try {
    console.log('🔐 Test du rôle superadmin...\n');

    // 1. Login
    console.log('1️⃣ Connexion avec:', ADMIN_EMAIL);
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      motDePasse: ADMIN_PASSWORD
    });

    const { token, utilisateur } = loginResponse.data;
    console.log('✅ Connexion réussie');
    console.log('   Utilisateur:', utilisateur.prenom, utilisateur.nom);
    console.log('   Rôle:', utilisateur.role);
    console.log('   ID:', utilisateur.id);

    if (utilisateur.role !== 'SUPER-ADMIN') {
      console.error('❌ ERREUR: Le rôle devrait être SUPER-ADMIN mais est:', utilisateur.role);
      return;
    }

    // 2. Récupérer tous les utilisateurs
    console.log('\n2️⃣ Récupération de tous les utilisateurs...');
    const usersResponse = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = usersResponse.data;
    console.log(`✅ ${users.length} utilisateurs trouvés`);

    // 3. Filtrer les superadmins
    const superadmins = users.filter(u => u.role === 'SUPER-ADMIN');
    console.log(`\n3️⃣ Superadministrateurs trouvés: ${superadmins.length}`);
    
    if (superadmins.length === 0) {
      console.error('❌ ERREUR: Aucun superadministrateur trouvé!');
      console.log('\nRôles trouvés:');
      const roles = [...new Set(users.map(u => u.role))];
      roles.forEach(role => {
        const count = users.filter(u => u.role === role).length;
        console.log(`   - ${role}: ${count}`);
      });
      return;
    }

    superadmins.forEach(admin => {
      console.log(`   - ${admin.prenom} ${admin.nom} (${admin.email})`);
      console.log(`     ID: ${admin.id}, Rôle: ${admin.role}`);
    });

    // 4. Vérifier le token JWT
    console.log('\n4️⃣ Vérification du token JWT...');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('   Token contient:');
    console.log('   - ID:', decoded.id);
    console.log('   - Email:', decoded.email);
    console.log('   - Rôle:', decoded.role);

    if (decoded.role !== 'super-admin') {
      console.warn('⚠️  ATTENTION: Le token contient le rôle "' + decoded.role + '" au lieu de "super-admin"');
      console.log('   (Ceci est normal si le token a été généré avant la mise à jour)');
    }

    console.log('\n✅ Test terminé avec succès!');
    console.log('\n📝 Instructions pour le frontend:');
    console.log('   1. Videz le localStorage du navigateur (F12 > Application > Local Storage > Clear)');
    console.log('   2. Reconnectez-vous avec:', ADMIN_EMAIL);
    console.log('   3. Le rôle devrait maintenant être SUPER-ADMIN');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Vérifiez que:');
      console.log('   - Le backend est démarré (npm start dans backend/)');
      console.log('   - Les identifiants sont corrects');
    }
  }
}

testSuperadminRole();
