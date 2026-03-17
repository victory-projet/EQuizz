// Test complet: seed + authentification avec les données retournées
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSeedAndAuth() {
  try {
    console.log('🌱 1. Initialisation de la base de données...\n');
    
    // Réinitialiser la base de données
    const resetResponse = await axios.post(`${BASE_URL}/init/reset`);
    console.log('✅', resetResponse.data.message);
    
    // Peupler la base de données
    const seedResponse = await axios.post(`${BASE_URL}/init/seed`);
    const { credentials, data } = seedResponse.data;
    
    console.log('\n✅ Base de données peuplée:');
    console.log(`   - École: ${data.ecole}`);
    console.log(`   - Classes: ${data.classes}`);
    console.log(`   - Enseignants: ${data.enseignants}`);
    console.log(`   - Étudiants: ${data.etudiants}`);
    console.log(`   - Évaluations: ${data.evaluations}`);
    
    console.log('\n📋 Credentials disponibles:');
    console.log('   Superadmin:', credentials.superadmin.email);
    console.log('   Admin:', credentials.admin.email);
    console.log('   Enseignant:', credentials.enseignant.email);
    console.log('   Étudiant:', credentials.etudiant.email);
    
    // Test 1: Connexion Superadmin
    console.log('\n🔐 2. Test connexion Superadmin...');
    const superadminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: credentials.superadmin.email,
      motDePasse: credentials.superadmin.password
    });
    
    const { token: superadminToken, utilisateur: superadminData } = superadminLogin.data;
    console.log('✅ Superadmin connecté:');
    console.log(`   - Nom: ${superadminData.prenom} ${superadminData.nom}`);
    console.log(`   - Email: ${superadminData.email}`);
    console.log(`   - Rôle: ${superadminData.role}`);
    console.log(`   - ID: ${superadminData.id}`);
    
    // Vérifier que l'ID correspond
    if (superadminData.id === credentials.superadmin.id) {
      console.log('   ✅ ID correspond aux données de seed');
    } else {
      console.log('   ❌ ID ne correspond pas!');
    }
    
    // Test 2: Connexion Admin
    console.log('\n🔐 3. Test connexion Admin...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: credentials.admin.email,
      motDePasse: credentials.admin.password
    });
    
    const { token: adminToken, utilisateur: adminData } = adminLogin.data;
    console.log('✅ Admin connecté:');
    console.log(`   - Nom: ${adminData.prenom} ${adminData.nom}`);
    console.log(`   - Email: ${adminData.email}`);
    console.log(`   - Rôle: ${adminData.role}`);
    console.log(`   - ID: ${adminData.id}`);
    console.log(`   - École ID: ${adminData.ecoleId || 'N/A'}`);
    
    // Vérifier que l'ID correspond
    if (adminData.id === credentials.admin.id) {
      console.log('   ✅ ID correspond aux données de seed');
    } else {
      console.log('   ❌ ID ne correspond pas!');
    }
    
    // Test 3: Récupération des utilisateurs avec le token superadmin
    console.log('\n📋 4. Récupération des utilisateurs (avec token superadmin)...');
    const usersResponse = await axios.get(`${BASE_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
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
      console.log('\n👤 Superadministrateurs:');
      superadmins.forEach(sa => {
        console.log(`   - ${sa.prenom} ${sa.nom} (${sa.email})`);
        console.log(`     ID: ${sa.id}`);
      });
    }
    
    if (admins.length > 0) {
      console.log('\n👤 Administrateurs:');
      admins.forEach(a => {
        console.log(`   - ${a.prenom} ${a.nom} (${a.email})`);
        console.log(`     ID: ${a.id}, École: ${a.ecoleId || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Tous les tests réussis!');
    console.log('\n💡 Les données user sont maintenant disponibles dans la réponse de seed');
    console.log('   et peuvent être utilisées directement dans vos tests.');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\n💡 Vérifiez que le serveur backend est démarré et accessible.');
    }
    process.exit(1);
  }
}

testSeedAndAuth();
