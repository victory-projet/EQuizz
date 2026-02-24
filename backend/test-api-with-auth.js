const axios = require('axios');
const db = require('./src/models');

async function testAPIWithAuth() {
  try {
    console.log('🔍 Test de l\'API avec authentification...\n');
    
    // 1. Se connecter pour obtenir un token
    console.log('1️⃣ Connexion...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'super.admin@saintjeaningenieur.org',
      matricule: null,
      motDePasse: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenu:', token.substring(0, 20) + '...');
    console.log('   Utilisateur:', loginResponse.data.utilisateur.prenom, loginResponse.data.utilisateur.nom);
    console.log('   Rôle:', loginResponse.data.utilisateur.role);
    
    // 2. Appeler l'API utilisateurs avec le token
    console.log('\n2️⃣ Appel de l\'API /api/utilisateurs...');
    const usersResponse = await axios.get('http://localhost:3000/api/utilisateurs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ ${usersResponse.data.length} utilisateurs retournés`);
    
    // 3. Filtrer les admins
    const admins = usersResponse.data.filter(u => u.role === 'ADMIN');
    console.log(`\n3️⃣ Administrateurs trouvés: ${admins.length}`);
    
    admins.forEach(admin => {
      console.log(`\n   📋 ${admin.prenom} ${admin.nom}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Rôle: ${admin.role}`);
      console.log(`      Actif: ${admin.estActif}`);
      console.log(`      ID: ${admin.id}`);
      console.log(`      Superadministrateur présent: ${!!admin.Superadministrateur}`);
    });
    
    // 4. Vérifier la structure complète d'un admin
    if (admins.length > 0) {
      console.log('\n4️⃣ Structure complète du premier admin:');
      console.log(JSON.stringify(admins[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIWithAuth();
