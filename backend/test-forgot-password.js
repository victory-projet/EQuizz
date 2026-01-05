#!/usr/bin/env node

/**
 * Test de la fonctionnalité "Mot de passe oublié"
 * Teste le workflow complet : demande → validation → reset
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
const TEST_EMAIL = 'test.forgot@example.com';

class ForgotPasswordTester {
  constructor() {
    this.testResults = [];
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

  async runAllTests() {
    this.log('🚀 Démarrage des tests "Mot de passe oublié"', 'info');
    
    try {
      // Test 1: Vérifier que l'endpoint existe
      await this.test('Endpoint /auth/forgot-password existe', async () => {
        const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
          email: 'nonexistent@example.com'
        });
        return response.status;
      });

      // Test 2: Demande avec email invalide
      await this.test('Demande avec email invalide', async () => {
        try {
          await axios.post(`${API_BASE}/auth/forgot-password`, {
            email: 'invalid-email'
          });
          throw new Error('Devrait échouer avec email invalide');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            return 'Email invalide correctement rejeté';
          }
          throw error;
        }
      });

      // Test 3: Demande avec email inexistant
      await this.test('Demande avec email inexistant', async () => {
        const response = await axios.post(`${API_BASE}/auth/forgot-password`, {
          email: 'inexistant@example.com'
        });
        
        // Même si l'email n'existe pas, on retourne success pour la sécurité
        if (response.status === 200) {
          return 'Réponse sécurisée pour email inexistant';
        }
        throw new Error('Réponse inattendue');
      });

      // Test 4: Vérifier l'endpoint de validation de token
      await this.test('Endpoint validation token existe', async () => {
        try {
          await axios.get(`${API_BASE}/auth/validate-reset-token/invalid-token`);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            return 'Endpoint validation fonctionne';
          }
          throw error;
        }
      });

      // Test 5: Vérifier l'endpoint de reset
      await this.test('Endpoint reset password existe', async () => {
        try {
          await axios.post(`${API_BASE}/auth/reset-password`, {
            token: 'invalid-token',
            newPassword: 'newpass123',
            confirmPassword: 'newpass123'
          });
        } catch (error) {
          if (error.response && error.response.status === 400) {
            return 'Endpoint reset fonctionne';
          }
          throw error;
        }
      });

      // Test 6: Vérifier la validation des mots de passe
      await this.test('Validation mots de passe différents', async () => {
        try {
          await axios.post(`${API_BASE}/auth/reset-password`, {
            token: 'some-token',
            newPassword: 'password1',
            confirmPassword: 'password2'
          });
          throw new Error('Devrait échouer avec mots de passe différents');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            return 'Validation mots de passe fonctionne';
          }
          throw error;
        }
      });

    } catch (error) {
      this.log(`💥 Erreur lors des tests: ${error.message}`, 'error');
    }

    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 RÉSUMÉ DES TESTS', 'info');
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

    this.log('\n🎯 RECOMMANDATIONS:', 'warning');
    this.log('  • Vérifiez que le serveur backend est démarré', 'warning');
    this.log('  • Vérifiez la configuration de la base de données', 'warning');
    this.log('  • Vérifiez la configuration email (SendGrid)', 'warning');
  }
}

// Exécution des tests
if (require.main === module) {
  const tester = new ForgotPasswordTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ForgotPasswordTester;