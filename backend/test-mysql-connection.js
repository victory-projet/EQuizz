// backend/test-mysql-connection.js
// Script pour tester la connexion MySQL

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('\n=== TEST DE CONNEXION MYSQL ===\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  console.log('Configuration utilisée :');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  User:', config.user);
  console.log('  Password:', config.password ? '***' + config.password.slice(-2) : '(vide)');
  console.log('  Database:', process.env.DB_NAME);
  console.log('');

  try {
    // Test 1 : Connexion au serveur MySQL (sans base de données)
    console.log('Test 1 : Connexion au serveur MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('  ✅ Connexion au serveur MySQL réussie !\n');

    // Test 2 : Vérifier si la base de données existe
    console.log('Test 2 : Vérification de la base de données...');
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);

    if (dbExists) {
      console.log(`  ✅ La base de données "${process.env.DB_NAME}" existe !\n`);
    } else {
      console.log(`  ❌ La base de données "${process.env.DB_NAME}" n'existe pas !\n`);
      console.log('Bases de données disponibles :');
      databases.forEach(db => console.log('  -', db.Database));
      console.log('');
      console.log('Pour créer la base de données, exécutez :');
      console.log(`  CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log('');
      
      // Proposer de créer la base de données
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Voulez-vous créer la base de données maintenant ? (o/n) : ', async (answer) => {
        if (answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui') {
          try {
            await connection.query(`CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log(`\n✅ Base de données "${process.env.DB_NAME}" créée avec succès !\n`);
            console.log('Vous pouvez maintenant exécuter : node add-historique-table.js\n');
          } catch (error) {
            console.error('\n❌ Erreur lors de la création de la base de données :', error.message);
          }
        } else {
          console.log('\nCréation annulée. Créez la base manuellement dans phpMyAdmin.\n');
        }
        readline.close();
        await connection.end();
      });
      return;
    }

    // Test 3 : Connexion à la base de données spécifique
    console.log('Test 3 : Connexion à la base de données...');
    await connection.changeUser({ database: process.env.DB_NAME });
    console.log('  ✅ Connexion à la base de données réussie !\n');

    // Test 4 : Lister les tables
    console.log('Test 4 : Liste des tables existantes...');
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length > 0) {
      console.log(`  ✅ ${tables.length} table(s) trouvée(s) :`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log('    -', tableName);
      });
    } else {
      console.log('  ℹ️  Aucune table trouvée (base de données vide)');
    }
    console.log('');

    // Test 5 : Vérifier si HistoriqueEtudiant existe
    console.log('Test 5 : Vérification de la table HistoriqueEtudiant...');
    const historiqueExists = tables.some(table => Object.values(table)[0] === 'HistoriqueEtudiant');
    if (historiqueExists) {
      console.log('  ✅ La table HistoriqueEtudiant existe déjà !');
      const [structure] = await connection.query('DESCRIBE HistoriqueEtudiant');
      console.log('\n  Structure de la table :');
      console.table(structure);
    } else {
      console.log('  ℹ️  La table HistoriqueEtudiant n\'existe pas encore');
      console.log('  💡 Exécutez : node add-historique-table.js pour la créer\n');
    }

    await connection.end();
    console.log('\n✅ TOUS LES TESTS SONT PASSÉS !\n');

  } catch (error) {
    console.error('\n❌ ERREUR DE CONNEXION :\n');
    console.error('Message :', error.message);
    console.error('Code :', error.code);
    console.error('');

    // Diagnostics selon le type d'erreur
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 SOLUTION : MySQL n\'est pas démarré');
      console.log('   - Démarrez XAMPP/WAMP/MAMP');
      console.log('   - OU démarrez MySQL manuellement');
      console.log('   - Testez en ouvrant phpMyAdmin : http://localhost/phpmyadmin\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 SOLUTION : Identifiants incorrects');
      console.log('   - Vérifiez DB_USER dans .env (actuellement:', config.user + ')');
      console.log('   - Vérifiez DB_PASSWORD dans .env');
      console.log('   - Essayez de vous connecter à phpMyAdmin avec ces identifiants\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 SOLUTION : La base de données n\'existe pas');
      console.log('   - Créez la base dans phpMyAdmin');
      console.log('   - OU exécutez ce SQL :');
      console.log(`     CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`);
    } else {
      console.log('💡 SOLUTION : Erreur inconnue');
      console.log('   - Vérifiez que MySQL est démarré');
      console.log('   - Vérifiez les paramètres dans .env');
      console.log('   - Consultez les logs MySQL\n');
    }
  }
}

testConnection();
