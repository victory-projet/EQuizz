// Script de démarrage pour le développement avec configuration automatique
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du serveur de développement EQuizz');
console.log('=' .repeat(50));

async function startDevelopment() {
  try {
    // 1. Vérifier la configuration de la base de données
    console.log('\n1. 🔍 Vérification de la configuration...');
    
    if (!fs.existsSync('.env')) {
      console.log('⚠️  Fichier .env manquant, création avec SQLite...');
      
      if (fs.existsSync('.env.sqlite')) {
        fs.copyFileSync('.env.sqlite', '.env');
        console.log('✅ Configuration SQLite appliquée');
      } else {
        // Créer une configuration SQLite par défaut
        const defaultEnv = `# Configuration SQLite pour développement
DB_HOST=localhost
DB_USER=
DB_PASSWORD=
DB_NAME=./database.sqlite
DB_DIALECT=sqlite

# Configuration JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=8h

# Configuration du serveur
PORT=8080
NODE_ENV=development

# Configuration Frontend
FRONTEND_URL=http://localhost:4200

# Configuration Email (optionnel pour dev)
SENDGRID_API_KEY=
SENDGRID_VERIFIED_SENDER=

# Configuration Google AI (optionnel)
GOOGLE_AI_API_KEY=
`;
        fs.writeFileSync('.env', defaultEnv);
        console.log('✅ Configuration par défaut créée avec SQLite');
      }
    }

    // 2. Installer les dépendances si nécessaire
    console.log('\n2. 📦 Vérification des dépendances...');
    
    if (!fs.existsSync('node_modules')) {
      console.log('   Installation des dépendances...');
      const npmInstall = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
      
      await new Promise((resolve, reject) => {
        npmInstall.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Dépendances installées');
            resolve();
          } else {
            reject(new Error('Erreur lors de l\'installation des dépendances'));
          }
        });
      });
    } else {
      console.log('✅ Dépendances déjà installées');
    }

    // 3. Tester la connexion à la base de données
    console.log('\n3. 🗄️ Test de la base de données...');
    
    try {
      const db = require('./src/models');
      await db.sequelize.authenticate();
      console.log('✅ Connexion à la base de données réussie');
      
      // Synchroniser les modèles
      await db.sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés');
      
      // Vérifier s'il faut initialiser les données
      const userCount = await db.Utilisateur.count();
      if (userCount === 0) {
        console.log('🌱 Base de données vide, initialisation...');
        const { seedDatabase } = require('./src/routes/init.routes');
        await seedDatabase();
        console.log('✅ Données d\'initialisation créées');
      }
      
    } catch (dbError) {
      console.log('⚠️  Problème de base de données, mais on continue...');
      console.log(`   Erreur: ${dbError.message}`);
    }

    // 4. Démarrer le serveur
    console.log('\n4. 🖥️ Démarrage du serveur...');
    
    const serverProcess = spawn('npm', ['start'], { 
      stdio: 'inherit', 
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt du serveur...');
      serverProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Arrêt du serveur...');
      serverProcess.kill();
      process.exit(0);
    });

    serverProcess.on('close', (code) => {
      console.log(`\n📊 Serveur arrêté avec le code: ${code}`);
      process.exit(code);
    });

  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('   1. Vérifiez que Node.js est installé');
    console.log('   2. Vérifiez les permissions du dossier');
    console.log('   3. Essayez: npm install && npm start');
    process.exit(1);
  }
}

startDevelopment();