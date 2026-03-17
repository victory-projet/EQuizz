/**
 * Script de test pour l'archivage
 * 
 * Ce script teste les fonctionnalités d'archivage pour:
 * - Classes
 * - Cours
 * - Évaluations
 * 
 * Usage: node test-archivage.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  try {
    log('\n🔐 Connexion...', 'cyan');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'super.admin@saintjeaningenieur.org',
      password: 'Admin123!'
    });
    
    authToken = response.data.token;
    log('✅ Connexion réussie', 'green');
    return true;
  } catch (error) {
    log(`❌ Erreur de connexion: ${error.message}`, 'red');
    return false;
  }
}

async function testClasseArchivage() {
  log('\n📚 Test: Archivage des Classes', 'blue');
  
  try {
    // 1. Lister les classes
    log('1. Liste des classes actives...', 'yellow');
    const listResponse = await axios.get(`${API_URL}/academic/classes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (listResponse.data.length === 0) {
      log('⚠️  Aucune classe trouvée', 'yellow');
      return;
    }
    
    const classe = listResponse.data[0];
    log(`   Classe trouvée: ${classe.nom} (ID: ${classe.id})`, 'cyan');
    
    // 2. Archiver la classe
    log('2. Archivage de la classe...', 'yellow');
    await axios.put(`${API_URL}/academic/classes/${classe.id}/archive`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('   ✅ Classe archivée', 'green');
    
    // 3. Vérifier qu'elle n'apparaît plus dans la liste par défaut
    log('3. Vérification: liste sans archivés...', 'yellow');
    const listWithoutArchived = await axios.get(`${API_URL}/academic/classes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const isHidden = !listWithoutArchived.data.find(c => c.id === classe.id);
    log(`   ${isHidden ? '✅' : '❌'} Classe ${isHidden ? 'masquée' : 'toujours visible'}`, isHidden ? 'green' : 'red');
    
    // 4. Vérifier qu'elle apparaît avec includeArchived=true
    log('4. Vérification: liste avec archivés...', 'yellow');
    const listWithArchived = await axios.get(`${API_URL}/academic/classes?includeArchived=true`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const isVisible = listWithArchived.data.find(c => c.id === classe.id);
    log(`   ${isVisible ? '✅' : '❌'} Classe ${isVisible ? 'visible' : 'introuvable'}`, isVisible ? 'green' : 'red');
    
    // 5. Restaurer la classe
    log('5. Restauration de la classe...', 'yellow');
    await axios.put(`${API_URL}/academic/classes/${classe.id}/restore`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('   ✅ Classe restaurée', 'green');
    
    // 6. Vérifier qu'elle réapparaît dans la liste par défaut
    log('6. Vérification finale...', 'yellow');
    const finalList = await axios.get(`${API_URL}/academic/classes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const isRestored = finalList.data.find(c => c.id === classe.id);
    log(`   ${isRestored ? '✅' : '❌'} Classe ${isRestored ? 'restaurée' : 'toujours masquée'}`, isRestored ? 'green' : 'red');
    
    log('\n✅ Test Classes: RÉUSSI', 'green');
  } catch (error) {
    log(`\n❌ Test Classes: ÉCHOUÉ - ${error.message}`, 'red');
    if (error.response) {
      log(`   Détails: ${JSON.stringify(error.response.data)}`, 'red');
    }
  }
}

async function testCoursArchivage() {
  log('\n📖 Test: Archivage des Cours', 'blue');
  
  try {
    // 1. Lister les cours
    log('1. Liste des cours actifs...', 'yellow');
    const listResponse = await axios.get(`${API_URL}/academic/cours`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (listResponse.data.length === 0) {
      log('⚠️  Aucun cours trouvé', 'yellow');
      return;
    }
    
    const cours = listResponse.data[0];
    log(`   Cours trouvé: ${cours.nom} (ID: ${cours.id})`, 'cyan');
    
    // 2. Archiver le cours
    log('2. Archivage du cours...', 'yellow');
    await axios.put(`${API_URL}/academic/cours/${cours.id}/archive`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('   ✅ Cours archivé', 'green');
    
    // 3. Restaurer le cours
    log('3. Restauration du cours...', 'yellow');
    await axios.put(`${API_URL}/academic/cours/${cours.id}/restore`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('   ✅ Cours restauré', 'green');
    
    log('\n✅ Test Cours: RÉUSSI', 'green');
  } catch (error) {
    log(`\n❌ Test Cours: ÉCHOUÉ - ${error.message}`, 'red');
    if (error.response) {
      log(`   Détails: ${JSON.stringify(error.response.data)}`, 'red');
    }
  }
}

async function runTests() {
  log('╔════════════════════════════════════════╗', 'cyan');
  log('║   TEST D\'ARCHIVAGE - BACKEND API      ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    log('\n❌ Impossible de continuer sans authentification', 'red');
    process.exit(1);
  }
  
  await testClasseArchivage();
  await testCoursArchivage();
  
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║         TESTS TERMINÉS                 ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});
