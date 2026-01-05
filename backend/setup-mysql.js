// Script pour configurer MySQL automatiquement
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupMySQL() {
  console.log('🔧 Configuration automatique de MySQL pour EQuizz');
  console.log('=' .repeat(50));

  // Configurations à tester
  const rootConfigs = [
    { host: 'localhost', user: 'root', password: '' },
    { host: 'localhost', user: 'root', password: 'root' },
    { host: 'localhost', user: 'root', password: 'password' },
    { host: 'localhost', user: 'root', password: 'mysql' }
  ];

  let workingConnection = null;

  // 1. Trouver une connexion qui fonctionne
  console.log('\n1. 🔍 Recherche d\'une connexion MySQL fonctionnelle...');
  for (const config of rootConfigs) {
    try {
      console.log(`   Tentative avec mot de passe: "${config.password || '(vide)'}"`);
      const connection = await mysql.createConnection(config);
      await connection.execute('SELECT 1');
      workingConnection = { connection, config };
      console.log('   ✅ Connexion trouvée !');
      break;
    } catch (error) {
      console.log(`   ❌ Échec: ${error.code}`);
    }
  }

  if (!workingConnection) {
    console.log('\n❌ Aucune connexion MySQL trouvée.');
    console.log('💡 Veuillez vérifier que MySQL est installé et démarré.');
    console.log('💡 Ou utilisez SQLite avec: node test-with-sqlite.js');
    return;
  }

  const { connection, config } = workingConnection;

  try {
    // 2. Créer la base de données si elle n'existe pas
    console.log('\n2. 🗄️  Création de la base de données...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS equizz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('   ✅ Base de données "equizz_db" créée/vérifiée');

    // 3. Créer un utilisateur dédié (optionnel)
    console.log('\n3. 👤 Configuration de l\'utilisateur...');
    try {
      await connection.execute('DROP USER IF EXISTS \'equizz_user\'@\'localhost\'');
      await connection.execute('CREATE USER \'equizz_user\'@\'localhost\' IDENTIFIED BY \'equizz_password\'');
      await connection.execute('GRANT ALL PRIVILEGES ON equizz_db.* TO \'equizz_user\'@\'localhost\'');
      await connection.execute('FLUSH PRIVILEGES');
      console.log('   ✅ Utilisateur "equizz_user" créé avec succès');
      
      // Tester la nouvelle connexion
      const testConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'equizz_user',
        password: 'equizz_password',
        database: 'equizz_db'
      });
      await testConnection.execute('SELECT 1');
      await testConnection.end();
      
      // Mettre à jour le .env avec le nouvel utilisateur
      updateEnvFile('equizz_user', 'equizz_password');
      console.log('   ✅ Fichier .env mis à jour avec le nouvel utilisateur');
      
    } catch (userError) {
      console.log('   ⚠️  Impossible de créer un utilisateur dédié, utilisation de root');
      updateEnvFile(config.user, config.password);
    }

    await connection.end();

    console.log('\n🎉 Configuration MySQL terminée avec succès !');
    console.log('\n📋 Configuration finale :');
    console.log('   Base de données : equizz_db');
    console.log('   Encodage : utf8mb4');
    console.log('   Fichier .env mis à jour');
    
    console.log('\n🚀 Vous pouvez maintenant lancer :');
    console.log('   node test-form-integration.js');

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration :', error.message);
  }
}

function updateEnvFile(user, password) {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Mettre à jour les variables de base de données
  envContent = envContent.replace(/^DB_USER=.*$/m, `DB_USER=${user}`);
  envContent = envContent.replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${password}`);
  
  fs.writeFileSync(envPath, envContent);
}

// Exécuter la configuration
setupMySQL().catch(console.error);