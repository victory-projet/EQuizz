// Script pour tester différentes configurations MySQL
const mysql = require('mysql2/promise');

async function testMySQLConnection() {
  const configurations = [
    { host: 'localhost', user: 'root', password: '', database: 'equizz_db' },
    { host: 'localhost', user: 'root', password: 'root', database: 'equizz_db' },
    { host: 'localhost', user: 'root', password: 'password', database: 'equizz_db' },
    { host: 'localhost', user: 'root', password: 'mysql', database: 'equizz_db' },
    { host: 'localhost', user: 'root', password: '123456', database: 'equizz_db' }
  ];

  console.log('🔍 Test de connexion MySQL avec différentes configurations...\n');

  for (let i = 0; i < configurations.length; i++) {
    const config = configurations[i];
    console.log(`${i + 1}. Test avec mot de passe: "${config.password || '(vide)'}"`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ Connexion réussie !');
      
      // Tester si la base de données existe
      try {
        await connection.execute('USE equizz_db');
        console.log('✅ Base de données "equizz_db" trouvée');
      } catch (dbError) {
        console.log('⚠️  Base de données "equizz_db" n\'existe pas, mais la connexion fonctionne');
        console.log('💡 Vous pouvez créer la base avec: CREATE DATABASE equizz_db;');
      }
      
      await connection.end();
      console.log(`\n🎉 Configuration fonctionnelle trouvée :`);
      console.log(`DB_HOST=localhost`);
      console.log(`DB_USER=root`);
      console.log(`DB_PASSWORD=${config.password}`);
      console.log(`DB_NAME=equizz_db`);
      console.log(`DB_DIALECT=mysql\n`);
      return;
      
    } catch (error) {
      console.log(`❌ Échec: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('❌ Aucune configuration fonctionnelle trouvée.');
  console.log('\n💡 Solutions possibles :');
  console.log('1. Vérifiez que MySQL est démarré');
  console.log('2. Réinitialisez le mot de passe root MySQL');
  console.log('3. Créez un nouvel utilisateur MySQL');
  console.log('4. Vérifiez le port MySQL (par défaut 3306)');
}

testMySQLConnection().catch(console.error);