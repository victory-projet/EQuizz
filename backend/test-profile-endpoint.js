require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testProfileEndpoint() {
  console.log('🧪 Test de l\'endpoint /auth/me\n');
  
  try {
    // 1. Login avec le superadmin
    console.log('1️⃣ Connexion avec le superadmin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@universitesaintjean.org',
      motDePasse: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const loginUser = loginResponse.data.utilisateur;
    
    console.log('✅ Connexion réussie');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Utilisateur connecté:', {
      id: loginUser.id,
      nom: loginUser.nom,
      prenom: loginUser.prenom,
      email: loginUser.email,
      role: loginUser.role
    });
    
    // 2. Appeler /auth/me
    console.log('\n2️⃣ Appel de /auth/me...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const userData = meResponse.data;
    console.log('✅ Données du profil récupérées:');
    console.log(JSON.stringify(userData, null, 2));
    
    // 3. Vérifier les champs
    console.log('\n3️⃣ Vérification des champs:');
    const requiredFields = ['id', 'nom', 'prenom', 'email', 'role', 'estActif', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Champs manquants:', missingFields);
    } else {
      console.log('✅ Tous les champs requis sont présents');
    }
    
    // 4. Vérifier le rôle
    console.log('\n4️⃣ Vérification du rôle:');
    if (userData.role === 'SUPER-ADMIN') {
      console.log('✅ Le rôle est correct: SUPER-ADMIN');
    } else {
      console.log('❌ Le rôle est incorrect:', userData.role);
    }
    
    // 5. Vérifier l'email
    console.log('\n5️⃣ Vérification de l\'email:');
    if (userData.email === 'super.admin@universitesaintjean.org') {
      console.log('✅ L\'email est correct');
    } else {
      console.log('❌ L\'email est incorrect:', userData.email);
    }
    
    console.log('\n✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testProfileEndpoint();
