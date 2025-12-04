// Script pour tester la connexion à Aiven MySQL
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Test de connexion à Aiven MySQL...\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 60000,
  };

  // Ajouter SSL si en production
  if (process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: false
    };
  }

  console.log('Configuration:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    hasPassword: !!config.password,
    ssl: !!config.ssl
  });

  try {
    console.log('\n🔄 Tentative de connexion...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion établie avec succès!\n');

    // Tester une requête simple
    console.log('🔄 Test de requête...');
    const [rows] = await connection.execute('SELECT DATABASE() as db, VERSION() as version');
    console.log('✅ Requête réussie:');
    console.log('   Base de données:', rows[0].db);
    console.log('   Version MySQL:', rows[0].version);

    // Lister les tables existantes
    console.log('\n🔄 Liste des tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    if (tables.length > 0) {
      console.log('✅ Tables trouvées:');
      tables.forEach(table => {
        console.log('   -', Object.values(table)[0]);
      });
    } else {
      console.log('⚠️  Aucune table trouvée (base de données vide)');
      console.log('   Exécutez "npm run db:setup" pour créer les tables');
    }

    await connection.end();
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.error('\nDétails:', error);
    
    console.log('\n💡 Vérifications à faire:');
    console.log('   1. Les variables d\'environnement sont-elles correctes?');
    console.log('   2. Le service Aiven est-il actif?');
    console.log('   3. Les credentials sont-ils valides?');
    console.log('   4. Le port est-il correct? (généralement 12345 pour Aiven)');
    
    process.exit(1);
  }
}

testConnection();
