#!/usr/bin/env node

// Script de démarrage rapide pour tester l'intégration
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage rapide EQuizz - Test d\'intégration');
console.log('=' .repeat(50));

async function quickStart() {
  try {
    // 1. Vérifier les prérequis
    console.log('\n1. 🔍 Vérification des prérequis...');
    
    // Vérifier Node.js
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Node.js: ${nodeVersion}`);
    } catch (error) {
      console.log('❌ Node.js non trouvé. Veuillez installer Node.js.');
      return;
    }

    // Vérifier npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ npm: ${npmVersion}`);
    } catch (error) {
      console.log('❌ npm non trouvé.');
      return;
    }

    // 2. Installer les dépendances backend
    console.log('\n2. 📦 Installation des dépendances backend...');
    if (fs.existsSync('backend/package.json')) {
      try {
        process.chdir('backend');
        console.log('   Installation en cours...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dépendances backend installées');
        process.chdir('..');
      } catch (error) {
        console.log('❌ Erreur lors de l\'installation des dépendances backend');
        process.chdir('..');
      }
    } else {
      console.log('⚠️  package.json backend non trouvé');
    }

    // 3. Configurer la base de données
    console.log('\n3. 🗄️ Configuration de la base de données...');
    
    if (fs.existsSync('backend/setup-mysql.js')) {
      console.log('   Tentative de configuration MySQL...');
      try {
        process.chdir('backend');
        execSync('node setup-mysql.js', { stdio: 'inherit' });
        process.chdir('..');
      } catch (error) {
        console.log('⚠️  Configuration MySQL échouée, essai avec SQLite...');
        process.chdir('..');
        
        // Fallback vers SQLite
        if (fs.existsSync('backend/test-with-sqlite.js')) {
          try {
            process.chdir('backend');
            execSync('node test-with-sqlite.js', { stdio: 'inherit' });
            
            // Copier la configuration SQLite
            if (fs.existsSync('.env.sqlite')) {
              fs.copyFileSync('.env.sqlite', '.env');
              console.log('✅ Configuration SQLite appliquée');
            }
            process.chdir('..');
          } catch (sqliteError) {
            console.log('❌ Configuration SQLite échouée également');
            process.chdir('..');
          }
        }
      }
    }

    // 4. Tester la connexion à la base de données
    console.log('\n4. 🔌 Test de connexion à la base de données...');
    
    if (fs.existsSync('backend/test-form-integration.js')) {
      try {
        process.chdir('backend');
        execSync('node test-form-integration.js', { stdio: 'inherit' });
        console.log('✅ Test d\'intégration réussi');
        process.chdir('..');
      } catch (error) {
        console.log('⚠️  Test d\'intégration échoué, mais on continue...');
        process.chdir('..');
      }
    }

    // 5. Démarrer le backend
    console.log('\n5. 🖥️ Démarrage du backend...');
    
    const backendProcess = spawn('npm', ['start'], {
      cwd: 'backend',
      stdio: 'pipe',
      shell: true
    });

    let backendReady = false;
    
    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);
      
      if (output.includes('Server running') || output.includes('listening') || output.includes('started')) {
        backendReady = true;
        console.log('✅ Backend démarré avec succès');
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.log(`[Backend Error] ${data.toString().trim()}`);
    });

    // Attendre que le backend soit prêt
    console.log('   Attente du démarrage du backend...');
    await new Promise(resolve => {
      const checkReady = setInterval(() => {
        if (backendReady) {
          clearInterval(checkReady);
          resolve();
        }
      }, 1000);
      
      // Timeout après 30 secondes
      setTimeout(() => {
        clearInterval(checkReady);
        resolve();
      }, 30000);
    });

    // 6. Installer les dépendances frontend
    console.log('\n6. 🅰️ Installation des dépendances frontend...');
    if (fs.existsSync('frontend-admin/package.json')) {
      try {
        process.chdir('frontend-admin');
        console.log('   Installation en cours...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dépendances frontend installées');
        process.chdir('..');
      } catch (error) {
        console.log('❌ Erreur lors de l\'installation des dépendances frontend');
        process.chdir('..');
      }
    }

    // 7. Démarrer le frontend
    console.log('\n7. 🌐 Démarrage du frontend...');
    
    const frontendProcess = spawn('ng', ['serve', '--port', '4200'], {
      cwd: 'frontend-admin',
      stdio: 'pipe',
      shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Frontend] ${output.trim()}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    // 8. Instructions finales
    console.log('\n🎉 Démarrage terminé !');
    console.log('=' .repeat(30));
    console.log('📋 Informations importantes :');
    console.log('   • Backend : http://localhost:8080');
    console.log('   • Frontend : http://localhost:4200');
    console.log('   • Formulaire d\'évaluation : http://localhost:4200/evaluations/create');
    console.log('');
    console.log('🧪 Pour tester le formulaire :');
    console.log('   1. Ouvrez http://localhost:4200');
    console.log('   2. Connectez-vous avec un compte admin');
    console.log('   3. Allez dans "Évaluations" > "Créer un Quiz"');
    console.log('   4. Testez le formulaire amélioré');
    console.log('');
    console.log('⚠️  Pour arrêter les serveurs : Ctrl+C');

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt des serveurs...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

    // Maintenir le processus en vie
    await new Promise(() => {});

  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage :', error.message);
    console.log('\n💡 Essayez les étapes manuelles :');
    console.log('   1. cd backend && npm install && npm start');
    console.log('   2. cd frontend-admin && npm install && ng serve');
  }
}

quickStart();