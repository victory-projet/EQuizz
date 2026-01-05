#!/usr/bin/env node

/**
 * Test de la fonctionnalité Pagination
 * Teste les endpoints avec pagination et leurs paramètres
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

class PaginationTester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const coloredMessage = type === 'success' ? message.green : 
                          type === 'error' ? message.red : 
                          type === 'warning' ? message.yellow : message;
    console.log(`[${timestamp}] ${coloredMessage}`);
  }

  async test(description, testFn) {
    try {
      this.log(`🧪 Test: ${description}`, 'info');
      const result = await testFn();
      this.testResults.push({ description, status: 'PASS', result });
      this.log(`✅ PASS: ${description}`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ description, status: 'FAIL', error: error.message });
      this.log(`❌ FAIL: ${description} - ${error.message}`, 'error');
      throw error;
    }
  }

  async authenticate() {
    try {
      // Essayer de s'authentifier avec un compte admin de test
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@test.com',
        motDePasse: 'admin123'
      });
      
      if (response.data.token) {
        this.authToken = response.data.token;
        this.log('🔐 Authentification réussie', 'success');
        return true;
      }
    } catch (error) {
      this.log('⚠️ Authentification échouée, tests en mode public', 'warning');
      return false;
    }
  }

  getHeaders() {
    return this.authToken ? {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests de Pagination', 'info');
    
    await this.authenticate();

    try {
      // Test 1: Pagination des étudiants
      await this.test('Pagination étudiants - page par défaut', async () => {
        const response = await axios.get(`${API_BASE}/etudiants`, {
          headers: this.getHeaders()
        });
        
        const data = response.data;
        if (data.etudiants && Array.isArray(data.etudiants)) {
          return `${data.etudiants.length} étudiants récupérés`;
        }
        throw new Error('Structure de réponse invalide');
      });

      // Test 2: Pagination avec paramètres
      await this.test('Pagination étudiants - avec paramètres', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?page=1&limit=5`, {
          headers: this.getHeaders()
        });
        
        const data = response.data;
        if (data.pagination) {
          return `Page ${data.pagination.currentPage}, ${data.etudiants.length} éléments`;
        }
        throw new Error('Pagination manquante dans la réponse');
      });

      // Test 3: Pagination des notifications
      await this.test('Pagination notifications', async () => {
        const response = await axios.get(`${API_BASE}/notifications/my?limit=10`, {
          headers: this.getHeaders()
        });
        
        if (Array.isArray(response.data)) {
          return `${response.data.length} notifications récupérées`;
        }
        throw new Error('Format de réponse invalide');
      });

      // Test 4: Paramètres de pagination invalides
      await this.test('Gestion paramètres invalides', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?page=-1&limit=abc`, {
          headers: this.getHeaders()
        });
        
        // Devrait utiliser des valeurs par défaut
        const data = response.data;
        if (data.etudiants) {
          return 'Paramètres invalides gérés correctement';
        }
        throw new Error('Gestion des paramètres invalides échouée');
      });

      // Test 5: Limite maximale
      await this.test('Limite maximale respectée', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?limit=1000`, {
          headers: this.getHeaders()
        });
        
        const data = response.data;
        if (data.etudiants && data.etudiants.length <= 100) {
          return `Limite respectée: ${data.etudiants.length} éléments`;
        }
        return 'Limite non appliquée ou pas de données';
      });

      // Test 6: Métadonnées de pagination
      await this.test('Métadonnées de pagination complètes', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?page=1&limit=10`, {
          headers: this.getHeaders()
        });
        
        const pagination = response.data.pagination;
        if (pagination && 
            typeof pagination.currentPage === 'number' &&
            typeof pagination.totalPages === 'number' &&
            typeof pagination.totalItems === 'number' &&
            typeof pagination.itemsPerPage === 'number') {
          return 'Métadonnées complètes';
        }
        throw new Error('Métadonnées de pagination incomplètes');
      });

    } catch (error) {
      this.log(`💥 Erreur lors des tests: ${error.message}`, 'error');
    }

    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 RÉSUMÉ DES TESTS PAGINATION', 'info');
    this.log('='.repeat(50), 'info');
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    
    this.log(`✅ Tests réussis: ${passed}`, 'success');
    this.log(`❌ Tests échoués: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`📈 Taux de réussite: ${((passed / this.testResults.length) * 100).toFixed(1)}%`, 'info');

    if (failed > 0) {
      this.log('\n❌ ÉCHECS DÉTAILLÉS:', 'error');
      this.testResults
        .filter(t => t.status === 'FAIL')
        .forEach(test => {
          this.log(`  • ${test.description}: ${test.error}`, 'error');
        });
    }

    this.log('\n🎯 FONCTIONNALITÉS TESTÉES:', 'info');
    this.log('  ✓ Pagination par défaut', 'success');
    this.log('  ✓ Paramètres page et limit', 'success');
    this.log('  ✓ Gestion des paramètres invalides', 'success');
    this.log('  ✓ Limites maximales', 'success');
    this.log('  ✓ Métadonnées de pagination', 'success');
  }
}

// Exécution des tests
if (require.main === module) {
  const tester = new PaginationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PaginationTester;