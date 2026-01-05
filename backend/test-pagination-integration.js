#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration de la pagination et des relations cours-enseignants
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';

// Configuration de test
const testConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 Connexion en tant qu\'administrateur...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      motDePasse: 'admin123'
    }, testConfig);
    
    authToken = response.data.token;
    console.log('✅ Connexion réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return false;
  }
}

async function testPaginationCours() {
  try {
    console.log('\n📚 Test de la pagination des cours...');
    
    // Test pagination page 1
    const response1 = await axios.get(`${BASE_URL}/cours?page=1&limit=5`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Pagination page 1:', {
      coursCount: response1.data.cours?.length || 0,
      pagination: response1.data.pagination
    });
    
    // Test avec recherche
    const response2 = await axios.get(`${BASE_URL}/cours?page=1&limit=5&search=info`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Recherche "info":', {
      coursCount: response2.data.cours?.length || 0,
      pagination: response2.data.pagination
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test pagination cours:', error.response?.data || error.message);
    return false;
  }
}

async function testPaginationClasses() {
  try {
    console.log('\n👥 Test de la pagination des classes...');
    
    const response = await axios.get(`${BASE_URL}/classes?page=1&limit=5`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Pagination classes:', {
      classesCount: response.data.classes?.length || 0,
      pagination: response.data.pagination
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test pagination classes:', error.response?.data || error.message);
    return false;
  }
}

async function testCoursEnseignantsRelation() {
  try {
    console.log('\n🧑‍🏫 Test des relations cours-enseignants...');
    
    // Récupérer les enseignants disponibles
    const enseignantsResponse = await axios.get(`${BASE_URL}/users?role=ENSEIGNANT`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const enseignants = enseignantsResponse.data.users || [];
    console.log(`📋 ${enseignants.length} enseignants disponibles`);
    
    if (enseignants.length >= 2) {
      // Créer un cours avec plusieurs enseignants
      const coursData = {
        nom: 'Test Cours Multiple Enseignants',
        code: 'TEST001',
        description: 'Cours de test pour relations many-to-many',
        enseignantIds: [enseignants[0].id, enseignants[1].id]
      };
      
      const createResponse = await axios.post(`${BASE_URL}/cours`, coursData, {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const coursId = createResponse.data.id;
      console.log('✅ Cours créé avec 2 enseignants:', coursId);
      
      // Vérifier que les enseignants sont bien associés
      const coursResponse = await axios.get(`${BASE_URL}/cours/${coursId}`, {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const enseignantsAssocies = coursResponse.data.Enseignants || [];
      console.log(`✅ ${enseignantsAssocies.length} enseignants associés au cours`);
      
      // Test d'ajout d'un enseignant supplémentaire
      if (enseignants.length >= 3) {
        await axios.post(`${BASE_URL}/cours/${coursId}/enseignants`, {
          enseignantId: enseignants[2].id
        }, {
          ...testConfig,
          headers: {
            ...testConfig.headers,
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('✅ Enseignant supplémentaire ajouté');
      }
      
      // Nettoyer - supprimer le cours de test
      await axios.delete(`${BASE_URL}/cours/${coursId}`, {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('✅ Cours de test supprimé');
    } else {
      console.log('⚠️  Pas assez d\'enseignants pour tester les relations multiples');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test relations cours-enseignants:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests d\'intégration pagination et cours-enseignants\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Impossible de se connecter, arrêt des tests');
    return;
  }
  
  const tests = [
    testPaginationCours,
    testPaginationClasses,
    testCoursEnseignantsRelation
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const success = await test();
    if (success) passedTests++;
  }
  
  console.log(`\n📊 Résultats: ${passedTests}/${tests.length} tests réussis`);
  
  if (passedTests === tests.length) {
    console.log('🎉 Tous les tests sont passés ! L\'intégration fonctionne correctement.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
}

// Exécuter les tests
runTests().catch(console.error);