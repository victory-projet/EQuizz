#!/usr/bin/env node

/**
 * Script de test global pour toutes les fonctionnalités
 * Exécute tous les tests et génère un rapport complet
 */

const colors = require('colors');
const ForgotPasswordTester = require('./test-forgot-password');
const PaginationTester = require('./test-pagination');
const CoursEnseignantTester = require('./test-cours-enseignant');
const AdvancedReportsTester = require('./test-advanced-reports');
const StudentManagementTester = require('./test-student-management');

class GlobalTester {
  constructor() {
    this.allResults = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const coloredMessage = type === 'success' ? message.green : 
                          type === 'error' ? message.red : 
                          type === 'warning' ? message.yellow : 
                          type === 'header' ? message.cyan.bold : message;
    console.log(`[${timestamp}] ${coloredMessage}`);
  }

  async runTestSuite(name, TesterClass) {
    this.log(`\n${'='.repeat(60)}`, 'header');
    this.log(`🧪 SUITE DE TESTS: ${name}`, 'header');
    this.log(`${'='.repeat(60)}`, 'header');

    try {
      const tester = new TesterClass();
      
      // Capturer les résultats
      const originalLog = tester.log;
      const suiteResults = [];
      
      tester.log = (message, type) => {
        originalLog.call(tester, message, type);
        if (message.includes('PASS:') || message.includes('FAIL:')) {
          suiteResults.push({
            test: message.replace(/✅ PASS: |❌ FAIL: /, ''),
            status: message.includes('PASS:') ? 'PASS' : 'FAIL'
          });
        }
      };

      await tester.runAllTests();
      
      this.allResults.push({
        suite: name,
        results: tester.testResults || suiteResults,
        passed: (tester.testResults || suiteResults).filter(r => r.status === 'PASS').length,
        failed: (tester.testResults || suiteResults).filter(r => r.status === 'FAIL').length
      });

      return true;
    } catch (error) {
      this.log(`💥 Erreur dans la suite ${name}: ${error.message}`, 'error');
      this.allResults.push({
        suite: name,
        results: [],
        passed: 0,
        failed: 1,
        error: error.message
      });
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 DÉMARRAGE DES TESTS GLOBAUX', 'header');
    this.log('Vérification de toutes les fonctionnalités demandées\n', 'info');

    const testSuites = [
      { name: 'Mot de passe oublié', class: ForgotPasswordTester },
      { name: 'Pagination', class: PaginationTester },
      { name: 'Association Cours-Enseignant', class: CoursEnseignantTester },
      { name: 'Rapports Avancés', class: AdvancedReportsTester },
      { name: 'Gestion des Étudiants', class: StudentManagementTester }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.class);
      
      // Pause entre les suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.generateGlobalReport();
  }

  generateGlobalReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    this.log('\n' + '='.repeat(80), 'header');
    this.log('📊 RAPPORT GLOBAL DES TESTS', 'header');
    this.log('='.repeat(80), 'header');

    // Statistiques globales
    const totalPassed = this.allResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.allResults.reduce((sum, suite) => sum + suite.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    this.log(`⏱️  Durée totale: ${duration}s`, 'info');
    this.log(`🧪 Tests exécutés: ${totalTests}`, 'info');
    this.log(`✅ Tests réussis: ${totalPassed}`, 'success');
    this.log(`❌ Tests échoués: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info');
    this.log(`📈 Taux de réussite global: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');

    // Détail par suite
    this.log('\n📋 DÉTAIL PAR FONCTIONNALITÉ:', 'info');
    this.log('-'.repeat(80), 'info');

    this.allResults.forEach(suite => {
      const total = suite.passed + suite.failed;
      const rate = total > 0 ? ((suite.passed / total) * 100).toFixed(1) : 0;
      const status = suite.failed === 0 ? '✅' : suite.passed > suite.failed ? '⚠️' : '❌';
      
      this.log(`${status} ${suite.suite.padEnd(30)} ${suite.passed}/${total} (${rate}%)`, 
               suite.failed === 0 ? 'success' : 'warning');
    });

    // Échecs détaillés
    const failedSuites = this.allResults.filter(suite => suite.failed > 0);
    if (failedSuites.length > 0) {
      this.log('\n❌ ÉCHECS DÉTAILLÉS:', 'error');
      this.log('-'.repeat(80), 'error');

      failedSuites.forEach(suite => {
        this.log(`\n🔴 ${suite.suite}:`, 'error');
        const failedTests = suite.results.filter(r => r.status === 'FAIL');
        failedTests.forEach(test => {
          this.log(`  • ${test.description || test.test}: ${test.error || 'Échec'}`, 'error');
        });
      });
    }

    // Recommandations
    this.log('\n🎯 RECOMMANDATIONS:', 'warning');
    this.log('-'.repeat(80), 'warning');

    if (totalFailed === 0) {
      this.log('🎉 Toutes les fonctionnalités sont opérationnelles !', 'success');
      this.log('✅ Le système est prêt pour la production', 'success');
    } else {
      this.log('⚠️ Certaines fonctionnalités nécessitent une attention:', 'warning');
      
      if (failedSuites.some(s => s.suite.includes('Mot de passe'))) {
        this.log('  • Vérifiez la configuration email (SendGrid)', 'warning');
      }
      if (failedSuites.some(s => s.suite.includes('Pagination'))) {
        this.log('  • Vérifiez les endpoints de pagination', 'warning');
      }
      if (failedSuites.some(s => s.suite.includes('Cours-Enseignant'))) {
        this.log('  • Vérifiez les données de test (cours/enseignants)', 'warning');
      }
      if (failedSuites.some(s => s.suite.includes('Rapports'))) {
        this.log('  • Vérifiez les données d\'évaluations', 'warning');
      }
      if (failedSuites.some(s => s.suite.includes('Étudiants'))) {
        this.log('  • Vérifiez les permissions et la base de données', 'warning');
      }
    }

    this.log('\n🔧 ACTIONS SUGGÉRÉES:', 'info');
    this.log('  1. Vérifiez que le serveur backend est démarré', 'info');
    this.log('  2. Vérifiez la configuration de la base de données', 'info');
    this.log('  3. Vérifiez les variables d\'environnement', 'info');
    this.log('  4. Consultez les logs du serveur pour plus de détails', 'info');

    // Statut final
    this.log('\n' + '='.repeat(80), 'header');
    if (successRate >= 90) {
      this.log('🎉 STATUT: EXCELLENT - Système prêt pour la production', 'success');
    } else if (successRate >= 70) {
      this.log('⚠️ STATUT: BON - Quelques ajustements nécessaires', 'warning');
    } else {
      this.log('❌ STATUT: ATTENTION - Corrections importantes requises', 'error');
    }
    this.log('='.repeat(80), 'header');
  }
}

// Exécution des tests
if (require.main === module) {
  const globalTester = new GlobalTester();
  globalTester.runAllTests().catch(console.error);
}

module.exports = GlobalTester;