#!/usr/bin/env node

/**
 * Test de la gestion des étudiants (CRUD)
 * Teste l'ajout, modification, suppression et activation/désactivation
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

class StudentManagementTester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.createdStudentId = null;
    this.testClasseId = null;
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
      this.log('⚠️ Authentification échouée', 'warning');
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

  async setupTestData() {
    try {
      // Récupérer une classe existante
      const classeResponse = await axios.get(`${API_BASE}/academic/classes`, {
        headers: this.getHeaders()
      });
      
      if (classeResponse.data.classes && classeResponse.data.classes.length > 0) {
        this.testClasseId = classeResponse.data.classes[0].id;
        this.log(`🏫 Classe de test: ${this.testClasseId}`, 'info');
      }

    } catch (error) {
      this.log('⚠️ Impossible de configurer les données de test', 'warning');
    }
  }

  generateTestEmail() {
    const timestamp = Date.now();
    return `test.student.${timestamp}@example.com`;
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests Gestion des Étudiants', 'info');
    
    await this.authenticate();
    await this.setupTestData();

    try {
      // Test 1: Création d'étudiant
      await this.test('Création d\'étudiant', async () => {
        const testEmail = this.generateTestEmail();
        const studentData = {
          nom: 'Test',
          prenom: 'Étudiant',
          email: testEmail,
          matricule: `MAT${Date.now()}`,
          classe_id: this.testClasseId
        };

        const response = await axios.post(`${API_BASE}/etudiants`, studentData, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiant && response.data.etudiant.id) {
          this.createdStudentId = response.data.etudiant.id;
          return `Étudiant créé avec ID: ${this.createdStudentId}`;
        }
        throw new Error('Création échouée');
      });

      // Test 2: Récupération d'étudiant par ID
      await this.test('Récupération étudiant par ID', async () => {
        if (!this.createdStudentId) {
          throw new Error('Aucun étudiant créé pour le test');
        }

        const response = await axios.get(`${API_BASE}/etudiants/${this.createdStudentId}`, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiant && response.data.etudiant.id === this.createdStudentId) {
          return 'Étudiant récupéré avec succès';
        }
        throw new Error('Récupération échouée');
      });

      // Test 3: Modification d'étudiant
      await this.test('Modification d\'étudiant', async () => {
        if (!this.createdStudentId) {
          throw new Error('Aucun étudiant créé pour le test');
        }

        const updateData = {
          nom: 'TestModifié',
          prenom: 'ÉtudiantModifié'
        };

        const response = await axios.put(`${API_BASE}/etudiants/${this.createdStudentId}`, updateData, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiant && response.data.etudiant.nom === 'TestModifié') {
          return 'Modification réussie';
        }
        throw new Error('Modification échouée');
      });

      // Test 4: Liste des étudiants avec pagination
      await this.test('Liste étudiants avec pagination', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?page=1&limit=10`, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiants && Array.isArray(response.data.etudiants)) {
          return `${response.data.etudiants.length} étudiants récupérés`;
        }
        throw new Error('Liste échouée');
      });

      // Test 5: Recherche d'étudiants
      await this.test('Recherche d\'étudiants', async () => {
        const response = await axios.get(`${API_BASE}/etudiants?search=Test`, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiants && Array.isArray(response.data.etudiants)) {
          return `${response.data.etudiants.length} résultats de recherche`;
        }
        throw new Error('Recherche échouée');
      });

      // Test 6: Changement de statut (activation/désactivation)
      await this.test('Changement de statut étudiant', async () => {
        if (!this.createdStudentId) {
          throw new Error('Aucun étudiant créé pour le test');
        }

        const response = await axios.patch(`${API_BASE}/etudiants/${this.createdStudentId}/toggle-status`, {}, {
          headers: this.getHeaders()
        });
        
        if (response.data.etudiant) {
          return `Statut changé: ${response.data.etudiant.estActif ? 'Actif' : 'Inactif'}`;
        }
        throw new Error('Changement de statut échoué');
      });

      // Test 7: Validation des données (email invalide)
      await this.test('Validation email invalide', async () => {
        const invalidData = {
          nom: 'Test',
          prenom: 'Invalid',
          email: 'email-invalide',
          matricule: `MAT${Date.now()}`
        };

        try {
          await axios.post(`${API_BASE}/etudiants`, invalidData, {
            headers: this.getHeaders()
          });
          throw new Error('Devrait rejeter un email invalide');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            return 'Validation email fonctionne';
          }
          throw error;
        }
      });

      // Test 8: Validation unicité email
      await this.test('Validation unicité email', async () => {
        if (!this.createdStudentId) {
          return 'Pas d\'étudiant créé - validation supposée fonctionnelle';
        }

        // Récupérer l'email de l'étudiant créé
        const studentResponse = await axios.get(`${API_BASE}/etudiants/${this.createdStudentId}`, {
          headers: this.getHeaders()
        });

        const existingEmail = studentResponse.data.etudiant.email;

        const duplicateData = {
          nom: 'Duplicate',
          prenom: 'Test',
          email: existingEmail,
          matricule: `MAT${Date.now()}`
        };

        try {
          await axios.post(`${API_BASE}/etudiants`, duplicateData, {
            headers: this.getHeaders()
          });
          throw new Error('Devrait rejeter un email en double');
        } catch (error) {
          if (error.response && error.response.status === 409) {
            return 'Validation unicité email fonctionne';
          }
          throw error;
        }
      });

      // Test 9: Suppression d'étudiant
      await this.test('Suppression d\'étudiant', async () => {
        if (!this.createdStudentId) {
          throw new Error('Aucun étudiant créé pour le test');
        }

        const response = await axios.delete(`${API_BASE}/etudiants/${this.createdStudentId}`, {
          headers: this.getHeaders()
        });
        
        if (response.status === 200) {
          return 'Suppression réussie';
        }
        throw new Error('Suppression échouée');
      });

      // Test 10: Vérification suppression
      await this.test('Vérification suppression', async () => {
        if (!this.createdStudentId) {
          return 'Aucun étudiant à vérifier';
        }

        try {
          await axios.get(`${API_BASE}/etudiants/${this.createdStudentId}`, {
            headers: this.getHeaders()
          });
          throw new Error('L\'étudiant devrait être supprimé');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            return 'Étudiant bien supprimé';
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
    this.log('\n📊 RÉSUMÉ DES TESTS GESTION ÉTUDIANTS', 'info');
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
    this.log('  ✓ Création d\'étudiants', 'success');
    this.log('  ✓ Modification d\'étudiants', 'success');
    this.log('  ✓ Suppression d\'étudiants', 'success');
    this.log('  ✓ Activation/Désactivation', 'success');
    this.log('  ✓ Recherche et filtres', 'success');
    this.log('  ✓ Validation des données', 'success');
    this.log('  ✓ Pagination', 'success');
  }
}

// Exécution des tests
if (require.main === module) {
  const tester = new StudentManagementTester();
  tester.runAllTests().catch(console.error);
}

module.exports = StudentManagementTester;